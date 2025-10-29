"""
Geospatial data processing module using Geopandas and Rasterio
for satellite data analysis and geospatial operations.
"""

import geopandas as gpd
import rasterio
import rasterio.features
import rasterio.warp
import numpy as np
import pandas as pd
from shapely.geometry import Point, Polygon
from typing import Dict, List, Tuple, Optional, Any
import os
from datetime import datetime, timedelta
import requests
import json

class GeospatialProcessor:
    """
    Handles geospatial data processing including satellite imagery,
    NDVI calculations, and spatial analysis.
    """
    
    def __init__(self):
        self.satellite_data_cache = {}
        self.ndvi_cache = {}
        
    def get_satellite_data(self, lat: float, lon: float, date: str = None) -> Dict[str, Any]:
        """
        Fetch satellite data for a given location and date.
        Uses Sentinel Hub API for satellite imagery.
        """
        if date is None:
            date = datetime.now().strftime('%Y-%m-%d')
            
        cache_key = f"{lat}_{lon}_{date}"
        if cache_key in self.satellite_data_cache:
            return self.satellite_data_cache[cache_key]
        
        try:
            # This would integrate with Sentinel Hub API
            # For now, we'll return mock data
            satellite_data = {
                'ndvi': self._calculate_ndvi(lat, lon, date),
                'ndwi': self._calculate_ndwi(lat, lon, date),
                'ndbi': self._calculate_ndbi(lat, lon, date),
                'temperature': self._get_land_surface_temperature(lat, lon, date),
                'precipitation': self._get_precipitation_data(lat, lon, date),
                'soil_moisture': self._get_soil_moisture(lat, lon, date),
                'timestamp': date
            }
            
            self.satellite_data_cache[cache_key] = satellite_data
            return satellite_data
            
        except Exception as e:
            print(f"Error fetching satellite data: {e}")
            return self._get_default_satellite_data()
    
    def _calculate_ndvi(self, lat: float, lon: float, date: str) -> float:
        """
        Calculate Normalized Difference Vegetation Index (NDVI)
        using satellite imagery data.
        """
        # Mock calculation - in real implementation, this would use
        # Sentinel-2 or Landsat data
        base_ndvi = 0.3 + (lat * 0.001) + (lon * 0.0001)
        seasonal_variation = 0.2 * np.sin(2 * np.pi * datetime.now().timetuple().tm_yday / 365)
        return max(0, min(1, base_ndvi + seasonal_variation + np.random.normal(0, 0.1)))
    
    def _calculate_ndwi(self, lat: float, lon: float, date: str) -> float:
        """
        Calculate Normalized Difference Water Index (NDWI)
        """
        base_ndwi = 0.1 + (lat * 0.0005) + (lon * 0.00005)
        return max(0, min(1, base_ndwi + np.random.normal(0, 0.05)))
    
    def _calculate_ndbi(self, lat: float, lon: float, date: str) -> float:
        """
        Calculate Normalized Difference Built-up Index (NDBI)
        """
        base_ndbi = 0.05 + (lat * 0.0002) + (lon * 0.00002)
        return max(0, min(1, base_ndbi + np.random.normal(0, 0.03)))
    
    def _get_land_surface_temperature(self, lat: float, lon: float, date: str) -> float:
        """
        Get land surface temperature from satellite data
        """
        base_temp = 20 + (lat * 0.1) + (lon * 0.01)
        seasonal_variation = 10 * np.sin(2 * np.pi * datetime.now().timetuple().tm_yday / 365)
        return base_temp + seasonal_variation + np.random.normal(0, 2)
    
    def _get_precipitation_data(self, lat: float, lon: float, date: str) -> float:
        """
        Get precipitation data from satellite sources
        """
        base_precip = 2.0 + (lat * 0.01) + (lon * 0.001)
        return max(0, base_precip + np.random.normal(0, 0.5))
    
    def _get_soil_moisture(self, lat: float, lon: float, date: str) -> float:
        """
        Get soil moisture from satellite data
        """
        base_moisture = 0.3 + (lat * 0.001) + (lon * 0.0001)
        return max(0, min(1, base_moisture + np.random.normal(0, 0.1)))
    
    def _get_default_satellite_data(self) -> Dict[str, Any]:
        """
        Return default satellite data when API calls fail
        """
        return {
            'ndvi': 0.5,
            'ndwi': 0.2,
            'ndbi': 0.1,
            'temperature': 25.0,
            'precipitation': 1.5,
            'soil_moisture': 0.4,
            'timestamp': datetime.now().strftime('%Y-%m-%d')
        }
    
    def analyze_spatial_patterns(self, coordinates: List[Tuple[float, float]], 
                                buffer_distance: float = 1000) -> Dict[str, Any]:
        """
        Analyze spatial patterns around a point using buffer analysis
        """
        if not coordinates:
            return {}
        
        # Create point geometries
        points = [Point(lon, lat) for lat, lon in coordinates]
        
        # Create buffer around points
        buffers = [point.buffer(buffer_distance) for point in points]
        
        # Calculate spatial statistics
        analysis = {
            'point_count': len(points),
            'total_area': sum([buffer.area for buffer in buffers]),
            'average_distance': self._calculate_average_distance(points),
            'spatial_clustering': self._calculate_spatial_clustering(points),
            'buffer_analysis': {
                'buffer_distance': buffer_distance,
                'total_buffered_area': sum([buffer.area for buffer in buffers])
            }
        }
        
        return analysis
    
    def _calculate_average_distance(self, points: List[Point]) -> float:
        """
        Calculate average distance between points
        """
        if len(points) < 2:
            return 0.0
        
        distances = []
        for i in range(len(points)):
            for j in range(i + 1, len(points)):
                distance = points[i].distance(points[j])
                distances.append(distance)
        
        return np.mean(distances) if distances else 0.0
    
    def _calculate_spatial_clustering(self, points: List[Point]) -> float:
        """
        Calculate spatial clustering index
        """
        if len(points) < 3:
            return 0.0
        
        # Simple clustering calculation
        distances = []
        for i in range(len(points)):
            for j in range(i + 1, len(points)):
                distances.append(points[i].distance(points[j]))
        
        if not distances:
            return 0.0
        
        mean_distance = np.mean(distances)
        std_distance = np.std(distances)
        
        # Clustering index (lower values indicate more clustering)
        clustering_index = std_distance / mean_distance if mean_distance > 0 else 0
        
        return clustering_index
    
    def process_raster_data(self, raster_path: str, coordinates: Tuple[float, float]) -> Dict[str, Any]:
        """
        Process raster data (like satellite imagery) for a specific location
        """
        try:
            with rasterio.open(raster_path) as src:
                # Get pixel coordinates
                row, col = rasterio.transform.rowcol(src.transform, coordinates[1], coordinates[0])
                
                # Read data around the point
                window = rasterio.windows.Window(col-5, row-5, 10, 10)
                data = src.read(1, window=window)
                
                # Calculate statistics
                stats = {
                    'mean': np.mean(data),
                    'std': np.std(data),
                    'min': np.min(data),
                    'max': np.max(data),
                    'median': np.median(data)
                }
                
                return stats
                
        except Exception as e:
            print(f"Error processing raster data: {e}")
            return {}
    
    def get_vegetation_health(self, lat: float, lon: float, date: str = None) -> Dict[str, Any]:
        """
        Comprehensive vegetation health analysis
        """
        satellite_data = self.get_satellite_data(lat, lon, date)
        
        # Calculate vegetation health metrics
        ndvi = satellite_data['ndvi']
        ndwi = satellite_data['ndwi']
        
        # Vegetation health score (0-1)
        health_score = (ndvi + (1 - ndwi)) / 2
        
        # Health classification
        if health_score > 0.7:
            health_status = 'Excellent'
        elif health_score > 0.5:
            health_status = 'Good'
        elif health_score > 0.3:
            health_status = 'Fair'
        else:
            health_status = 'Poor'
        
        return {
            'health_score': health_score,
            'health_status': health_status,
            'ndvi': ndvi,
            'ndwi': ndwi,
            'vegetation_density': ndvi,
            'water_stress': 1 - ndwi,
            'recommendations': self._get_vegetation_recommendations(health_score, ndvi, ndwi)
        }
    
    def _get_vegetation_recommendations(self, health_score: float, ndvi: float, ndwi: float) -> List[str]:
        """
        Get recommendations based on vegetation health
        """
        recommendations = []
        
        if ndvi < 0.3:
            recommendations.append("Consider irrigation or water management")
            recommendations.append("Check soil nutrient levels")
        
        if ndwi < 0.2:
            recommendations.append("Monitor water availability")
            recommendations.append("Consider drought-resistant crops")
        
        if health_score < 0.5:
            recommendations.append("Schedule soil testing")
            recommendations.append("Review crop rotation strategy")
        
        return recommendations
