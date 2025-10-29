from typing import Dict, List, Tuple
import json

class RecommendationEngine:
    """Generate actionable recommendations for crop risk mitigation."""
    
    def __init__(self, crop_database_path: str = "data/crop_database.json"):
        with open(crop_database_path, 'r') as f:
            self.crop_db = json.load(f)
    
    def generate_recommendations(self, crop: str, risk_analysis: Dict, 
                                current_values: Dict) -> List[Dict]:
        """Generate comprehensive recommendations based on risk analysis."""
        recommendations = []
        
        # Get optimal ranges for the crop
        optimal_ranges = self.crop_db['crops'][crop]
        
        # Analyze each factor and generate recommendations
        for factor, risk_score in risk_analysis['factor_risks'].items():
            if risk_score > 0.3:  # Only recommend for significant risks
                recommendation = self._analyze_factor(
                    factor, risk_score, current_values[factor], 
                    optimal_ranges, crop
                )
                if recommendation:
                    recommendations.append(recommendation)
        
        # Sort by priority (highest risk first)
        recommendations.sort(key=lambda x: x['priority'], reverse=True)
        
        # Add general recommendations
        general_recs = self._get_general_recommendations(crop, risk_analysis)
        recommendations.extend(general_recs)
        
        return recommendations
    
    def _analyze_factor(self, factor: str, risk_score: float, current_value: float,
                       optimal_ranges: Dict, crop: str) -> Dict:
        """Analyze a specific factor and generate recommendation."""
        # Map factor names to database field names
        field_mapping = {
            'temperature': 'temp',
            'moisture': 'moisture',
            'humidity': 'humidity',
            'ndvi': 'ndvi',
            'rainfall': 'rainfall'
        }
        
        db_field = field_mapping.get(factor, factor)
        optimal_key = f'optimal_{db_field}'
        tolerance_key = f'{db_field}_tolerance'
        
        if optimal_key not in optimal_ranges:
            return None
        
        optimal = optimal_ranges[optimal_key]
        tolerance = optimal_ranges[tolerance_key]
        deviation = abs(current_value - optimal)
        
        recommendation = {
            'factor': factor,
            'priority': risk_score,
            'current_value': current_value,
            'optimal_value': optimal,
            'deviation': deviation,
            'risk_level': self._get_risk_level(risk_score)
        }
        
        # Generate specific recommendations based on factor
        if factor == 'temperature':
            recommendation.update(self._get_temperature_recommendation(
                current_value, optimal, deviation, tolerance, crop
            ))
        elif factor == 'moisture':
            recommendation.update(self._get_moisture_recommendation(
                current_value, optimal, deviation, tolerance, crop
            ))
        elif factor == 'humidity':
            recommendation.update(self._get_humidity_recommendation(
                current_value, optimal, deviation, tolerance, crop
            ))
        elif factor == 'ndvi':
            recommendation.update(self._get_ndvi_recommendation(
                current_value, optimal, deviation, tolerance, crop
            ))
        elif factor == 'rainfall':
            recommendation.update(self._get_rainfall_recommendation(
                current_value, optimal, deviation, tolerance, crop
            ))
        
        return recommendation
    
    def _get_temperature_recommendation(self, current: float, optimal: float, 
                                      deviation: float, tolerance: float, crop: str) -> Dict:
        """Get temperature-specific recommendations."""
        if current > optimal + tolerance:
            return {
                'issue': 'High Temperature Stress',
                'recommendation': f'Implement cooling measures to reduce temperature from {current:.1f}°C to {optimal:.1f}°C',
                'actions': [
                    'Install shade nets or temporary covers',
                    'Increase irrigation frequency for evaporative cooling',
                    'Consider planting heat-tolerant varieties',
                    'Adjust planting schedule to avoid peak heat periods'
                ],
                'expected_improvement': f'Risk reduction: {deviation/tolerance*100:.1f}% → {(deviation-tolerance)/tolerance*100:.1f}%'
            }
        elif current < optimal - tolerance:
            return {
                'issue': 'Low Temperature Stress',
                'recommendation': f'Implement warming measures to increase temperature from {current:.1f}°C to {optimal:.1f}°C',
                'actions': [
                    'Use row covers or greenhouses',
                    'Apply mulch to retain soil heat',
                    'Consider planting cold-tolerant varieties',
                    'Adjust planting schedule for warmer periods'
                ],
                'expected_improvement': f'Risk reduction: {deviation/tolerance*100:.1f}% → {(deviation-tolerance)/tolerance*100:.1f}%'
            }
        else:
            return {
                'issue': 'Temperature within acceptable range',
                'recommendation': 'Monitor temperature trends',
                'actions': ['Continue current practices'],
                'expected_improvement': 'Minimal risk'
            }
    
    def _get_moisture_recommendation(self, current: float, optimal: float, 
                                   deviation: float, tolerance: float, crop: str) -> Dict:
        """Get soil moisture-specific recommendations."""
        if current < optimal - tolerance:
            irrigation_needed = (optimal - current) * 100  # Convert to mm
            return {
                'issue': 'Soil Moisture Deficit',
                'recommendation': f'Increase irrigation by {irrigation_needed:.0f}mm to raise soil moisture from {current:.2f} to {optimal:.2f}',
                'actions': [
                    f'Apply {irrigation_needed:.0f}mm of irrigation water',
                    'Improve irrigation system efficiency',
                    'Consider drip irrigation for water conservation',
                    'Monitor soil moisture with sensors'
                ],
                'expected_improvement': f'Risk reduction: {deviation/tolerance*100:.1f}% → {(deviation-tolerance)/tolerance*100:.1f}%'
            }
        elif current > optimal + tolerance:
            return {
                'issue': 'Excessive Soil Moisture',
                'recommendation': f'Improve drainage to reduce soil moisture from {current:.2f} to {optimal:.2f}',
                'actions': [
                    'Improve field drainage systems',
                    'Reduce irrigation frequency',
                    'Consider raised beds for better drainage',
                    'Monitor for waterlogging damage'
                ],
                'expected_improvement': f'Risk reduction: {deviation/tolerance*100:.1f}% → {(deviation-tolerance)/tolerance*100:.1f}%'
            }
        else:
            return {
                'issue': 'Soil moisture within optimal range',
                'recommendation': 'Maintain current irrigation practices',
                'actions': ['Continue monitoring soil moisture'],
                'expected_improvement': 'Optimal conditions'
            }
    
    def _get_humidity_recommendation(self, current: float, optimal: float, 
                                   deviation: float, tolerance: float, crop: str) -> Dict:
        """Get humidity-specific recommendations."""
        if current > optimal + tolerance:
            return {
                'issue': 'High Humidity',
                'recommendation': f'Improve ventilation to reduce humidity from {current:.0f}% to {optimal:.0f}%',
                'actions': [
                    'Increase air circulation with fans',
                    'Improve greenhouse ventilation',
                    'Consider dehumidification systems',
                    'Monitor for fungal diseases'
                ],
                'expected_improvement': f'Risk reduction: {deviation/tolerance*100:.1f}% → {(deviation-tolerance)/tolerance*100:.1f}%'
            }
        elif current < optimal - tolerance:
            return {
                'issue': 'Low Humidity',
                'recommendation': f'Increase humidity from {current:.0f}% to {optimal:.0f}%',
                'actions': [
                    'Use misting systems',
                    'Increase irrigation frequency',
                    'Consider humidification systems',
                    'Monitor for water stress'
                ],
                'expected_improvement': f'Risk reduction: {deviation/tolerance*100:.1f}% → {(deviation-tolerance)/tolerance*100:.1f}%'
            }
        else:
            return {
                'issue': 'Humidity within optimal range',
                'recommendation': 'Maintain current practices',
                'actions': ['Continue monitoring humidity levels'],
                'expected_improvement': 'Optimal conditions'
            }
    
    def _get_ndvi_recommendation(self, current: float, optimal: float, 
                               deviation: float, tolerance: float, crop: str) -> Dict:
        """Get NDVI-specific recommendations."""
        if current < optimal - tolerance:
            return {
                'issue': 'Poor Vegetation Health (Low NDVI)',
                'recommendation': f'Improve crop health to increase NDVI from {current:.2f} to {optimal:.2f}',
                'actions': [
                    'Apply appropriate fertilizers',
                    'Check for pest and disease issues',
                    'Improve soil health and nutrition',
                    'Consider crop rotation or intercropping'
                ],
                'expected_improvement': f'Risk reduction: {deviation/tolerance*100:.1f}% → {(deviation-tolerance)/tolerance*100:.1f}%'
            }
        else:
            return {
                'issue': 'Good Vegetation Health',
                'recommendation': 'Maintain current crop health practices',
                'actions': ['Continue monitoring crop health'],
                'expected_improvement': 'Optimal conditions'
            }
    
    def _get_rainfall_recommendation(self, current: float, optimal: float, 
                                  deviation: float, tolerance: float, crop: str) -> Dict:
        """Get rainfall-specific recommendations."""
        if current < optimal - tolerance:
            rainfall_deficit = (optimal - current) * 100  # Convert to mm
            return {
                'issue': 'Rainfall Deficit',
                'recommendation': f'Supplement with irrigation - {rainfall_deficit:.0f}mm needed',
                'actions': [
                    f'Apply {rainfall_deficit:.0f}mm of supplemental irrigation',
                    'Implement water conservation practices',
                    'Consider drought-tolerant varieties',
                    'Monitor soil moisture closely'
                ],
                'expected_improvement': f'Risk reduction: {deviation/tolerance*100:.1f}% → {(deviation-tolerance)/tolerance*100:.1f}%'
            }
        elif current > optimal + tolerance:
            return {
                'issue': 'Excessive Rainfall',
                'recommendation': 'Improve drainage and water management',
                'actions': [
                    'Improve field drainage systems',
                    'Consider raised beds',
                    'Monitor for waterlogging',
                    'Plan for flood management'
                ],
                'expected_improvement': f'Risk reduction: {deviation/tolerance*100:.1f}% → {(deviation-tolerance)/tolerance*100:.1f}%'
            }
        else:
            return {
                'issue': 'Rainfall within optimal range',
                'recommendation': 'Continue current water management',
                'actions': ['Monitor rainfall patterns'],
                'expected_improvement': 'Optimal conditions'
            }
    
    def _get_general_recommendations(self, crop: str, risk_analysis: Dict) -> List[Dict]:
        """Get general recommendations based on overall risk level."""
        risk_level = risk_analysis['risk_level']
        risk_score = risk_analysis['risk_score']
        
        general_recs = []
        
        if risk_level == "High Risk":
            general_recs.append({
                'factor': 'general',
                'priority': 1.0,
                'risk_level': 'High',
                'issue': 'High Overall Risk',
                'recommendation': 'Immediate action required to reduce crop risk',
                'actions': [
                    'Prioritize the highest risk factors identified above',
                    'Consider crop insurance for risk mitigation',
                    'Consult with agricultural extension services',
                    'Develop contingency plans for extreme weather'
                ],
                'expected_improvement': f'Potential risk reduction: {risk_score*100:.1f}% → {risk_score*50:.1f}%'
            })
        elif risk_level == "Medium Risk":
            general_recs.append({
                'factor': 'general',
                'priority': 0.5,
                'risk_level': 'Medium',
                'issue': 'Moderate Risk',
                'recommendation': 'Monitor conditions and implement preventive measures',
                'actions': [
                    'Regular monitoring of environmental conditions',
                    'Implement preventive measures for identified risks',
                    'Prepare for potential weather changes',
                    'Maintain good agricultural practices'
                ],
                'expected_improvement': f'Potential risk reduction: {risk_score*100:.1f}% → {risk_score*70:.1f}%'
            })
        else:
            general_recs.append({
                'factor': 'general',
                'priority': 0.2,
                'risk_level': 'Low',
                'issue': 'Low Risk',
                'recommendation': 'Continue current practices with regular monitoring',
                'actions': [
                    'Maintain current agricultural practices',
                    'Regular monitoring of conditions',
                    'Prepare for seasonal changes',
                    'Keep contingency plans ready'
                ],
                'expected_improvement': 'Maintain low risk levels'
            })
        
        return general_recs
    
    def _get_risk_level(self, risk_score: float) -> str:
        """Convert risk score to risk level."""
        if risk_score < 0.3:
            return "Low"
        elif risk_score < 0.6:
            return "Medium"
        else:
            return "High"
    
    def calculate_expected_improvement(self, current_risk: float, 
                                    factor_improvements: Dict[str, float]) -> float:
        """Calculate expected risk improvement after implementing recommendations."""
        # Simple weighted average of improvements
        total_improvement = 0
        total_weight = 0
        
        for factor, improvement in factor_improvements.items():
            weight = 0.2  # Equal weight for all factors
            total_improvement += improvement * weight
            total_weight += weight
        
        if total_weight > 0:
            expected_risk = current_risk * (1 - total_improvement)
            return max(0, min(1, expected_risk))
        
        return current_risk
