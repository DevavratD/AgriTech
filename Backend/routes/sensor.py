from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
import firebase_admin
from firebase_admin import credentials, db
from typing import Optional, Dict, Any
import os
import sys
import pandas as pd
from datetime import datetime

# Add the parent directory to sys.path to import from other modules
current_dir = os.path.dirname(os.path.abspath(__file__))
parent_dir = os.path.dirname(current_dir)
if parent_dir not in sys.path:
    sys.path.append(parent_dir)

# Import soil health prediction functions
from routes.soil_health import predict_soil_health, ensure_models_loaded
# Import weather API utilities
from utils.weather_api import get_weather_data, get_air_quality_data, get_combined_data

router = APIRouter(
    prefix="/api/sensor",
    tags=["sensor"]
)

# Firebase configuration (matching the Express version)
FIREBASE_CONFIG = {
    "apiKey": "AIzaSyC_dTkHtEPeL0zK3xDG4XTpTRwuitmFnL4",
    "authDomain": "wirelessdevice-89402.firebaseapp.com",
    "databaseURL": "https://wirelessdevice-89402-default-rtdb.firebaseio.com",
    "projectId": "wirelessdevice-89402",
    "storageBucket": "wirelessdevice-89402.firebasestorage.app",
    "messagingSenderId": "662014083878",
    "appId": "1:662014083878:web:10c6991c49c6fa902f37e7",
    "measurementId": "G-7TYWSKYZRW"
}

# Initialize Firebase Admin SDK with default credentials
try:
    firebase_admin.get_app()
except ValueError:
    # Get the path to the service account key file
    current_dir = os.path.dirname(os.path.abspath(__file__))
    service_account_path = os.path.join(os.path.dirname(current_dir), 'serviceAccountKey.json')
    
    # Initialize Firebase with the service account key file
    cred = credentials.Certificate(service_account_path)
    firebase_admin.initialize_app(cred, {
        'databaseURL': FIREBASE_CONFIG['databaseURL']
    })

class ThresholdUpdate(BaseModel):
    threshold: float

class IrrigationUpdate(BaseModel):
    irrigation: bool

@router.get("")
async def get_sensor_data():
    try:
        ref = db.reference('wirelessDevice')
        snapshot = ref.get()
        if snapshot:
            # Get soil health prediction with weather data
            soil_health = predict_soil_health_from_sensors(snapshot)
            snapshot["soilHealth"] = soil_health
            
            # Add weather data for frontend (without changing existing structure)
            weather_data = get_weather_data()
            air_quality_data = get_air_quality_data()
            
            # Add timestamp for last updated
            snapshot["lastUpdated"] = datetime.now().isoformat()
            
            # Add weather and air quality data to response without changing existing structure
            if "airQuality" not in snapshot:
                snapshot["airQuality"] = air_quality_data.get("aqi", 0) * 20  # Convert 1-5 scale to 0-100
            
            if "airQualityData" not in snapshot:
                # Create mock time series data for air quality
                snapshot["airQualityData"] = [
                    {"time": "6AM", "value": max(0, air_quality_data.get("aqi", 2) * 20 - 5)},
                    {"time": "9AM", "value": max(0, air_quality_data.get("aqi", 2) * 20 - 10)},
                    {"time": "12PM", "value": max(0, air_quality_data.get("aqi", 2) * 20 - 2)},
                    {"time": "3PM", "value": air_quality_data.get("aqi", 2) * 20},
                    {"time": "6PM", "value": max(0, air_quality_data.get("aqi", 2) * 20 - 3)},
                    {"time": "9PM", "value": max(0, air_quality_data.get("aqi", 2) * 20 + 2)}
                ]
            
            # Add weather alerts based on current weather conditions
            if "weatherAlerts" not in snapshot:
                weather_condition = weather_data.get("weather_condition", "")
                alerts = []
                
                if weather_condition in ["Rain", "Drizzle", "Thunderstorm"]:
                    alerts.append({
                        "id": "w1",
                        "title": f"{weather_condition} Expected",
                        "message": f"Prepare for {weather_data.get('weather_description', 'wet conditions')}. Consider postponing outdoor activities."
                    })
                elif weather_condition in ["Snow", "Mist", "Fog"]:
                    alerts.append({
                        "id": "w2",
                        "title": f"{weather_condition} Alert",
                        "message": f"Reduced visibility due to {weather_data.get('weather_description', 'conditions')}. Take precautions."
                    })
                elif weather_data.get("temperature", 25) > 35:
                    alerts.append({
                        "id": "w3",
                        "title": "High Temperature Alert",
                        "message": f"Temperature is {weather_data.get('temperature', 0)}°C. Ensure plants have adequate water."
                    })
                
                if air_quality_data.get("aqi", 2) >= 4:
                    alerts.append({
                        "id": "a1",
                        "title": "Poor Air Quality",
                        "message": "Air quality is poor. This may affect sensitive crops."
                    })
                
                snapshot["weatherAlerts"] = alerts if alerts else [
                    {
                        "id": "w0",
                        "title": "No Weather Alerts",
                        "message": "Weather conditions are favorable for farming activities."
                    }
                ]
            
            return {"status": "success", "data": snapshot}
        else:
            raise HTTPException(status_code=404, detail="No sensor data found")
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

def predict_soil_health_from_sensors(sensor_data):
    """
    Predict soil health based on sensor data and weather API data
    """
    try:
        # Ensure soil health models are loaded
        ensure_models_loaded()
        
        # Get weather data from OpenWeatherMap API
        weather_data = get_weather_data()
        
        # Map sensor data to soil health model input format
        soil_data = {
            # Use sensor data where available
            "pH": sensor_data.get("ph", 6.5),
            "Nitrogen_ppm": 1500,  # Default value
            "Phosphorus_ppm": 15,  # Default value
            "Potassium_ppm": 200,  # Default value
            "Organic_Carbon_percent": 1.5,  # Default value
            "Salinity_dS_m": sensor_data.get("salinity", 0.8),
            # Use real weather data from API
            "Temperature_C": weather_data.get("temperature", sensor_data.get("temperature", 25.0)),
            "Rainfall_mm": weather_data.get("rainfall_mm", 750),  # Use API data or default
            "Clay_Content_percent": 25.0,  # Default value
            "Soil_Moisture_percent": sensor_data.get("moisture", 50.0)
        }
        
        # Predict soil health
        result = predict_soil_health(soil_data, return_probabilities=False)
        return result
    except Exception as e:
        print(f"Error in soil health prediction: {str(e)}")
        raise

@router.get("/soil-health")
async def get_soil_health():
    """
    Get soil health prediction based on current sensor data
    """
    try:
        ref = db.reference('wirelessDevice')
        snapshot = ref.get()
        
        if snapshot:
            soil_health = predict_soil_health_from_sensors(snapshot)
            return {"status": "success", "data": soil_health}
        else:
            raise HTTPException(status_code=404, detail="No sensor data found")
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/weather")
async def get_weather():
    """
    Get current weather data from OpenWeatherMap API
    """
    try:
        weather_data = get_combined_data()
        return {"status": "success", "data": weather_data}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/update")
async def update_threshold(update: ThresholdUpdate):
    try:
        # Update the threshold in Firebase
        ref = db.reference('wirelessDevice')
        ref.update({
            'threshold': update.threshold
        })
        return {"status": "success", "message": "Threshold updated successfully"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/irrigate")
async def update_irrigation(update: IrrigationUpdate):
    try:
        # Update the irrigation status in Firebase
        ref = db.reference('wirelessDevice')
        ref.update({
            'irrigation': update.irrigation
        })
        return {"status": "success", "message": "Irrigation status updated successfully"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# Add a health check endpoint
@router.get("/health")
async def health_check():
    try:
        # Check Firebase connection
        ref = db.reference('wirelessDevice')
        snapshot = ref.get()
        
        # Check weather API
        weather_data = get_weather_data()
        
        return {
            "status": "healthy",
            "firebase": "connected" if snapshot is not None else "error",
            "weather_api": "connected" if weather_data.get("timestamp", 0) > 0 else "using fallback data",
            "timestamp": datetime.now().isoformat()
        }
    except Exception as e:
        return {
            "status": "unhealthy",
            "error": str(e),
            "timestamp": datetime.now().isoformat()
        }