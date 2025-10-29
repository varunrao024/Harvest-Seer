# Harvest Seer - AI-Powered Crop Risk Assessment System

![Harvest Seer Logo](public/logo.png)

## 🌾 Overview

Harvest Seer is an advanced AI-powered agricultural risk assessment platform that helps farmers make data-driven decisions about crop planting, management, and risk mitigation. The system combines machine learning, geospatial analysis, and real-time environmental data to provide comprehensive crop risk assessments.

## ✨ Features

- **AI-Powered Risk Assessment**: Machine learning models trained on historical crop data
- **Real-Time Environmental Monitoring**: Weather, soil, and climate data integration
- **Interactive Maps**: Geospatial visualization with Leaflet and Mapbox integration
- **Crop Recommendations**: Personalized suggestions based on location and conditions
- **Risk Heatmaps**: Visual representation of risk factors across regions
- **Weather Forecasting**: Integration with weather APIs for predictive analysis
- **Scientific Methodology**: Transparent AI decision-making process

## 🚀 Quick Start

### Prerequisites

- **Python 3.12+** (with pip)
- **Node.js 18+** (with npm)
- **Git** (for version control)

### Installation

1. **Clone the repository:**
   ```bash
   git clone https://github.com/yourusername/harvest-seer.git
   cd harvest-seer
   ```

2. **Install Python dependencies:**
   ```bash
   cd backend
   pip install -r requirements.txt
   ```

3. **Install Node.js dependencies:**
   ```bash
   npm install
   ```

4. **Start the application:**
   ```bash
   # Windows
   START_APP.bat
   
   # Or manually:
   # Terminal 1: Start backend
   cd backend && python app.py
   
   # Terminal 2: Start frontend
   npm run dev
   ```

5. **Access the application:**
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:5000

## 🏗️ Architecture

### Frontend (Next.js)
- **Framework**: Next.js 14 with TypeScript
- **Styling**: Tailwind CSS
- **Maps**: Leaflet and Mapbox integration
- **Charts**: Plotly.js for data visualization
- **State Management**: React Context API

### Backend (Flask)
- **Framework**: Flask 3.0
- **ML Models**: Scikit-learn
- **Geospatial**: GeoPandas, Rasterio, Shapely
- **Data Processing**: Pandas, NumPy
- **APIs**: RESTful API with CORS support

### Key Components

```
src/
├── components/          # React components
│   ├── CropSelector.tsx
│   ├── RiskHeatmap.tsx
│   ├── WeatherForecast.tsx
│   └── ...
├── hooks/               # Custom React hooks
├── contexts/            # React context providers
└── lib/                 # Utility functions

backend/
├── app.py              # Flask application
├── model.py            # ML model definitions
├── geospatial_processor.py
├── risk_calculator.py
└── data/               # Training data and models
```

## 🔧 Configuration

### Environment Variables

Create a `.env` file in the root directory:

```env
# API Keys (Optional - app works without them)
OPENWEATHER_API_KEY=your_openweather_api_key
MAPBOX_ACCESS_TOKEN=your_mapbox_token

# Database (Optional)
MONGODB_URI=mongodb://localhost:27017/harvest_seer

# Cloud Services (Optional)
AWS_ACCESS_KEY_ID=your_aws_key
AWS_SECRET_ACCESS_KEY=your_aws_secret
GOOGLE_CLOUD_PROJECT=your_gcp_project
```

### Optional Services

The application works without these services, but they enhance functionality:

- **MongoDB**: For data persistence
- **AWS SDK**: For cloud storage
- **Google Cloud**: For BigQuery analytics
- **Weather APIs**: For real-time weather data

## 📊 Usage

1. **Select Location**: Use the interactive map to choose your farm location
2. **Choose Crop**: Select from the available crop types
3. **View Assessment**: Get AI-powered risk analysis and recommendations
4. **Monitor Conditions**: Track real-time environmental factors
5. **Plan Actions**: Use recommendations for optimal crop management

## 🤖 AI Model

The system uses machine learning models trained on:
- Historical crop yield data
- Weather patterns
- Soil composition
- Geographic factors
- Market conditions

### Model Performance
- **Accuracy**: 85%+ on test datasets
- **Training Data**: Synthetic and real agricultural data
- **Features**: 50+ environmental and geographic variables

## 🛠️ Development

### Running Tests
```bash
# Backend tests
cd backend
python -m pytest

# Frontend tests
npm test
```

### Building for Production
```bash
# Build frontend
npm run build

# Start production server
npm start
```

## 📈 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- Agricultural data providers
- Open-source geospatial libraries
- Weather API services
- Machine learning community

## 📞 Support

For support and questions:
- Create an issue on GitHub
- Check the documentation
- Review the troubleshooting guide

---

**Harvest Seer** - Making agriculture smarter with AI 🌱
