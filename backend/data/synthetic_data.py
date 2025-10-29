import numpy as np
import pandas as pd
import json
import random
from typing import Dict, List, Tuple

class SyntheticDataGenerator:
    def __init__(self, crop_database_path: str = "data/crop_database.json"):
        """Initialize the synthetic data generator with crop database."""
        with open(crop_database_path, 'r') as f:
            self.crop_db = json.load(f)
        
        self.crops = list(self.crop_db['crops'].keys())
        self.categories = {
            'high_moisture': ['rice', 'sugarcane', 'potato', 'tomato', 'oil_palm'],
            'moderate_moisture': ['maize', 'soybean', 'cotton', 'sunflower', 'beans', 'peanuts', 'cassava', 'sweet_potato'],
            'drought_tolerant': ['millet', 'sorghum', 'chickpea', 'lentils'],
            'temperature_sensitive': ['wheat', 'barley', 'rapeseed']
        }
    
    def generate_environmental_data(self, crop: str, num_samples: int = 1000) -> pd.DataFrame:
        """Generate synthetic environmental data for a specific crop."""
        crop_data = self.crop_db['crops'][crop]
        
        data = []
        for _ in range(num_samples):
            # Generate realistic environmental conditions
            temp = np.random.normal(crop_data['optimal_temp'], crop_data['temp_tolerance'])
            moisture = np.random.beta(2, 2)  # Beta distribution for 0-1 values
            humidity = np.random.normal(crop_data['optimal_humidity'], crop_data['humidity_tolerance'])
            ndvi = np.random.beta(3, 1)  # Skewed towards higher values
            rainfall = np.random.beta(2, 2)
            
            # Add some extreme conditions
            if random.random() < 0.1:  # 10% extreme conditions
                temp += np.random.choice([-15, 15])  # Extreme cold or heat
                moisture = np.random.choice([0.1, 0.9])  # Very dry or very wet
                humidity = np.random.choice([20, 95])  # Very dry or very humid
                ndvi = np.random.choice([0.1, 0.9])  # Very low or very high NDVI
                rainfall = np.random.choice([0.1, 1.5])  # Drought or flood
            
            # Clamp values to realistic ranges
            temp = np.clip(temp, -10, 50)
            moisture = np.clip(moisture, 0.1, 1.0)
            humidity = np.clip(humidity, 10, 100)
            ndvi = np.clip(ndvi, 0.1, 1.0)
            rainfall = np.clip(rainfall, 0.1, 2.0)
            
            data.append({
                'crop': crop,
                'temperature': temp,
                'moisture': moisture,
                'humidity': humidity,
                'ndvi': ndvi,
                'rainfall': rainfall
            })
        
        return pd.DataFrame(data)
    
    def calculate_risk_score(self, row: pd.Series) -> float:
        """Calculate risk score based on deviation from optimal conditions."""
        crop_data = self.crop_db['crops'][row['crop']]
        
        # Calculate deviations (normalized)
        temp_dev = abs(row['temperature'] - crop_data['optimal_temp']) / crop_data['temp_tolerance']
        moisture_dev = abs(row['moisture'] - crop_data['optimal_moisture']) / crop_data['moisture_tolerance']
        humidity_dev = abs(row['humidity'] - crop_data['optimal_humidity']) / crop_data['humidity_tolerance']
        ndvi_dev = abs(row['ndvi'] - crop_data['optimal_ndvi']) / crop_data['ndvi_tolerance']
        rainfall_dev = abs(row['rainfall'] - crop_data['optimal_rainfall']) / crop_data['rainfall_tolerance']
        
        # Weighted risk score (weights learned from crop category)
        category = crop_data['category']
        
        if category == 'high_moisture':
            weights = [0.15, 0.35, 0.20, 0.20, 0.10]  # Moisture and NDVI most important
        elif category == 'moderate_moisture':
            weights = [0.20, 0.25, 0.20, 0.25, 0.10]  # Balanced
        elif category == 'drought_tolerant':
            weights = [0.30, 0.15, 0.20, 0.25, 0.10]  # Temperature and NDVI most important
        else:  # temperature_sensitive
            weights = [0.35, 0.20, 0.15, 0.20, 0.10]  # Temperature most important
        
        risk_score = (weights[0] * temp_dev + 
                     weights[1] * moisture_dev + 
                     weights[2] * humidity_dev + 
                     weights[3] * ndvi_dev + 
                     weights[4] * rainfall_dev)
        
        return min(risk_score, 1.0)  # Cap at 1.0
    
    def generate_training_data(self, samples_per_crop: int = 500) -> pd.DataFrame:
        """Generate complete training dataset for all crops."""
        all_data = []
        
        for crop in self.crops:
            crop_data = self.generate_environmental_data(crop, samples_per_crop)
            all_data.append(crop_data)
        
        df = pd.concat(all_data, ignore_index=True)
        
        # Calculate risk scores
        df['risk_score'] = df.apply(self.calculate_risk_score, axis=1)
        
        # Add categorical features
        df['crop_category'] = df['crop'].map({
            crop: self.crop_db['crops'][crop]['category'] 
            for crop in self.crops
        })
        
        return df
    
    def get_crop_optimal_ranges(self, crop: str) -> Dict:
        """Get optimal ranges for a specific crop."""
        return self.crop_db['crops'][crop]
    
    def get_all_crops(self) -> List[str]:
        """Get list of all available crops."""
        return self.crops

if __name__ == "__main__":
    # Generate training data
    generator = SyntheticDataGenerator()
    training_data = generator.generate_training_data(samples_per_crop=500)
    
    print(f"Generated {len(training_data)} training samples")
    print(f"Crops: {generator.get_all_crops()}")
    print(f"Risk score distribution:")
    print(training_data['risk_score'].describe())
    
    # Save training data
    training_data.to_csv('data/synthetic_training_data.csv', index=False)
    print("Training data saved to data/synthetic_training_data.csv")
