from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field
import joblib
import pandas as pd
import os
from typing import Dict, List

router = APIRouter(
    prefix="/soil",
    tags=["soil_health"]
)

# Model directory for soil health models
SHI_MODEL_DIR = "./models/Soil Health Index"

class SoilDataInput(BaseModel):
    pH: float = Field(..., description="Soil pH level", example=6.2)
    Nitrogen_ppm: float = Field(..., description="Nitrogen content in ppm", example=1800)
    Phosphorus_ppm: float = Field(..., description="Phosphorus content in ppm", example=12)
    Potassium_ppm: float = Field(..., description="Potassium content in ppm", example=180)
    Organic_Carbon_percent: float = Field(..., description="Organic carbon percentage", example=1.2)
    Salinity_dS_m: float = Field(..., description="Salinity in dS/m", example=0.8)
    Temperature_C: float = Field(..., description="Temperature in Celsius", example=22.5)
    Rainfall_mm: float = Field(..., description="Annual rainfall in mm", example=750)
    Clay_Content_percent: float = Field(..., description="Clay content percentage", example=25.0)
    Soil_Moisture_percent: float = Field(..., description="Soil moisture percentage", example=27.0)

class SoilHealthResponse(BaseModel):
    health_index: float
    health_category: str
    issues: Dict[str, bool]
    active_issues: List[str]

# Load soil health models
health_model = None
issues_model = None
scaler = None

feature_cols = [
    'pH', 'Nitrogen_ppm', 'Phosphorus_ppm', 'Potassium_ppm', 
    'Organic_Carbon_percent', 'Salinity_dS_m', 'Temperature_C', 
    'Rainfall_mm', 'Clay_Content_percent', 'Soil_Moisture_percent'
]

issue_cols = [
    'Acidic_pH', 'Alkaline_pH', 'Low_Nitrogen', 'High_Nitrogen',
    'Low_Phosphorus', 'High_Phosphorus', 'Low_Potassium', 'High_Potassium',
    'Low_Organic_Carbon', 'High_Organic_Carbon', 'High_Salinity', 'Poor_Texture',
    'Low_Soil_Moisture', 'High_Soil_Moisture'
]

def load_soil_models():
    """Load ML models and scaler."""
    global health_model, issues_model, scaler
    try:
        if not os.path.exists(SHI_MODEL_DIR):
            raise FileNotFoundError(f"Model directory not found: {SHI_MODEL_DIR}")
            
        health_model_path = os.path.join(SHI_MODEL_DIR, 'soil_health_index_model.joblib')
        issues_model_path = os.path.join(SHI_MODEL_DIR, 'soil_issues_model.joblib')
        scaler_path = os.path.join(SHI_MODEL_DIR, 'feature_scaler.joblib')
        
        if not all(os.path.exists(p) for p in [health_model_path, issues_model_path, scaler_path]):
            raise FileNotFoundError("One or more model files are missing")
            
        health_model = joblib.load(health_model_path)
        issues_model = joblib.load(issues_model_path)
        scaler = joblib.load(scaler_path)
        
        print("Successfully loaded soil health models")
        return True
    except Exception as e:
        print(f"Error loading soil health models: {str(e)}")
        return False

# Try to load models at startup
models_loaded = load_soil_models()

def ensure_models_loaded():
    """Ensure models are loaded before making predictions."""
    if not models_loaded or not all([health_model, issues_model, scaler]):
        if load_soil_models():
            return True
        raise HTTPException(
            status_code=503,
            detail="Soil health models not loaded. Please ensure model files are present and try again."
        )
    return True

def predict_soil_health(soil_data: dict, return_probabilities: bool = False) -> dict:
    """Predict soil health index and issues from input data."""
    if isinstance(soil_data, dict):
        soil_data = pd.DataFrame([soil_data])
    
    for col in feature_cols:
        if col not in soil_data.columns:
            raise ValueError(f"Missing required feature: {col}")
    
    soil_data = soil_data[feature_cols]
    scaled_data = scaler.transform(soil_data)
    
    health_index = health_model.predict(scaled_data)
    if hasattr(health_index, "ndim") and health_index.ndim > 1:
        health_index = health_index.flatten()
    
    if return_probabilities:
        issue_probs = issues_model.predict_proba(scaled_data)
        issues = {issue: issue_probs[i][0][1] for i, issue in enumerate(issue_cols)}
    else:
        issues_pred = issues_model.predict(scaled_data)
        issues = {issue: bool(issues_pred[0][i]) for i, issue in enumerate(issue_cols)}
    
    result = {
        'health_index': float(health_index[0]),
        'issues': issues
    }
    
    hi = result['health_index']
    if hi >= 80:
        result['health_category'] = 'Excellent'
    elif hi >= 60:
        result['health_category'] = 'Good'
    elif hi >= 40:
        result['health_category'] = 'Moderate'
    elif hi >= 20:
        result['health_category'] = 'Poor'
    else:
        result['health_category'] = 'Very Poor'
    
    result['active_issues'] = [
        issue.replace('_', ' ') 
        for issue, active in issues.items() 
        if (active if isinstance(active, bool) else active > 0.5)
    ]
    
    return result

@router.post("/predict", response_model=SoilHealthResponse)
def predict_soil(soil_data: SoilDataInput):
    ensure_models_loaded()
    try:
        data = soil_data.dict()
        return predict_soil_health(data, return_probabilities=False)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail="Internal server error during prediction")

@router.post("/predict/detailed")
def predict_soil_detailed(soil_data: SoilDataInput):
    ensure_models_loaded()
    try:
        data = soil_data.dict()
        return predict_soil_health(data, return_probabilities=True)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail="Internal server error during prediction")

@router.get("/health")
def health_check():
    try:
        ensure_models_loaded()
        return {
            "status": "healthy",
            "models_loaded": True
        }
    except Exception as e:
        return {
            "status": "unhealthy",
            "models_loaded": False,
            "error": str(e)
        } 