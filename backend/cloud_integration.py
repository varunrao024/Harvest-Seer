"""
Cloud integration module for AWS and Google Cloud services
"""

import os
import json
from typing import Dict, List, Any, Optional
from datetime import datetime, timedelta
import requests

# AWS
try:
    import boto3
    from botocore.exceptions import ClientError, NoCredentialsError
    AWS_AVAILABLE = True
except ImportError:
    AWS_AVAILABLE = False
    print("AWS SDK not available. Install with: pip install boto3")

# Google Cloud
try:
    from google.cloud import storage, bigquery
    from google.oauth2 import service_account
    GOOGLE_CLOUD_AVAILABLE = True
except ImportError:
    GOOGLE_CLOUD_AVAILABLE = False
    print("Google Cloud SDK not available. Install with: pip install google-cloud-storage google-cloud-bigquery")

class CloudIntegration:
    """
    Handles cloud service integrations for AWS and Google Cloud
    """
    
    def __init__(self):
        self.aws_config = {
            'region': os.getenv('AWS_REGION', 'us-east-1'),
            'access_key': os.getenv('AWS_ACCESS_KEY_ID', ''),
            'secret_key': os.getenv('AWS_SECRET_ACCESS_KEY', ''),
            's3_bucket': os.getenv('AWS_S3_BUCKET', 'crop-risk-data'),
            'dynamodb_table': os.getenv('AWS_DYNAMODB_TABLE', 'crop-risk-assessments')
        }
        
        self.gcp_config = {
            'project_id': os.getenv('GCP_PROJECT_ID', ''),
            'credentials_path': os.getenv('GCP_CREDENTIALS_PATH', ''),
            'storage_bucket': os.getenv('GCP_STORAGE_BUCKET', 'crop-risk-data'),
            'bigquery_dataset': os.getenv('GCP_BIGQUERY_DATASET', 'crop_risk')
        }
        
        # Initialize clients
        self.s3_client = None
        self.dynamodb_client = None
        self.gcs_client = None
        self.bigquery_client = None
        
        self._initialize_clients()
    
    def _initialize_clients(self):
        """
        Initialize cloud service clients
        """
        # AWS clients
        if AWS_AVAILABLE:
            try:
                self.s3_client = boto3.client(
                    's3',
                    region_name=self.aws_config['region'],
                    aws_access_key_id=self.aws_config['access_key'],
                    aws_secret_access_key=self.aws_config['secret_key']
                )
                
                self.dynamodb_client = boto3.client(
                    'dynamodb',
                    region_name=self.aws_config['region'],
                    aws_access_key_id=self.aws_config['access_key'],
                    aws_secret_access_key=self.aws_config['secret_key']
                )
                
                print("AWS clients initialized successfully")
            except Exception as e:
                print(f"AWS client initialization failed: {e}")
        
        # Google Cloud clients
        if GOOGLE_CLOUD_AVAILABLE:
            try:
                # Initialize GCS client
                if self.gcp_config['credentials_path']:
                    credentials = service_account.Credentials.from_service_account_file(
                        self.gcp_config['credentials_path']
                    )
                    self.gcs_client = storage.Client(
                        project=self.gcp_config['project_id'],
                        credentials=credentials
                    )
                else:
                    self.gcs_client = storage.Client(project=self.gcp_config['project_id'])
                
                # Initialize BigQuery client
                if self.gcp_config['credentials_path']:
                    credentials = service_account.Credentials.from_service_account_file(
                        self.gcp_config['credentials_path']
                    )
                    self.bigquery_client = bigquery.Client(
                        project=self.gcp_config['project_id'],
                        credentials=credentials
                    )
                else:
                    self.bigquery_client = bigquery.Client(project=self.gcp_config['project_id'])
                
                print("Google Cloud clients initialized successfully")
            except Exception as e:
                print(f"Google Cloud client initialization failed: {e}")
    
    def upload_to_s3(self, data: Dict[str, Any], key: str) -> bool:
        """
        Upload data to AWS S3
        """
        if not self.s3_client:
            print("S3 client not available")
            return False
        
        try:
            self.s3_client.put_object(
                Bucket=self.aws_config['s3_bucket'],
                Key=key,
                Body=json.dumps(data),
                ContentType='application/json'
            )
            print(f"Data uploaded to S3: {key}")
            return True
        except ClientError as e:
            print(f"S3 upload failed: {e}")
            return False
    
    def download_from_s3(self, key: str) -> Optional[Dict[str, Any]]:
        """
        Download data from AWS S3
        """
        if not self.s3_client:
            print("S3 client not available")
            return None
        
        try:
            response = self.s3_client.get_object(
                Bucket=self.aws_config['s3_bucket'],
                Key=key
            )
            data = json.loads(response['Body'].read())
            return data
        except ClientError as e:
            print(f"S3 download failed: {e}")
            return None
    
    def save_to_dynamodb(self, table_name: str, item: Dict[str, Any]) -> bool:
        """
        Save item to AWS DynamoDB
        """
        if not self.dynamodb_client:
            print("DynamoDB client not available")
            return False
        
        try:
            # Convert Python types to DynamoDB types
            dynamodb_item = self._convert_to_dynamodb_format(item)
            
            self.dynamodb_client.put_item(
                TableName=table_name,
                Item=dynamodb_item
            )
            print(f"Item saved to DynamoDB: {table_name}")
            return True
        except ClientError as e:
            print(f"DynamoDB save failed: {e}")
            return False
    
    def _convert_to_dynamodb_format(self, item: Dict[str, Any]) -> Dict[str, Any]:
        """
        Convert Python dictionary to DynamoDB format
        """
        dynamodb_item = {}
        
        for key, value in item.items():
            if isinstance(value, str):
                dynamodb_item[key] = {'S': value}
            elif isinstance(value, (int, float)):
                dynamodb_item[key] = {'N': str(value)}
            elif isinstance(value, bool):
                dynamodb_item[key] = {'BOOL': value}
            elif isinstance(value, list):
                dynamodb_item[key] = {'L': [{'S': str(v)} for v in value]}
            elif isinstance(value, dict):
                dynamodb_item[key] = {'M': self._convert_to_dynamodb_format(value)}
            else:
                dynamodb_item[key] = {'S': str(value)}
        
        return dynamodb_item
    
    def upload_to_gcs(self, data: Dict[str, Any], blob_name: str) -> bool:
        """
        Upload data to Google Cloud Storage
        """
        if not self.gcs_client:
            print("GCS client not available")
            return False
        
        try:
            bucket = self.gcs_client.bucket(self.gcp_config['storage_bucket'])
            blob = bucket.blob(blob_name)
            
            blob.upload_from_string(
                json.dumps(data),
                content_type='application/json'
            )
            print(f"Data uploaded to GCS: {blob_name}")
            return True
        except Exception as e:
            print(f"GCS upload failed: {e}")
            return False
    
    def download_from_gcs(self, blob_name: str) -> Optional[Dict[str, Any]]:
        """
        Download data from Google Cloud Storage
        """
        if not self.gcs_client:
            print("GCS client not available")
            return None
        
        try:
            bucket = self.gcs_client.bucket(self.gcp_config['storage_bucket'])
            blob = bucket.blob(blob_name)
            
            data = json.loads(blob.download_as_text())
            return data
        except Exception as e:
            print(f"GCS download failed: {e}")
            return None
    
    def query_bigquery(self, query: str) -> List[Dict[str, Any]]:
        """
        Execute query on BigQuery
        """
        if not self.bigquery_client:
            print("BigQuery client not available")
            return []
        
        try:
            query_job = self.bigquery_client.query(query)
            results = query_job.result()
            
            data = []
            for row in results:
                data.append(dict(row))
            
            return data
        except Exception as e:
            print(f"BigQuery query failed: {e}")
            return []
    
    def create_bigquery_table(self, table_name: str, schema: List[Dict[str, str]]) -> bool:
        """
        Create table in BigQuery
        """
        if not self.bigquery_client:
            print("BigQuery client not available")
            return False
        
        try:
            dataset_id = self.gcp_config['bigquery_dataset']
            table_id = f"{self.gcp_config['project_id']}.{dataset_id}.{table_name}"
            
            # Create dataset if it doesn't exist
            dataset_ref = self.bigquery_client.dataset(dataset_id)
            try:
                self.bigquery_client.get_dataset(dataset_ref)
            except Exception:
                self.bigquery_client.create_dataset(dataset_ref)
            
            # Create table
            table_ref = dataset_ref.table(table_name)
            table = bigquery.Table(table_ref, schema=schema)
            self.bigquery_client.create_table(table)
            
            print(f"BigQuery table created: {table_name}")
            return True
        except Exception as e:
            print(f"BigQuery table creation failed: {e}")
            return False
    
    def get_weather_data_from_aws(self, location: str) -> Dict[str, Any]:
        """
        Get weather data from AWS services (mock implementation)
        """
        # This would integrate with AWS Weather API or similar service
        # For now, return mock data
        return {
            'temperature': 25.0,
            'humidity': 60.0,
            'precipitation': 1.5,
            'wind_speed': 10.0,
            'timestamp': datetime.now().isoformat()
        }
    
    def get_satellite_data_from_gcp(self, location: str) -> Dict[str, Any]:
        """
        Get satellite data from Google Cloud services
        """
        # This would integrate with Google Earth Engine or similar service
        # For now, return mock data
        return {
            'ndvi': 0.6,
            'ndwi': 0.3,
            'land_surface_temperature': 28.0,
            'timestamp': datetime.now().isoformat()
        }
    
    def backup_data_to_cloud(self, data: Dict[str, Any], backup_type: str = 'full') -> bool:
        """
        Backup data to cloud storage
        """
        timestamp = datetime.now().strftime('%Y%m%d_%H%M%S')
        backup_key = f"backups/{backup_type}/{timestamp}.json"
        
        # Upload to both S3 and GCS
        s3_success = self.upload_to_s3(data, backup_key)
        gcs_success = self.upload_to_gcs(data, backup_key)
        
        return s3_success or gcs_success
    
    def get_cloud_status(self) -> Dict[str, Any]:
        """
        Get status of all cloud services
        """
        status = {
            'aws': {
                'available': AWS_AVAILABLE,
                's3_connected': self.s3_client is not None,
                'dynamodb_connected': self.dynamodb_client is not None
            },
            'google_cloud': {
                'available': GOOGLE_CLOUD_AVAILABLE,
                'gcs_connected': self.gcs_client is not None,
                'bigquery_connected': self.bigquery_client is not None
            }
        }
        
        return status
