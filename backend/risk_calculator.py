import numpy as np
from typing import Dict, List, Tuple
import json

class RiskCalculator:
    """Calculate crop risk scores and generate risk formulas."""
    
    def __init__(self, crop_database_path: str = "data/crop_database.json"):
        with open(crop_database_path, 'r') as f:
            self.crop_db = json.load(f)
    
    def calculate_risk_score(self, crop: str, temperature: float, moisture: float, 
                           humidity: float, ndvi: float, rainfall: float) -> Dict:
        """Calculate comprehensive risk score for crop conditions."""
        crop_data = self.crop_db['crops'][crop]
        
        # Calculate individual factor risks
        temp_risk = self._calculate_temperature_risk(temperature, crop_data)
        moisture_risk = self._calculate_moisture_risk(moisture, crop_data)
        humidity_risk = self._calculate_humidity_risk(humidity, crop_data)
        ndvi_risk = self._calculate_ndvi_risk(ndvi, crop_data)
        rainfall_risk = self._calculate_rainfall_risk(rainfall, crop_data)
        
        # Get category-specific weights
        weights = self._get_category_weights(crop_data['category'])
        
        # Calculate weighted risk score
        risk_score = (
            weights['temperature'] * temp_risk +
            weights['moisture'] * moisture_risk +
            weights['humidity'] * humidity_risk +
            weights['ndvi'] * ndvi_risk +
            weights['rainfall'] * rainfall_risk
        )
        
        # Ensure risk score is between 0 and 1
        risk_score = max(0.0, min(1.0, risk_score))
        
        # Identify weakest factor
        factor_risks = {
            'temperature': temp_risk,
            'moisture': moisture_risk,
            'humidity': humidity_risk,
            'ndvi': ndvi_risk,
            'rainfall': rainfall_risk
        }
        weakest_factor = max(factor_risks, key=factor_risks.get)
        
        return {
            'risk_score': risk_score,
            'risk_level': self._get_risk_level(risk_score),
            'factor_risks': factor_risks,
            'weights': weights,
            'weakest_factor': weakest_factor,
            'current_values': {
                'temperature': temperature,
                'moisture': moisture,
                'humidity': humidity,
                'ndvi': ndvi,
                'rainfall': rainfall
            }
        }
    
    def _calculate_temperature_risk(self, temperature: float, crop_data: Dict) -> float:
        """Calculate temperature-related risk."""
        optimal_temp = crop_data['optimal_temp']
        temp_tolerance = crop_data['temp_tolerance']
        
        deviation = abs(temperature - optimal_temp)
        risk = min(deviation / temp_tolerance, 1.0)
        
        # Extra risk for extreme temperatures
        if temperature > optimal_temp + temp_tolerance * 2:
            risk = min(risk + 0.2, 1.0)
        elif temperature < optimal_temp - temp_tolerance * 2:
            risk = min(risk + 0.2, 1.0)
        
        return risk
    
    def _calculate_moisture_risk(self, moisture: float, crop_data: Dict) -> float:
        """Calculate soil moisture-related risk."""
        optimal_moisture = crop_data['optimal_moisture']
        moisture_tolerance = crop_data['moisture_tolerance']
        
        deviation = abs(moisture - optimal_moisture)
        risk = min(deviation / moisture_tolerance, 1.0)
        
        # Extra risk for very dry conditions
        if moisture < optimal_moisture - moisture_tolerance:
            risk = min(risk + 0.3, 1.0)
        
        return risk
    
    def _calculate_humidity_risk(self, humidity: float, crop_data: Dict) -> float:
        """Calculate humidity-related risk."""
        optimal_humidity = crop_data['optimal_humidity']
        humidity_tolerance = crop_data['humidity_tolerance']
        
        deviation = abs(humidity - optimal_humidity)
        risk = min(deviation / humidity_tolerance, 1.0)
        
        return risk
    
    def _calculate_ndvi_risk(self, ndvi: float, crop_data: Dict) -> float:
        """Calculate NDVI-related risk."""
        optimal_ndvi = crop_data['optimal_ndvi']
        ndvi_tolerance = crop_data['ndvi_tolerance']
        
        # NDVI risk is higher when below optimal (poor vegetation health)
        if ndvi < optimal_ndvi:
            deviation = optimal_ndvi - ndvi
            risk = min(deviation / ndvi_tolerance, 1.0)
        else:
            # Less risk when NDVI is above optimal
            deviation = ndvi - optimal_ndvi
            risk = min(deviation / (ndvi_tolerance * 2), 0.5)
        
        return risk
    
    def _calculate_rainfall_risk(self, rainfall: float, crop_data: Dict) -> float:
        """Calculate rainfall-related risk."""
        optimal_rainfall = crop_data['optimal_rainfall']
        rainfall_tolerance = crop_data['rainfall_tolerance']
        
        deviation = abs(rainfall - optimal_rainfall)
        risk = min(deviation / rainfall_tolerance, 1.0)
        
        # Extra risk for drought conditions
        if rainfall < optimal_rainfall - rainfall_tolerance:
            risk = min(risk + 0.2, 1.0)
        
        return risk
    
    def _get_category_weights(self, category: str) -> Dict[str, float]:
        """Get category-specific weights for risk calculation."""
        weights = {
            'high_moisture': {
                'temperature': 0.15,
                'moisture': 0.35,
                'humidity': 0.20,
                'ndvi': 0.20,
                'rainfall': 0.10
            },
            'moderate_moisture': {
                'temperature': 0.20,
                'moisture': 0.25,
                'humidity': 0.20,
                'ndvi': 0.25,
                'rainfall': 0.10
            },
            'drought_tolerant': {
                'temperature': 0.30,
                'moisture': 0.15,
                'humidity': 0.20,
                'ndvi': 0.25,
                'rainfall': 0.10
            },
            'temperature_sensitive': {
                'temperature': 0.35,
                'moisture': 0.20,
                'humidity': 0.15,
                'ndvi': 0.20,
                'rainfall': 0.10
            }
        }
        
        return weights.get(category, weights['moderate_moisture'])
    
    def _get_risk_level(self, risk_score: float) -> str:
        """Convert risk score to risk level."""
        if risk_score < 0.3:
            return "Low Risk"
        elif risk_score < 0.6:
            return "Medium Risk"
        else:
            return "High Risk"
    
    def generate_risk_formula(self, crop: str, weights: Dict[str, float]) -> str:
        """Generate human-readable risk formula."""
        crop_data = self.crop_db['crops'][crop]
        
        formula_parts = []
        
        if weights['temperature'] > 0.1:
            formula_parts.append(f"{weights['temperature']:.2f} × Temperature Risk")
        
        if weights['moisture'] > 0.1:
            formula_parts.append(f"{weights['moisture']:.2f} × Moisture Risk")
        
        if weights['humidity'] > 0.1:
            formula_parts.append(f"{weights['humidity']:.2f} × Humidity Risk")
        
        if weights['ndvi'] > 0.1:
            formula_parts.append(f"{weights['ndvi']:.2f} × NDVI Risk")
        
        if weights['rainfall'] > 0.1:
            formula_parts.append(f"{weights['rainfall']:.2f} × Rainfall Risk")
        
        return "Risk Score = " + " + ".join(formula_parts)
    
    def get_optimal_ranges(self, crop: str) -> Dict:
        """Get optimal ranges for a specific crop."""
        return self.crop_db['crops'][crop]
    
    def compare_with_optimal(self, crop: str, current_values: Dict) -> Dict:
        """Compare current values with optimal ranges."""
        optimal = self.get_optimal_ranges(crop)
        
        # Map factor names to database field names
        field_mapping = {
            'temperature': 'temp',
            'moisture': 'moisture',
            'humidity': 'humidity',
            'ndvi': 'ndvi',
            'rainfall': 'rainfall'
        }
        
        comparison = {}
        for factor in ['temperature', 'moisture', 'humidity', 'ndvi', 'rainfall']:
            current = current_values[factor]
            db_field = field_mapping.get(factor, factor)
            optimal_val = optimal[f'optimal_{db_field}']
            tolerance = optimal[f'{db_field}_tolerance']
            
            comparison[factor] = {
                'current': current,
                'optimal': optimal_val,
                'tolerance': tolerance,
                'deviation': abs(current - optimal_val),
                'within_range': abs(current - optimal_val) <= tolerance,
                'deviation_percent': (abs(current - optimal_val) / tolerance) * 100
            }
        
        return comparison
