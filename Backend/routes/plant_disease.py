from fastapi import APIRouter, UploadFile, File, HTTPException, Body
from fastapi.responses import JSONResponse
import torch
from torchvision import models
import albumentations as A
from PIL import Image
import io
import numpy as np
import os
import base64
from pydantic import BaseModel

router = APIRouter(
    prefix="/plant",
    tags=["plant_disease"]
)

# Define request model for base64 image
class PlantImageRequest(BaseModel):
    image: str

# Define device
device = torch.device("cuda" if torch.cuda.is_available() else "cpu")

# Load the plant disease detection model
model_path = "./models/Plant Disease/best_tuned_model.pth"
model = models.efficientnet_b0(weights=None)
num_classes = 38
model.classifier[1] = torch.nn.Linear(model.classifier[1].in_features, num_classes)
model.load_state_dict(torch.load(model_path, map_location=device))
model = model.to(device)
model.eval()

# Define class names
classes = [
    "Apple___Apple_scab", "Apple___Black_rot", "Apple___Cedar_apple_rust", "Apple___healthy",
    "Blueberry___healthy", "Cherry_(including_sour)___Powdery_mildew", "Cherry_(including_sour)___healthy",
    "Corn_(maize)___Cercospora_leaf_spot Gray_leaf_spot", "Corn_(maize)___Common_rust_", 
    "Corn_(maize)___Northern_Leaf_Blight", "Corn_(maize)___healthy", "Grape___Black_rot", 
    "Grape___Esca_(Black_Measles)", "Grape___Leaf_blight_(Isariopsis_Leaf_Spot)", "Grape___healthy",
    "Orange___Haunglongbing_(Citrus_greening)", "Peach___Bacterial_spot", "Peach___healthy",
    "Pepper,_bell___Bacterial_spot", "Pepper,_bell___healthy", "Potato___Early_blight", 
    "Potato___Late_blight", "Potato___healthy", "Raspberry___healthy", "Soybean___healthy",
    "Squash___Powdery_mildew", "Strawberry___Leaf_scorch", "Strawberry___healthy",
    "Tomato___Bacterial_spot", "Tomato___Early_blight", "Tomato___Late_blight", 
    "Tomato___Leaf_Mold", "Tomato___Septoria_leaf_spot", "Tomato___Spider_mites Two-spotted_spider_mite",
    "Tomato___Target_Spot", "Tomato___Tomato_Yellow_Leaf_Curl_Virus", "Tomato___Tomato_mosaic_virus",
    "Tomato___healthy"
]

# Define preprocessing
preprocess = A.Compose([
    A.Resize(224, 224),
    A.Normalize(mean=[0.485, 0.456, 0.406], std=[0.229, 0.224, 0.225]),
    A.ToTensorV2()
])

def predict_image(image: Image.Image):
    """Predict plant disease from image."""
    image = np.array(image)
    augmented = preprocess(image=image)
    image_tensor = augmented['image'].unsqueeze(0)
    image_tensor = image_tensor.to(device)
    
    with torch.no_grad():
        outputs = model(image_tensor)
        probabilities = torch.softmax(outputs, dim=1)
        confidence, predicted = torch.max(probabilities, 1)
        predicted_class = classes[predicted.item()]
        confidence_score = confidence.item()
    
    return predicted_class, confidence_score

# Original endpoint for file upload
@router.post("/predict/file")
async def predict_plant_disease_file(file: UploadFile = File(...)):
    try:
        if not file.content_type.startswith('image/'):
            raise HTTPException(status_code=400, detail="File must be an image")
            
        contents = await file.read()
        if not contents:
            raise HTTPException(status_code=400, detail="Empty file")
            
        try:
            image = Image.open(io.BytesIO(contents)).convert("RGB")
        except Exception as e:
            raise HTTPException(status_code=400, detail="Invalid image file")
            
        predicted_class, confidence = predict_image(image)
        return JSONResponse(content={
            "status": "success",
            "data": {
                "predicted_class": predicted_class,
                "confidence": confidence
            }
        })
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error processing image: {str(e)}")

# New endpoint for base64 image
@router.post("/predict")
async def predict_plant_disease(request: PlantImageRequest):
    try:
        # Decode base64 image
        try:
            image_data = base64.b64decode(request.image)
            image = Image.open(io.BytesIO(image_data)).convert("RGB")
        except Exception as e:
            raise HTTPException(status_code=400, detail=f"Invalid base64 image: {str(e)}")
        
        # Predict disease
        predicted_class, confidence = predict_image(image)
        
        # Return prediction
        return JSONResponse(content={
            "status": "success",
            "data": {
                "predicted_class": predicted_class,
                "confidence": confidence
            }
        })
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error processing image: {str(e)}")