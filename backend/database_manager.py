"""
Database management module for MongoDB and Cassandra integration
"""

import os
from typing import Dict, List, Any, Optional
from datetime import datetime, timedelta
import json

# MongoDB
try:
    from pymongo import MongoClient
    from pymongo.errors import ConnectionFailure, ServerSelectionTimeoutError
    MONGODB_AVAILABLE = True
except (ImportError, Exception) as e:
    MONGODB_AVAILABLE = False
    MongoClient = None
    MongoClient_ = None
    ConnectionFailure = None
    ServerSelectionTimeoutError = None
    print(f"MongoDB driver not available: {e}")

# Cassandra - defer imports until needed due to Python 3.13 compatibility issues
CASSANDRA_AVAILABLE = False
Cluster = None
PlainTextAuthProvider = None
DCAwareRoundRobinPolicy = None

try:
    import cassandra
    from cassandra.cluster import Cluster
    from cassandra.auth import PlainTextAuthProvider
    from cassandra.policies import DCAwareRoundRobinPolicy
    CASSANDRA_AVAILABLE = True
except Exception:
    # Catch all exceptions including DependencyException
    CASSANDRA_AVAILABLE = False
    print("Cassandra driver not available (Python 3.13 compatibility issue - safe to ignore)")

class DatabaseManager:
    """
    Manages database connections and operations for both MongoDB and Cassandra
    """
    
    def __init__(self):
        self.mongodb_client = None
        self.cassandra_cluster = None
        self.cassandra_session = None
        
        # Database configurations
        self.mongodb_config = {
            'host': os.getenv('MONGODB_HOST', 'localhost'),
            'port': int(os.getenv('MONGODB_PORT', 27017)),
            'database': os.getenv('MONGODB_DATABASE', 'crop_risk_db'),
            'username': os.getenv('MONGODB_USERNAME', ''),
            'password': os.getenv('MONGODB_PASSWORD', '')
        }
        
        self.cassandra_config = {
            'hosts': os.getenv('CASSANDRA_HOSTS', 'localhost').split(','),
            'port': int(os.getenv('CASSANDRA_PORT', 9042)),
            'keyspace': os.getenv('CASSANDRA_KEYSPACE', 'crop_risk'),
            'username': os.getenv('CASSANDRA_USERNAME', ''),
            'password': os.getenv('CASSANDRA_PASSWORD', '')
        }
    
    def connect_mongodb(self) -> bool:
        """
        Connect to MongoDB
        """
        if not MONGODB_AVAILABLE or MongoClient is None:
            print("MongoDB driver not available")
            return False
        
        try:
            connection_string = f"mongodb://{self.mongodb_config['host']}:{self.mongodb_config['port']}"
            
            if self.mongodb_config['username'] and self.mongodb_config['password']:
                connection_string = f"mongodb://{self.mongodb_config['username']}:{self.mongodb_config['password']}@{self.mongodb_config['host']}:{self.mongodb_config['port']}"
            
            self.mongodb_client = MongoClient(connection_string, serverSelectionTimeoutMS=5000)
            
            # Test connection
            self.mongodb_client.server_info()
            print("MongoDB connected successfully")
            return True
            
        except Exception as e:
            print(f"MongoDB connection failed: {e}")
            return False
    
    def connect_cassandra(self) -> bool:
        """
        Connect to Cassandra
        """
        if not CASSANDRA_AVAILABLE or Cluster is None:
            print("Cassandra driver not available")
            return False
        
        try:
            # Configure authentication if provided
            auth_provider = None
            if self.cassandra_config['username'] and self.cassandra_config['password']:
                auth_provider = PlainTextAuthProvider(
                    username=self.cassandra_config['username'],
                    password=self.cassandra_config['password']
                )
            
            # Create cluster
            self.cassandra_cluster = Cluster(
                self.cassandra_config['hosts'],
                port=self.cassandra_config['port'],
                auth_provider=auth_provider,
                load_balancing_policy=DCAwareRoundRobinPolicy()
            )
            
            # Create session
            self.cassandra_session = self.cassandra_cluster.connect()
            
            # Create keyspace if it doesn't exist
            self.cassandra_session.execute(f"""
                CREATE KEYSPACE IF NOT EXISTS {self.cassandra_config['keyspace']}
                WITH REPLICATION = {{'class': 'SimpleStrategy', 'replication_factor': 1}}
            """)
            
            # Use the keyspace
            self.cassandra_session.set_keyspace(self.cassandra_config['keyspace'])
            
            print("Cassandra connected successfully")
            return True
            
        except Exception as e:
            print(f"Cassandra connection failed: {e}")
            return False
    
    def initialize_schemas(self):
        """
        Initialize database schemas and collections
        """
        # MongoDB collections
        if self.mongodb_client:
            db = self.mongodb_client[self.mongodb_config['database']]
            
            # Create collections with indexes
            collections = {
                'risk_assessments': [
                    ('location', 1),
                    ('crop', 1),
                    ('timestamp', -1)
                ],
                'environmental_data': [
                    ('location', 1),
                    ('timestamp', -1)
                ],
                'crop_data': [
                    ('crop_name', 1),
                    ('category', 1)
                ],
                'user_sessions': [
                    ('user_id', 1),
                    ('timestamp', -1)
                ]
            }
            
            for collection_name, indexes in collections.items():
                collection = db[collection_name]
                for index_tuple in indexes:
                    collection.create_index([index_tuple])  # Wrap in list
        
        # Cassandra tables
        if self.cassandra_session:
            tables = {
                'risk_assessments': """
                    CREATE TABLE IF NOT EXISTS risk_assessments (
                        id UUID PRIMARY KEY,
                        location TEXT,
                        crop TEXT,
                        risk_score DOUBLE,
                        risk_level TEXT,
                        timestamp TIMESTAMP,
                        data TEXT
                    )
                """,
                'environmental_data': """
                    CREATE TABLE IF NOT EXISTS environmental_data (
                        id UUID PRIMARY KEY,
                        location TEXT,
                        timestamp TIMESTAMP,
                        temperature DOUBLE,
                        humidity DOUBLE,
                        moisture DOUBLE,
                        ndvi DOUBLE,
                        rainfall_index DOUBLE
                    )
                """,
                'crop_data': """
                    CREATE TABLE IF NOT EXISTS crop_data (
                        crop_name TEXT PRIMARY KEY,
                        category TEXT,
                        optimal_temp DOUBLE,
                        optimal_moisture DOUBLE,
                        optimal_humidity DOUBLE,
                        optimal_ndvi DOUBLE,
                        optimal_rainfall DOUBLE
                    )
                """
            }
            
            for table_name, create_statement in tables.items():
                self.cassandra_session.execute(create_statement)
    
    def save_risk_assessment(self, assessment_data: Dict[str, Any]) -> str:
        """
        Save risk assessment to both MongoDB and Cassandra
        """
        assessment_id = str(datetime.now().timestamp())
        
        # Save to MongoDB
        if self.mongodb_client:
            db = self.mongodb_client[self.mongodb_config['database']]
            collection = db['risk_assessments']
            
            document = {
                '_id': assessment_id,
                'location': assessment_data.get('location'),
                'crop': assessment_data.get('crop'),
                'risk_score': assessment_data.get('risk_score'),
                'risk_level': assessment_data.get('risk_level'),
                'timestamp': datetime.now(),
                'data': json.dumps(assessment_data)
            }
            
            collection.insert_one(document)
        
        # Save to Cassandra
        if self.cassandra_session:
            self.cassandra_session.execute("""
                INSERT INTO risk_assessments (id, location, crop, risk_score, risk_level, timestamp, data)
                VALUES (?, ?, ?, ?, ?, ?, ?)
            """, (
                assessment_id,
                assessment_data.get('location'),
                assessment_data.get('crop'),
                assessment_data.get('risk_score'),
                assessment_data.get('risk_level'),
                datetime.now(),
                json.dumps(assessment_data)
            ))
        
        return assessment_id
    
    def save_environmental_data(self, location: str, data: Dict[str, Any]) -> str:
        """
        Save environmental data to both databases
        """
        data_id = str(datetime.now().timestamp())
        
        # Save to MongoDB
        if self.mongodb_client:
            db = self.mongodb_client[self.mongodb_config['database']]
            collection = db['environmental_data']
            
            document = {
                '_id': data_id,
                'location': location,
                'timestamp': datetime.now(),
                **data
            }
            
            collection.insert_one(document)
        
        # Save to Cassandra
        if self.cassandra_session:
            self.cassandra_session.execute("""
                INSERT INTO environmental_data (id, location, timestamp, temperature, humidity, moisture, ndvi, rainfall_index)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?)
            """, (
                data_id,
                location,
                datetime.now(),
                data.get('temperature'),
                data.get('humidity'),
                data.get('moisture'),
                data.get('ndvi'),
                data.get('rainfall_index')
            ))
        
        return data_id
    
    def get_historical_data(self, location: str, days: int = 30) -> List[Dict[str, Any]]:
        """
        Get historical environmental data for a location
        """
        historical_data = []
        
        # Get from MongoDB
        if self.mongodb_client:
            db = self.mongodb_client[self.mongodb_config['database']]
            collection = db['environmental_data']
            
            # Calculate date range
            start_date = datetime.now() - timedelta(days=days)
            
            # Query historical data
            cursor = collection.find({
                'location': location,
                'timestamp': {'$gte': start_date}
            }).sort('timestamp', -1)
            
            for doc in cursor:
                doc['_id'] = str(doc['_id'])
                doc['timestamp'] = doc['timestamp'].isoformat()
                historical_data.append(doc)
        
        return historical_data
    
    def get_risk_assessment_history(self, location: str = None, crop: str = None) -> List[Dict[str, Any]]:
        """
        Get historical risk assessments
        """
        assessments = []
        
        # Get from MongoDB
        if self.mongodb_client:
            db = self.mongodb_client[self.mongodb_config['database']]
            collection = db['risk_assessments']
            
            query = {}
            if location:
                query['location'] = location
            if crop:
                query['crop'] = crop
            
            cursor = collection.find(query).sort('timestamp', -1).limit(100)
            
            for doc in cursor:
                doc['_id'] = str(doc['_id'])
                doc['timestamp'] = doc['timestamp'].isoformat()
                assessments.append(doc)
        
        return assessments
    
    def close_connections(self):
        """
        Close all database connections
        """
        if self.mongodb_client:
            self.mongodb_client.close()
        
        if self.cassandra_cluster:
            self.cassandra_cluster.shutdown()
    
    def get_database_status(self) -> Dict[str, Any]:
        """
        Get status of all database connections
        """
        status = {
            'mongodb': {
                'available': MONGODB_AVAILABLE,
                'connected': self.mongodb_client is not None
            },
            'cassandra': {
                'available': CASSANDRA_AVAILABLE,
                'connected': self.cassandra_session is not None
            }
        }
        
        return status
