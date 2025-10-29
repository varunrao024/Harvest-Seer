from flask import Flask, request, jsonify
from flask_cors import CORS
import os
import json
from typing import Dict, Any
import traceback

# Import our custom modules
from api_integrations import EnvironmentalDataFetcher
from model import CropRiskModel
from risk_calculator import RiskCalculator
from recommendations import RecommendationEngine
from geospatial_processor import GeospatialProcessor
from database_manager import DatabaseManager
from cloud_integration import CloudIntegration

app = Flask(__name__)
CORS(app)  # Enable CORS for all routes

# Initialize components
data_fetcher = EnvironmentalDataFetcher()
risk_calculator = RiskCalculator()
recommendation_engine = RecommendationEngine()
geospatial_processor = GeospatialProcessor()
database_manager = DatabaseManager()

# Initialize cloud integration (optional - prints warnings if not available)
cloud_integration = CloudIntegration()

# Initialize database connections (optional - will continue even if they fail)
try:
    database_manager.connect_mongodb()
except Exception as e:
    print(f"MongoDB connection warning: {e}")
    
try:
    database_manager.connect_cassandra()
except Exception as e:
    print(f"Cassandra connection warning: {e}")

# Initialize schemas only if databases are connected
if database_manager.mongodb_client or database_manager.cassandra_session:
    try:
        database_manager.initialize_schemas()
    except Exception as e:
        print(f"Schema initialization warning: {e}")

# Load or train model
model = CropRiskModel()
model_path = "models/trained_model.pkl"

if os.path.exists(model_path):
    try:
        model.load_model(model_path)
        print("Loaded existing trained model")
    except Exception as e:
        print(f"Error loading model: {e}")
        print("Training new model...")
        # Train new model if loading fails
        from data.synthetic_data import SyntheticDataGenerator
        generator = SyntheticDataGenerator()
        training_data = generator.generate_training_data(samples_per_crop=500)
        model.train(training_data)
        model.save_model(model_path)
        print("Model training complete!")
else:
    print("No existing model found. Training new model...")
    from data.synthetic_data import SyntheticDataGenerator
    generator = SyntheticDataGenerator()
    training_data = generator.generate_training_data(samples_per_crop=500)
    model.train(training_data)
    model.save_model(model_path)
    print("Model training complete!")

@app.route('/api/health', methods=['GET'])
def health_check():
    """Health check endpoint."""
    db_status = database_manager.get_database_status()
    cloud_status = cloud_integration.get_cloud_status()
    
    return jsonify({
        'status': 'healthy',
        'model_loaded': model.is_trained,
        'message': 'Crop Risk Assessment API is running',
        'database_status': db_status,
        'cloud_status': cloud_status,
        'geospatial_available': True,
        'features': {
            'geolocation': True,
            'satellite_data': True,
            'mongodb': db_status['mongodb']['connected'],
            'cassandra': db_status['cassandra']['connected'],
            'aws': cloud_status['aws']['s3_connected'],
            'google_cloud': cloud_status['google_cloud']['gcs_connected']
        }
    })

@app.route('/api/crops', methods=['GET'])
def get_crops():
    """Get list of available crops."""
    try:
        with open('data/crop_database.json', 'r') as f:
            crop_db = json.load(f)
        
        crops = []
        for crop_name, crop_data in crop_db['crops'].items():
            crops.append({
                'name': crop_name,
                'category': crop_data['category'],
                'display_name': crop_name.title()
            })
        
        return jsonify({
            'crops': crops,
            'total': len(crops)
        })
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/environmental-data', methods=['GET'])
def get_environmental_data():
    """Get current environmental data for a location."""
    try:
        location = request.args.get('location')
        if not location:
            return jsonify({'error': 'Location parameter is required'}), 400
        
        # Fetch environmental data
        env_data = data_fetcher.fetch_all_data(location)
        
        return jsonify({
            'success': True,
            'data': env_data
        })
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e),
            'traceback': traceback.format_exc()
        }), 500

@app.route('/api/assess-risk', methods=['POST'])
def assess_risk():
    """Assess crop risk for given location and crop."""
    try:
        data = request.get_json()
        
        # Validate input
        required_fields = ['location', 'crop']
        for field in required_fields:
            if field not in data:
                return jsonify({'error': f'Missing required field: {field}'}), 400
        
        location = data['location']
        crop = data['crop']
        
        # Validate crop
        with open('data/crop_database.json', 'r') as f:
            crop_db = json.load(f)
        
        if crop not in crop_db['crops']:
            return jsonify({'error': f'Invalid crop: {crop}'}), 400
        
        # Fetch environmental data
        env_data = data_fetcher.fetch_all_data(location)
        
        # Extract environmental factors
        temperature = env_data['temperature']
        moisture = env_data['soil_moisture']
        humidity = env_data['humidity']
        ndvi = env_data['ndvi']
        rainfall = env_data['rainfall_index']
        
        # Calculate risk using both methods
        # Method 1: ML Model prediction
        try:
            ml_prediction = model.predict_risk(
                crop, temperature, moisture, humidity, ndvi, rainfall
            )
        except Exception as e:
            print(f"ML model error: {e}")
            ml_prediction = None
        
        # Method 2: Rule-based calculation
        risk_analysis = risk_calculator.calculate_risk_score(
            crop, temperature, moisture, humidity, ndvi, rainfall
        )
        
        # Use ML prediction if available, otherwise use rule-based
        if ml_prediction:
            risk_score = ml_prediction['risk_score']
            risk_level = ml_prediction['risk_level']
            formula_weights = ml_prediction['formula_weights']
        else:
            risk_score = risk_analysis['risk_score']
            risk_level = risk_analysis['risk_level']
            formula_weights = risk_analysis['weights']
        
        # Generate recommendations
        recommendations = recommendation_engine.generate_recommendations(
            crop, risk_analysis, risk_analysis['current_values']
        )
        
        # Prepare response
        response = {
            'success': True,
            'location': location,
            'crop': crop,
            'risk_score': round(risk_score, 3),
            'risk_level': risk_level,
            'formula_weights': formula_weights,
            'current_values': {
                'temperature': round(temperature, 1),
                'moisture': round(moisture, 2),
                'humidity': round(humidity, 1),
                'ndvi': round(ndvi, 2),
                'rainfall_index': round(rainfall, 2)
            },
            'factor_risks': {
                k: round(v, 3) for k, v in risk_analysis['factor_risks'].items()
            },
            'weakest_factor': risk_analysis['weakest_factor'],
            'recommendations': recommendations,
            'optimal_ranges': risk_calculator.get_optimal_ranges(crop),
            'comparison': risk_calculator.compare_with_optimal(
                crop, risk_analysis['current_values']
            )
        }
        
        # Save to databases
        try:
            # Save risk assessment
            database_manager.save_risk_assessment(response)
            
            # Save environmental data
            database_manager.save_environmental_data(location, {
                'temperature': temperature,
                'humidity': humidity,
                'moisture': moisture,
                'ndvi': ndvi,
                'rainfall_index': rainfall
            })
            
            # Backup to cloud
            cloud_integration.backup_data_to_cloud(response, 'risk_assessment')
            
        except Exception as db_error:
            print(f"Database save error: {db_error}")
            # Continue even if database save fails
        
        return jsonify(response)
        
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e),
            'traceback': traceback.format_exc()
        }), 500

@app.route('/api/crop-info/<crop>', methods=['GET'])
def get_crop_info(crop):
    """Get detailed information about a specific crop."""
    try:
        with open('data/crop_database.json', 'r') as f:
            crop_db = json.load(f)
        
        if crop not in crop_db['crops']:
            return jsonify({'error': f'Crop not found: {crop}'}), 404
        
        crop_data = crop_db['crops'][crop]
        
        return jsonify({
            'crop': crop,
            'data': crop_data,
            'optimal_ranges': {
                'temperature': f"{crop_data['optimal_temp']}°C ± {crop_data['temp_tolerance']}°C",
                'moisture': f"{crop_data['optimal_moisture']:.2f} ± {crop_data['moisture_tolerance']:.2f}",
                'humidity': f"{crop_data['optimal_humidity']}% ± {crop_data['humidity_tolerance']}%",
                'ndvi': f"{crop_data['optimal_ndvi']:.2f} ± {crop_data['ndvi_tolerance']:.2f}",
                'rainfall': f"{crop_data['optimal_rainfall']:.2f} ± {crop_data['rainfall_tolerance']:.2f}"
            }
        })
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/risk-formula/<crop>', methods=['GET'])
def get_risk_formula(crop):
    """Get risk formula for a specific crop."""
    try:
        with open('data/crop_database.json', 'r') as f:
            crop_db = json.load(f)
        
        if crop not in crop_db['crops']:
            return jsonify({'error': f'Crop not found: {crop}'}), 404
        
        crop_data = crop_db['crops'][crop]
        weights = risk_calculator._get_category_weights(crop_data['category'])
        
        formula = risk_calculator.generate_risk_formula(crop, weights)
        
        return jsonify({
            'crop': crop,
            'formula': formula,
            'weights': weights,
            'category': crop_data['category']
        })
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/satellite-data', methods=['GET'])
def get_satellite_data():
    """Get satellite data for a location."""
    try:
        location = request.args.get('location')
        date = request.args.get('date')
        
        if not location:
            return jsonify({'error': 'Location parameter is required'}), 400
        
        # Parse location
        lat, lon = map(float, location.split(','))
        
        # Get satellite data
        satellite_data = geospatial_processor.get_satellite_data(lat, lon, date)
        
        return jsonify({
            'success': True,
            'location': location,
            'data': satellite_data
        })
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

@app.route('/api/vegetation-health', methods=['GET'])
def get_vegetation_health():
    """Get vegetation health analysis for a location."""
    try:
        location = request.args.get('location')
        date = request.args.get('date')
        
        if not location:
            return jsonify({'error': 'Location parameter is required'}), 400
        
        # Parse location
        lat, lon = map(float, location.split(','))
        
        # Get vegetation health
        health_data = geospatial_processor.get_vegetation_health(lat, lon, date)
        
        return jsonify({
            'success': True,
            'location': location,
            'health_data': health_data
        })
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

@app.route('/api/historical-data', methods=['GET'])
def get_historical_data():
    """Get historical environmental data for a location."""
    try:
        location = request.args.get('location')
        days = int(request.args.get('days', 30))
        
        if not location:
            return jsonify({'error': 'Location parameter is required'}), 400
        
        # Get historical data from database
        historical_data = database_manager.get_historical_data(location, days)
        
        return jsonify({
            'success': True,
            'location': location,
            'days': days,
            'data': historical_data
        })
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

@app.route('/api/risk-history', methods=['GET'])
def get_risk_history():
    """Get historical risk assessments."""
    try:
        location = request.args.get('location')
        crop = request.args.get('crop')
        
        # Get risk assessment history
        assessments = database_manager.get_risk_assessment_history(location, crop)
        
        return jsonify({
            'success': True,
            'assessments': assessments
        })
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

@app.route('/api/cloud-backup', methods=['POST'])
def create_cloud_backup():
    """Create backup of data to cloud storage."""
    try:
        data = request.get_json()
        backup_type = data.get('type', 'full')
        
        # Create backup
        success = cloud_integration.backup_data_to_cloud(data, backup_type)
        
        if success:
            return jsonify({
                'success': True,
                'message': 'Backup created successfully'
            })
        else:
            return jsonify({
                'success': False,
                'error': 'Backup failed'
            }), 500
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

@app.errorhandler(404)
def not_found(error):
    return jsonify({'error': 'Endpoint not found'}), 404

@app.errorhandler(500)
def internal_error(error):
    return jsonify({'error': 'Internal server error'}), 500

if __name__ == '__main__':
    # Create models directory if it doesn't exist
    os.makedirs('models', exist_ok=True)
    
    print("Starting Crop Risk Assessment API...")
    print("Available endpoints:")
    print("  GET  /api/health - Health check")
    print("  GET  /api/crops - List all crops")
    print("  GET  /api/environmental-data?location=<location> - Get environmental data")
    print("  POST /api/assess-risk - Assess crop risk")
    print("  GET  /api/crop-info/<crop> - Get crop information")
    print("  GET  /api/risk-formula/<crop> - Get risk formula")
    
    app.run(debug=True, host='0.0.0.0', port=5000)
