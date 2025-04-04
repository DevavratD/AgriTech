from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
import uvicorn
import os
from dotenv import load_dotenv

# Import routers
from routes import plant_disease, soil_health, crop_recommendation, sensor, market

# Load environment variables
load_dotenv()

app = FastAPI(
    title="KrishiMitra API",
    description="Backend API for KrishiMitra - A Smart Agriculture Platform",
    version="2.0.0"
)

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allows all origins
    allow_credentials=True,
    allow_methods=["*"],  # Allows all methods
    allow_headers=["*"],  # Allows all headers
)

# Include routers
app.include_router(plant_disease.router)
app.include_router(soil_health.router)
app.include_router(crop_recommendation.router)
app.include_router(sensor.router)
app.include_router(market.router)

@app.get("/")
async def root():
    return {
        "message": "Welcome to KrishiMitra API",
        "endpoints": {
            "/plant/predict": "Plant disease detection",
            "/soil/predict": "Soil health prediction",
            "/soil/predict/detailed": "Detailed soil health prediction",
            "/crop/predict": "Crop recommendation",
            "/crop/health": "Crop recommendation health check",
            "/api/sensor": "Get sensor data",
            "/api/sensor/update": "Update sensor threshold",
            "/api/sensor/irrigate": "Update irrigation status"
        }
    }

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)