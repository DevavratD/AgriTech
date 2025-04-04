from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel, Field
import joblib
import pandas as pd
import os
from typing import List
from datetime import datetime

router = APIRouter(
    prefix="/crop",
    tags=["crop_recommendation"]
)

# Model path
MODEL_PATH = "./models/Crop Recommendation/crop_recommendation.joblib"

# Initialize model variable
model = None

def load_model():
    """Load the crop recommendation model."""
    global model
    try:
        if not os.path.exists(MODEL_PATH):
            raise FileNotFoundError(f"Model file not found: {MODEL_PATH}")
            
        model = joblib.load(MODEL_PATH)
        print("Successfully loaded crop recommendation model")
        return True
    except Exception as e:
        print(f"Error loading crop recommendation model: {str(e)}")
        return False

# Try to load model at startup
model_loaded = load_model()

def ensure_model_loaded():
    """Ensure model is loaded before making predictions."""
    global model_loaded
    if not model_loaded or model is None:
        if load_model():
            model_loaded = True
            return True
        raise HTTPException(
            status_code=503,
            detail="Crop recommendation model not loaded. Please ensure model file is present and try again."
        )
    return True

# Define input data model
class CropInput(BaseModel):
    N: float = Field(..., description="Nitrogen content in soil (mg/kg)")
    P: float = Field(..., description="Phosphorus content in soil (mg/kg)")
    K: float = Field(..., description="Potassium content in soil (mg/kg)")
    temperature: float = Field(..., description="Temperature in Celsius")
    humidity: float = Field(..., description="Relative humidity in %")
    ph: float = Field(..., description="pH value of soil")
    rainfall: float = Field(..., description="Annual rainfall in mm")

# Define output model
class CropRecommendation(BaseModel):
    crop: str
    confidence_score: float

class CropResponse(BaseModel):
    recommendations: List[CropRecommendation]
    timestamp: datetime = Field(default_factory=datetime.utcnow)

@router.post("/predict", response_model=CropResponse)
async def predict_crop(data: CropInput):
    ensure_model_loaded()
    try:
        # Convert input to DataFrame
        input_data = pd.DataFrame([data.dict()])
        
        # Get prediction probabilities for all crops
        probabilities = model.predict_proba(input_data)[0]
        
        # Get indices of top 5 predictions
        top_5_indices = probabilities.argsort()[-5:][::-1]
        
        # Create recommendations list
        recommendations = [
            CropRecommendation(
                crop=model.classes_[idx],
                confidence_score=float(probabilities[idx])
            )
            for idx in top_5_indices
        ]
        
        return CropResponse(recommendations=recommendations)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail="Internal server error during prediction")

@router.get("/health")
async def health():
    try:
        ensure_model_loaded()
        return {
            "status": "healthy",
            "model_loaded": True
        }
    except Exception as e:
        return {
            "status": "unhealthy",
            "model_loaded": False,
            "error": str(e)
        } 