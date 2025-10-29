import pandas as pd
import numpy as np
from sklearn.ensemble import RandomForestRegressor
from sklearn.model_selection import train_test_split, cross_val_score
from sklearn.preprocessing import LabelEncoder, StandardScaler
from sklearn.metrics import mean_absolute_error, mean_squared_error, r2_score
import joblib
import json
from typing import Dict, List, Tuple
import os

class CropRiskModel:
    """Machine Learning model for crop risk assessment."""
    
    def __init__(self, crop_database_path: str = "data/crop_database.json"):
        self.model = RandomForestRegressor(
            n_estimators=100,
            max_depth=10,
            random_state=42,
            n_jobs=-1
        )
        self.scaler = StandardScaler()
        self.crop_encoder = LabelEncoder()
        self.crop_db = self._load_crop_database(crop_database_path)
        self.feature_columns = None
        self.is_trained = False
    
    def _load_crop_database(self, path: str) -> Dict:
        """Load crop database with optimal ranges."""
        with open(path, 'r') as f:
            return json.load(f)
    
    def prepare_features(self, df: pd.DataFrame) -> Tuple[np.ndarray, np.ndarray]:
        """Prepare features for training."""
        # Create feature matrix
        features = df[['temperature', 'moisture', 'humidity', 'ndvi', 'rainfall']].copy()
        
        # Add crop as categorical feature
        features['crop_encoded'] = self.crop_encoder.fit_transform(df['crop'])
        
        # Add crop category
        crop_categories = df['crop'].map({
            crop: self.crop_db['crops'][crop]['category'] 
            for crop in self.crop_db['crops'].keys()
        })
        features['crop_category_encoded'] = self.crop_encoder.fit_transform(crop_categories)
        
        # Add interaction features
        features['temp_moisture'] = features['temperature'] * features['moisture']
        features['humidity_ndvi'] = features['humidity'] * features['ndvi']
        features['temp_humidity'] = features['temperature'] * features['humidity']
        
        # Add deviation features from optimal ranges
        for idx, row in df.iterrows():
            crop_data = self.crop_db['crops'][row['crop']]
            features.loc[idx, 'temp_deviation'] = abs(row['temperature'] - crop_data['optimal_temp'])
            features.loc[idx, 'moisture_deviation'] = abs(row['moisture'] - crop_data['optimal_moisture'])
            features.loc[idx, 'humidity_deviation'] = abs(row['humidity'] - crop_data['optimal_humidity'])
            features.loc[idx, 'ndvi_deviation'] = abs(row['ndvi'] - crop_data['optimal_ndvi'])
            features.loc[idx, 'rainfall_deviation'] = abs(row['rainfall'] - crop_data['optimal_rainfall'])
        
        self.feature_columns = features.columns.tolist()
        X = features.values
        y = df['risk_score'].values
        
        return X, y
    
    def train(self, df: pd.DataFrame) -> Dict:
        """Train the model on the provided dataset."""
        print("Preparing features...")
        X, y = self.prepare_features(df)
        
        print("Splitting data...")
        X_train, X_test, y_train, y_test = train_test_split(
            X, y, test_size=0.2, random_state=42
        )
        
        print("Scaling features...")
        X_train_scaled = self.scaler.fit_transform(X_train)
        X_test_scaled = self.scaler.transform(X_test)
        
        print("Training model...")
        self.model.fit(X_train_scaled, y_train)
        
        # Make predictions
        y_pred = self.model.predict(X_test_scaled)
        
        # Calculate metrics
        mae = mean_absolute_error(y_test, y_pred)
        mse = mean_squared_error(y_test, y_pred)
        rmse = np.sqrt(mse)
        r2 = r2_score(y_test, y_pred)
        
        # Cross-validation
        cv_scores = cross_val_score(
            self.model, X_train_scaled, y_train, 
            cv=5, scoring='neg_mean_absolute_error'
        )
        
        metrics = {
            'mae': mae,
            'mse': mse,
            'rmse': rmse,
            'r2': r2,
            'cv_mae_mean': -cv_scores.mean(),
            'cv_mae_std': cv_scores.std()
        }
        
        self.is_trained = True
        
        print(f"Training completed!")
        print(f"MAE: {mae:.4f}")
        print(f"RMSE: {rmse:.4f}")
        print(f"R²: {r2:.4f}")
        print(f"CV MAE: {-cv_scores.mean():.4f} ± {cv_scores.std():.4f}")
        
        return metrics
    
    def predict_risk(self, crop: str, temperature: float, moisture: float, 
                    humidity: float, ndvi: float, rainfall: float) -> Dict:
        """Predict risk score for given conditions."""
        if not self.is_trained:
            raise ValueError("Model must be trained before making predictions")
        
        # Create feature vector
        features = np.array([[
            temperature, moisture, humidity, ndvi, rainfall,
            self.crop_encoder.transform([crop])[0],
            self.crop_encoder.transform([self.crop_db['crops'][crop]['category']])[0],
            temperature * moisture,
            humidity * ndvi,
            temperature * humidity,
            abs(temperature - self.crop_db['crops'][crop]['optimal_temp']),
            abs(moisture - self.crop_db['crops'][crop]['optimal_moisture']),
            abs(humidity - self.crop_db['crops'][crop]['optimal_humidity']),
            abs(ndvi - self.crop_db['crops'][crop]['optimal_ndvi']),
            abs(rainfall - self.crop_db['crops'][crop]['optimal_rainfall'])
        ]])
        
        # Scale features
        features_scaled = self.scaler.transform(features)
        
        # Predict risk score
        risk_score = self.model.predict(features_scaled)[0]
        risk_score = max(0.0, min(1.0, risk_score))  # Clamp to [0, 1]
        
        # Get feature importance
        feature_importance = self.model.feature_importances_
        feature_names = self.feature_columns
        
        # Create risk formula weights
        formula_weights = self._create_risk_formula(crop, feature_importance, feature_names)
        
        return {
            'risk_score': risk_score,
            'risk_level': self._get_risk_level(risk_score),
            'formula_weights': formula_weights,
            'feature_importance': dict(zip(feature_names, feature_importance))
        }
    
    def _create_risk_formula(self, crop: str, feature_importance: np.ndarray, 
                           feature_names: List[str]) -> Dict:
        """Create risk formula with learned weights."""
        # Map feature importance to environmental factors
        factor_weights = {
            'temperature': 0.0,
            'moisture': 0.0,
            'humidity': 0.0,
            'ndvi': 0.0,
            'rainfall': 0.0
        }
        
        # Extract weights for main environmental factors
        for i, feature in enumerate(feature_names):
            if feature == 'temperature':
                factor_weights['temperature'] += feature_importance[i]
            elif feature == 'moisture':
                factor_weights['moisture'] += feature_importance[i]
            elif feature == 'humidity':
                factor_weights['humidity'] += feature_importance[i]
            elif feature == 'ndvi':
                factor_weights['ndvi'] += feature_importance[i]
            elif feature == 'rainfall':
                factor_weights['rainfall'] += feature_importance[i]
            elif 'temp_' in feature and 'deviation' in feature:
                factor_weights['temperature'] += feature_importance[i]
            elif 'moisture_' in feature and 'deviation' in feature:
                factor_weights['moisture'] += feature_importance[i]
            elif 'humidity_' in feature and 'deviation' in feature:
                factor_weights['humidity'] += feature_importance[i]
            elif 'ndvi_' in feature and 'deviation' in feature:
                factor_weights['ndvi'] += feature_importance[i]
            elif 'rainfall_' in feature and 'deviation' in feature:
                factor_weights['rainfall'] += feature_importance[i]
        
        # Normalize weights
        total_weight = sum(factor_weights.values())
        if total_weight > 0:
            factor_weights = {k: v/total_weight for k, v in factor_weights.items()}
        
        return factor_weights
    
    def _get_risk_level(self, risk_score: float) -> str:
        """Convert risk score to risk level."""
        if risk_score < 0.3:
            return "Low Risk"
        elif risk_score < 0.6:
            return "Medium Risk"
        else:
            return "High Risk"
    
    def save_model(self, model_path: str = "models/trained_model.pkl"):
        """Save the trained model."""
        if not self.is_trained:
            raise ValueError("Model must be trained before saving")
        
        os.makedirs(os.path.dirname(model_path), exist_ok=True)
        
        model_data = {
            'model': self.model,
            'scaler': self.scaler,
            'crop_encoder': self.crop_encoder,
            'feature_columns': self.feature_columns,
            'crop_db': self.crop_db
        }
        
        joblib.dump(model_data, model_path)
        print(f"Model saved to {model_path}")
    
    def load_model(self, model_path: str = "models/trained_model.pkl"):
        """Load a trained model."""
        if not os.path.exists(model_path):
            raise FileNotFoundError(f"Model file not found: {model_path}")
        
        model_data = joblib.load(model_path)
        self.model = model_data['model']
        self.scaler = model_data['scaler']
        self.crop_encoder = model_data['crop_encoder']
        self.feature_columns = model_data['feature_columns']
        self.crop_db = model_data['crop_db']
        self.is_trained = True
        
        print(f"Model loaded from {model_path}")

if __name__ == "__main__":
    # Generate and train model
    from data.synthetic_data import SyntheticDataGenerator
    
    print("Generating synthetic training data...")
    generator = SyntheticDataGenerator()
    training_data = generator.generate_training_data(samples_per_crop=500)
    
    print("Training model...")
    model = CropRiskModel()
    metrics = model.train(training_data)
    
    print("Saving model...")
    model.save_model()
    
    print("Model training completed successfully!")
