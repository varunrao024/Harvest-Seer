import requests
import json
import time
import numpy as np
from typing import Dict, Optional, Tuple
from geopy.geocoders import Nominatim

class WeatherAPI:
    """Integration with weather APIs for real-time data."""
    
    def __init__(self, api_key: Optional[str] = None):
        self.api_key = api_key
        self.base_url = "https://api.openweathermap.org/data/2.5"
        self.geocoder = Nominatim(user_agent="crop_risk_assessment")
    
    def get_coordinates(self, location: str) -> Tuple[float, float]:
        """Convert location string to coordinates."""
        try:
            location_data = self.geocoder.geocode(location)
            if location_data:
                return location_data.latitude, location_data.longitude
            else:
                # Fallback coordinates for major agricultural regions
                fallback_coords = {
                    'punjab': (31.1471, 75.3412),
                    'kansas': (39.0119, -98.4842),
                    'sahel': (14.4974, -14.4524),
                    'idaho': (44.2405, -114.4788)
                }
                location_lower = location.lower()
                for region, coords in fallback_coords.items():
                    if region in location_lower:
                        return coords
                return 28.6139, 77.2090  # Default to Delhi, India
        except Exception as e:
            print(f"Geocoding error: {e}")
            return 28.6139, 77.2090  # Default to Delhi, India
    
    def get_weather_data(self, lat: float, lon: float) -> Dict:
        """Fetch current weather data from OpenWeatherMap API."""
        if not self.api_key:
            # Return mock data if no API key
            return self._get_mock_weather_data(lat, lon)
        
        try:
            url = f"{self.base_url}/weather"
            params = {
                'lat': lat,
                'lon': lon,
                'appid': self.api_key,
                'units': 'metric'
            }
            
            response = requests.get(url, params=params, timeout=10)
            response.raise_for_status()
            data = response.json()
            
            return {
                'temperature': data['main']['temp'],
                'humidity': data['main']['humidity'],
                'pressure': data['main']['pressure'],
                'description': data['weather'][0]['description'],
                'wind_speed': data['wind']['speed'],
                'timestamp': time.time()
            }
        except Exception as e:
            print(f"Weather API error: {e}")
            return self._get_mock_weather_data(lat, lon)
    
    def _get_mock_weather_data(self, lat: float, lon: float) -> Dict:
        """Generate mock weather data based on location."""
        # Simple climate simulation based on latitude
        if lat > 40:  # Northern temperate
            temp = 15 + np.random.normal(0, 10)
            humidity = 60 + np.random.normal(0, 20)
        elif lat < -20:  # Southern temperate
            temp = 18 + np.random.normal(0, 8)
            humidity = 65 + np.random.normal(0, 15)
        else:  # Tropical/subtropical
            temp = 28 + np.random.normal(0, 5)
            humidity = 75 + np.random.normal(0, 15)
        
        return {
            'temperature': max(-10, min(50, temp)),
            'humidity': max(10, min(100, humidity)),
            'pressure': 1013 + np.random.normal(0, 20),
            'description': 'clear sky',
            'wind_speed': np.random.uniform(0, 10),
            'timestamp': time.time()
        }

class NDVIAPI:
    """Integration with satellite/NDVI APIs."""
    
    def __init__(self, api_key: Optional[str] = None):
        self.api_key = api_key
        self.base_url = "https://services.sentinel-hub.com/api/v1"
    
    def get_ndvi_data(self, lat: float, lon: float, start_date: str = None, end_date: str = None) -> Dict:
        """Fetch NDVI data from Sentinel Hub API."""
        if not self.api_key:
            return self._get_mock_ndvi_data(lat, lon)
        
        try:
            # This is a simplified version - real implementation would be more complex
            url = f"{self.base_url}/process"
            payload = {
                "input": {
                    "bounds": {
                        "bbox": [lon-0.01, lat-0.01, lon+0.01, lat+0.01]
                    },
                    "data": [{"type": "sentinel-2-l2a"}]
                },
                "output": {"width": 512, "height": 512},
                "evalscript": """
                    //VERSION=3
                    function setup() {
                        return {
                            input: ["B04", "B08"],
                            output: { bands: 1 }
                        };
                    }
                    function evaluatePixel(sample) {
                        return [(sample.B08 - sample.B04) / (sample.B08 + sample.B04)];
                    }
                """
            }
            
            response = requests.post(url, json=payload, timeout=30)
            response.raise_for_status()
            
            # Process NDVI data (simplified)
            ndvi_value = np.random.uniform(0.3, 0.9)  # Mock processing
            
            return {
                'ndvi': ndvi_value,
                'timestamp': time.time(),
                'source': 'sentinel-2'
            }
        except Exception as e:
            print(f"NDVI API error: {e}")
            return self._get_mock_ndvi_data(lat, lon)
    
    def _get_mock_ndvi_data(self, lat: float, lon: float) -> Dict:
        """Generate mock NDVI data based on location and season."""
        import datetime
        
        # Seasonal variation
        month = datetime.datetime.now().month
        if month in [12, 1, 2]:  # Winter
            base_ndvi = 0.4
        elif month in [3, 4, 5]:  # Spring
            base_ndvi = 0.7
        elif month in [6, 7, 8]:  # Summer
            base_ndvi = 0.8
        else:  # Fall
            base_ndvi = 0.6
        
        # Latitude adjustment
        if lat > 40 or lat < -40:  # Temperate regions
            base_ndvi *= 0.8
        elif 20 < lat < 40 or -40 < lat < -20:  # Subtropical
            base_ndvi *= 0.9
        
        ndvi = base_ndvi + np.random.normal(0, 0.1)
        ndvi = max(0.1, min(1.0, ndvi))
        
        return {
            'ndvi': ndvi,
            'timestamp': time.time(),
            'source': 'mock'
        }

class SoilMoistureAPI:
    """Integration with soil moisture APIs."""
    
    def __init__(self, api_key: Optional[str] = None):
        self.api_key = api_key
        self.base_url = "https://api.nasa.gov/insight_weather"
    
    def get_soil_moisture(self, lat: float, lon: float, weather_data: Dict) -> Dict:
        """Get soil moisture data from NASA SMAP or estimate from weather."""
        if not self.api_key:
            return self._estimate_soil_moisture(lat, lon, weather_data)
        
        try:
            # NASA SMAP API integration (simplified)
            url = f"{self.base_url}/api"
            params = {
                'api_key': self.api_key,
                'feedtype': 'json',
                'ver': '1.0'
            }
            
            response = requests.get(url, params=params, timeout=10)
            response.raise_for_status()
            data = response.json()
            
            # Process soil moisture data (simplified)
            soil_moisture = np.random.uniform(0.2, 0.8)
            
            return {
                'soil_moisture': soil_moisture,
                'timestamp': time.time(),
                'source': 'nasa_smap'
            }
        except Exception as e:
            print(f"Soil moisture API error: {e}")
            return self._estimate_soil_moisture(lat, lon, weather_data)
    
    def _estimate_soil_moisture(self, lat: float, lon: float, weather_data: Dict) -> Dict:
        """Estimate soil moisture from weather data using simple water balance model."""
        temp = weather_data['temperature']
        humidity = weather_data['humidity']
        
        # Simple soil moisture estimation
        # Higher temperature and lower humidity = lower soil moisture
        temp_factor = max(0, (35 - temp) / 35)  # Optimal at 35°C
        humidity_factor = humidity / 100
        
        # Base soil moisture from climate zone
        if lat > 40:  # Temperate
            base_moisture = 0.6
        elif lat < -20:  # Southern temperate
            base_moisture = 0.5
        else:  # Tropical
            base_moisture = 0.7
        
        soil_moisture = base_moisture * temp_factor * humidity_factor
        soil_moisture = max(0.1, min(1.0, soil_moisture + np.random.normal(0, 0.1)))
        
        return {
            'soil_moisture': soil_moisture,
            'timestamp': time.time(),
            'source': 'estimated'
        }

class EnvironmentalDataFetcher:
    """Main class to fetch all environmental data."""
    
    def __init__(self, weather_api_key: str = None, ndvi_api_key: str = None, soil_api_key: str = None):
        self.weather_api = WeatherAPI(weather_api_key)
        self.ndvi_api = NDVIAPI(ndvi_api_key)
        self.soil_api = SoilMoistureAPI(soil_api_key)
    
    def fetch_all_data(self, location: str) -> Dict:
        """Fetch all environmental data for a location."""
        # Get coordinates
        lat, lon = self.weather_api.get_coordinates(location)
        
        # Fetch weather data
        weather_data = self.weather_api.get_weather_data(lat, lon)
        
        # Fetch NDVI data
        ndvi_data = self.ndvi_api.get_ndvi_data(lat, lon)
        
        # Fetch soil moisture data
        soil_data = self.soil_api.get_soil_moisture(lat, lon, weather_data)
        
        # Calculate rainfall index (mock for now)
        rainfall_index = self._calculate_rainfall_index(weather_data)
        
        return {
            'location': location,
            'coordinates': {'lat': lat, 'lon': lon},
            'temperature': weather_data['temperature'],
            'humidity': weather_data['humidity'],
            'ndvi': ndvi_data['ndvi'],
            'soil_moisture': soil_data['soil_moisture'],
            'rainfall_index': rainfall_index,
            'timestamp': time.time()
        }
    
    def _calculate_rainfall_index(self, weather_data: Dict) -> float:
        """Calculate rainfall index based on weather conditions."""
        # Mock rainfall calculation
        humidity = weather_data['humidity']
        pressure = weather_data.get('pressure', 1013)
        
        # Simple rainfall probability based on humidity and pressure
        rainfall_prob = (humidity / 100) * (1 - (pressure - 1000) / 50)
        rainfall_index = max(0.1, min(1.0, rainfall_prob + np.random.normal(0, 0.1)))
        
        return rainfall_index
