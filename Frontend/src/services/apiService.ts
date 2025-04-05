import axios from 'axios';

// The backend API URL - this should match your backend server address
const API_BASE_URL = 'http://localhost:8000';

// Create an axios instance for API calls
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// General API interfaces
export interface ApiResponse<T> {
  status: string;
  data?: T;
  message?: string;
}

// Plant disease related interfaces and functions
export interface PlantDiseaseRequest {
  image: string; // base64 encoded image
}

export interface PlantDiseaseResponse {
  disease: string;
  confidence: number;
  treatment?: string;
  prevention?: string;
}

// Function to get AI-generated recommendations for plant diseases
export const getAIRecommendations = async (diseaseName: string): Promise<{treatment: string, prevention: string}> => {
  try {
    const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY;
    
    if (!GEMINI_API_KEY) {
      console.warn('Gemini API key not found, using fallback recommendations');
      return {
        treatment: getDiseaseTreatment(diseaseName),
        prevention: getDiseasePrevention(diseaseName)
      };
    }
    
    const response = await fetch(`https://generativelanguage.googleapis.com/v1/models/gemini-1.5-flash:generateContent?key=${GEMINI_API_KEY}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        contents: [{
          parts: [{
            text: `You are an agricultural expert. I need treatment and prevention recommendations for a plant disease: "${diseaseName}".
            
            Please provide:
            1. Treatment recommendations (what to do now that the disease is present)
            2. Prevention tips (how to avoid this disease in the future)
            
            Format your response as a JSON object with two properties: "treatment" and "prevention". 
            Each should be a concise paragraph with practical advice. Keep each under 150 words.
            
            Example format:
            {
              "treatment": "Your treatment recommendations here...",
              "prevention": "Your prevention tips here..."
            }`
          }]
        }]
      })
    });
    
    const data = await response.json();
    
    try {
      // Check if data has the expected structure
      if (data && data.candidates && data.candidates.length > 0 && 
          data.candidates[0].content && data.candidates[0].content.parts && 
          data.candidates[0].content.parts.length > 0) {
            
        const content = data.candidates[0].content.parts[0].text;
        const jsonMatch = content.match(/\{[\s\S]*\}/);
        
        if (jsonMatch) {
          const recommendations = JSON.parse(jsonMatch[0]);
          return {
            treatment: recommendations.treatment || getDiseaseTreatment(diseaseName),
            prevention: recommendations.prevention || getDiseasePrevention(diseaseName)
          };
        }
      } else {
        console.warn('Unexpected API response structure:', data);
      }
    } catch (parseError) {
      console.error('Error parsing AI response:', parseError);
    }
    
    // Fallback to static recommendations
    return {
      treatment: getDiseaseTreatment(diseaseName),
      prevention: getDiseasePrevention(diseaseName)
    };
  } catch (error) {
    console.error('Error getting AI recommendations:', error);
    return {
      treatment: getDiseaseTreatment(diseaseName),
      prevention: getDiseasePrevention(diseaseName)
    };
  }
};

export const detectPlantDisease = async (imageData: string): Promise<ApiResponse<PlantDiseaseResponse>> => {
  try {
    // First, try to use the backend API
    const response = await apiClient.post('/plant/predict', { image: imageData });
    
    // The backend response might have different field names than what our frontend expects
    // So we need to transform the response
    const backendData = response.data;
    
    // Check if we have the expected backend format (predicted_class and confidence)
    if (backendData.data && backendData.data.predicted_class) {
      const diseaseName = backendData.data.predicted_class;
      const formattedDiseaseName = formatDiseaseName(diseaseName);
      
      // Get AI-generated recommendations
      const recommendations = await getAIRecommendations(diseaseName);
      
      // Transform backend format to our frontend format
      return {
        status: "success",
        data: {
          disease: formattedDiseaseName,
          confidence: backendData.data.confidence,
          treatment: recommendations.treatment,
          prevention: recommendations.prevention
        }
      };
    }
    
    // If the response is already in our expected format, return it directly
    return response.data;
  } catch (error) {
    console.error('Error detecting plant disease:', error);
    
    // For demo/fallback purposes, return mock data if the API call fails
    return {
      status: "success",
      data: {
        disease: "Tomato Late Blight",
        confidence: 0.92,
        treatment: "Apply copper-based fungicides as soon as symptoms appear. Remove and destroy infected plant parts. Ensure good air circulation around plants.",
        prevention: "Use disease-resistant varieties. Avoid overhead watering. Rotate crops. Remove plant debris at the end of the season. Space plants for good air circulation."
      }
    };
  }
};

// Helper function to format disease name from model output
function formatDiseaseName(rawName: string): string {
  // Convert model output format (e.g., "Tomato___Late_blight") to readable format
  const parts = rawName.split('___');
  if (parts.length !== 2) return rawName;
  
  const plant = parts[0];
  const condition = parts[1].replace(/_/g, ' ');
  
  if (condition.toLowerCase() === 'healthy') {
    return `Healthy ${plant}`;
  } else {
    return `${plant} ${condition}`;
  }
}

// Helper function to get treatment recommendations based on disease
function getDiseaseTreatment(diseaseName: string): string {
  const treatments: Record<string, string> = {
    "Tomato___Late_blight": "Apply copper-based fungicides as soon as symptoms appear. Remove and destroy infected plant parts. Ensure good air circulation around plants.",
    "Tomato___Early_blight": "Remove infected leaves immediately. Apply fungicides containing chlorothalonil, copper, or mancozeb. Ensure adequate spacing between plants for air circulation.",
    "Tomato___Leaf_Mold": "Improve air circulation by pruning and spacing plants. Apply fungicides containing chlorothalonil or copper. Remove and destroy infected leaves.",
    "Tomato___Bacterial_spot": "Apply copper-based bactericides. Avoid overhead watering. Remove infected plant debris. Rotate crops with non-solanaceous plants.",
    "Potato___Late_blight": "Apply fungicides containing chlorothalonil or copper. Remove infected plants to prevent spread. Destroy all plant debris after harvest.",
    "Potato___Early_blight": "Apply fungicides containing chlorothalonil or copper. Remove lower infected leaves. Ensure proper plant spacing for air circulation.",
    "Apple___Apple_scab": "Apply fungicides containing myclobutanil or captan. Rake and destroy fallen leaves. Prune trees to improve air circulation.",
    "Apple___Black_rot": "Prune out infected branches. Apply fungicides containing captan or thiophanate-methyl. Remove mummified fruits from trees and ground.",
    "Grape___Black_rot": "Apply fungicides containing myclobutanil or captan. Remove mummified berries. Prune to improve air circulation.",
    "Corn_(maize)___Common_rust_": "Apply fungicides containing azoxystrobin or propiconazole. Plant resistant varieties in future seasons.",
    "Pepper,_bell___Bacterial_spot": "Apply copper-based bactericides. Avoid overhead watering. Remove infected plant debris. Rotate crops with non-solanaceous plants."
  };
  
  return treatments[diseaseName] || "Consult with a local agricultural extension for specific treatment recommendations based on your location and severity of the disease.";
}

// Helper function to get prevention recommendations based on disease
function getDiseasePrevention(diseaseName: string): string {
  const preventions: Record<string, string> = {
    "Tomato___Late_blight": "Use disease-resistant varieties. Avoid overhead watering. Rotate crops. Remove plant debris at the end of the season. Space plants for good air circulation.",
    "Tomato___Early_blight": "Rotate crops with non-solanaceous plants. Mulch around plants. Water at the base of plants. Use disease-resistant varieties when available.",
    "Tomato___Leaf_Mold": "Avoid high humidity in greenhouses. Space plants properly. Use resistant varieties. Avoid wetting leaves when watering.",
    "Tomato___Bacterial_spot": "Use disease-free seeds and transplants. Rotate crops. Avoid working with wet plants. Disinfect garden tools regularly.",
    "Potato___Late_blight": "Plant resistant varieties. Use certified disease-free seed potatoes. Avoid overhead irrigation. Destroy volunteer potatoes.",
    "Potato___Early_blight": "Rotate crops. Use certified disease-free seed potatoes. Mulch around plants. Avoid overhead irrigation.",
    "Apple___Apple_scab": "Plant resistant varieties. Space trees adequately. Prune regularly for good air circulation. Clean up fallen leaves in autumn.",
    "Apple___Black_rot": "Prune out dead or diseased wood. Remove nearby wild or abandoned apple trees. Clean up fallen fruit promptly.",
    "Grape___Black_rot": "Prune vines properly. Remove mummified berries. Apply dormant sprays. Maintain good air circulation in the canopy.",
    "Corn_(maize)___Common_rust_": "Plant resistant hybrids. Avoid late planting. Maintain balanced soil fertility. Rotate crops.",
    "Pepper,_bell___Bacterial_spot": "Use disease-free seeds and transplants. Rotate crops. Avoid overhead irrigation. Disinfect garden tools."
  };
  
  return preventions[diseaseName] || "Practice crop rotation, maintain good garden hygiene, use disease-resistant varieties when available, and ensure proper spacing for air circulation.";
}

// Soil health related interfaces and functions
export interface SoilHealthRequest {
  image: string; // base64 encoded image
}

export interface SoilHealthResponse {
  health: string;
  npk_values?: {
    nitrogen: number;
    phosphorus: number;
    potassium: number;
  };
  recommendations?: string[];
}

export const analyzeSoilHealth = async (imageData: string): Promise<ApiResponse<SoilHealthResponse>> => {
  try {
    const response = await apiClient.post('/soil/predict', { image: imageData });
    return response.data;
  } catch (error) {
    console.error('Error analyzing soil health:', error);
    throw error;
  }
};

export const getDetailedSoilHealth = async (imageData: string): Promise<ApiResponse<SoilHealthResponse>> => {
  try {
    const response = await apiClient.post('/soil/predict/detailed', { image: imageData });
    return response.data;
  } catch (error) {
    console.error('Error getting detailed soil health:', error);
    throw error;
  }
};

// Function to get AI-generated soil insights
export const getSoilAIInsights = async (soilData: {
  overallHealth: number;
  metrics: {
    name: string;
    value: number;
  }[];
}): Promise<string[]> => {
  try {
    const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY;
    
    if (!GEMINI_API_KEY) {
      console.warn('Gemini API key not found, using fallback soil insights');
      return getFallbackSoilInsights(soilData.metrics);
    }
    
    // Format metrics for the prompt
    const metricsText = soilData.metrics
      .map(metric => `${metric.name}: ${metric.value}%`)
      .join('\n');
    
    try {
      const response = await fetch(`https://generativelanguage.googleapis.com/v1/models/gemini-1.5-flash:generateContent?key=${GEMINI_API_KEY}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          contents: [{
            parts: [{
              text: `You are an agricultural soil expert. I need specific, actionable recommendations to address the following soil issues:
              
              Overall Soil Health: ${soilData.overallHealth}%
              ${metricsText}
              
              For each metric listed above:
              1. Provide a VERY CONCISE, direct action to take (1-2 sentences max)
              2. Focus ONLY on immediate, practical steps a farmer can take TODAY
              3. Be specific about quantities, methods, or products to use
              
              Format your response as a JSON array of strings, with each string being a complete but brief recommendation.
              Keep each recommendation under 100 characters if possible.
              
              Example format:
              [
                "Add 2kg compost per square meter to improve organic content.",
                "Install drip irrigation on 12-hour cycle to address low moisture."
              ]`
            }]
          }]
        })
      });
      
      // Check if response is ok
      if (!response.ok) {
        console.error(`API response not OK: ${response.status} ${response.statusText}`);
        return getFallbackSoilInsights(soilData.metrics);
      }
      
      const data = await response.json();
      
      // Check if data has the expected structure
      if (data && data.candidates && data.candidates.length > 0 && 
          data.candidates[0].content && data.candidates[0].content.parts && 
          data.candidates[0].content.parts.length > 0) {
            
        const content = data.candidates[0].content.parts[0].text;
        const jsonMatch = content.match(/\[\s\S]*\]/);
        
        if (jsonMatch) {
          try {
            const insights = JSON.parse(jsonMatch[0]);
            if (Array.isArray(insights) && insights.length > 0) {
              return insights;
            }
          } catch (jsonError) {
            console.error('Error parsing JSON from API response:', jsonError);
            return getFallbackSoilInsights(soilData.metrics);
          }
        }
      }
      
      console.warn('Unexpected API response structure:', JSON.stringify(data));
      return getFallbackSoilInsights(soilData.metrics);
    } catch (error) {
      console.error('Error getting soil insights from API:', error);
      return getFallbackSoilInsights(soilData.metrics);
    }
    
    // Fallback to static insights
    return getFallbackSoilInsights(soilData.metrics);
  } catch (error) {
    console.error('Error getting AI soil insights:', error);
    return getFallbackSoilInsights(soilData.metrics);
  }
};

// Helper function for fallback soil insights
function getFallbackSoilInsights(metrics: { name: string; value: number }[]): string[] {
  // Predefined insights based on soil metrics
  const PREDEFINED_INSIGHTS: Record<string, string[]> = {
    "Moisture": [
      "Add 2-3cm water immediately. Install drip irrigation system.",
      "Monitor moisture levels. Water if soil feels dry 2cm below surface.",
      "Reduce watering by 30%. Improve drainage with ditches or raised beds."
    ],
    "Organic Content": [
      "Add 5kg compost per 10m². Till into top 15cm of soil.",
      "Apply 2kg compost per 10m². Plant cover crops like clover.",
      "Maintain with annual light compost application of 1kg per 10m²."
    ],
    "Temperature": [
      "Use black plastic mulch to warm soil. Delay planting by 7-10 days.",
      "Apply 5cm organic mulch to maintain temperature stability.",
      "Add 8cm straw mulch to reduce soil temperature. Water in morning."
    ],
    "Salinity": [
      "Flush soil with 5cm fresh water weekly for one month. Add gypsum.",
      "Leach soil with 3cm water twice monthly. Avoid high-salt fertilizers.",
      "Monitor salinity monthly. Continue current irrigation practices."
    ]
  };
  
  // Get insights for metrics
  return metrics.map(metric => {
    const insights = PREDEFINED_INSIGHTS[metric.name];
    if (!insights) {
      return `Improve ${metric.name.toLowerCase()} levels with appropriate soil amendments.`;
    }
    
    // Select appropriate insight based on value
    if (metric.value < 40) {
      return insights[0]; // Low value insight
    } else if (metric.value < 60) {
      return insights[1]; // Moderate value insight
    } else {
      return insights[2]; // Higher value insight (but still < 70)
    }
  });
}

// Crop recommendation related interfaces and functions
export interface CropRecommendationRequest {
  N: number;
  P: number;
  K: number;
  temperature: number;
  humidity: number;
  ph: number;
  rainfall: number;
}

export interface CropRecommendation {
  crop: string;
  confidence_score: number;
}

export interface CropRecommendationResponse {
  recommendations: CropRecommendation[];
  timestamp: string;
  data?: any;
}

export const getRecommendedCrop = async (data: CropRecommendationRequest): Promise<ApiResponse<CropRecommendationResponse>> => {
  try {
    // Convert frontend property names to backend expected format
    const backendData = {
      N: data.N,
      P: data.P,
      K: data.K,
      temperature: data.temperature,
      humidity: data.humidity,
      ph: data.ph,
      rainfall: data.rainfall
    };
    
    const response = await apiClient.post('/crop/predict', backendData);
    console.log('Raw API response:', response.data);
    
    // Ensure the response has the correct structure
    if (response.data && response.data.status === "success") {
      // If the response doesn't have recommendations property, create it
      if (!response.data.data.recommendations) {
        // Transform the response to match our expected format
        const transformedData = {
          recommendations: [
            {
              crop: response.data.data.crop || response.data.data.recommended_crop,
              confidence_score: response.data.data.confidence_score || response.data.data.confidence || 0.9
            }
          ],
          timestamp: response.data.data.timestamp || new Date().toISOString()
        };
        response.data.data = transformedData;
      }
    }
    
    return response.data;
  } catch (error) {
    console.error('Error getting crop recommendation:', error);
    
    // Provide fallback data for testing or when backend is unavailable
    return {
      status: "success",
      data: {
        recommendations: [
          { crop: "rice", confidence_score: 0.92 },
          { crop: "maize", confidence_score: 0.85 },
          { crop: "cotton", confidence_score: 0.78 },
          { crop: "mungbean", confidence_score: 0.65 },
          { crop: "kidneybeans", confidence_score: 0.52 }
        ],
        timestamp: new Date().toISOString()
      }
    };
  }
};

export const getCropRecommendationsFromSensors = async (): Promise<ApiResponse<CropRecommendationResponse>> => {
  try {
    // First, get the latest sensor data
    console.log('Fetching sensor data from /api/sensor');
    const sensorResponse = await apiClient.get('/api/sensor');
    console.log('Sensor response:', sensorResponse.data);
    
    // Check if we got valid sensor data
    if (sensorResponse.data) {
      // Extract sensor data - handle different response structures
      const sensorData = sensorResponse.data.data || sensorResponse.data;
      console.log('Extracted sensor data:', sensorData);
      
      // Format sensor data for crop recommendation
      // Use fallback values only for NPK and pH, which don't come from sensors
      const cropData = {
        // NPK values don't come from sensors, use fallback values
        N: 90,
        P: 46,
        K: 42,
        // Use actual sensor values for temperature, humidity, and rainfall with fallbacks
        temperature: sensorData.temperature || 25.5,
        humidity: sensorData.humidity || 81.45,
        // pH doesn't come from sensors, use fallback value
        ph: 7.50,
        rainfall: sensorData.rainfall || 250.08
      };
      
      console.log('Sending crop data to /crop/predict:', cropData);
      
      try {
        // Call the crop recommendation API with sensor data
        const response = await apiClient.post('/crop/predict', cropData);
        console.log('Raw sensor-based recommendation response:', response.data);
        
        // Handle different response formats
        if (response.data && response.data.status === "success") {
          if (response.data.data && !response.data.data.recommendations && response.data.data.crop) {
            // Transform single crop response to recommendations array format
            const transformedData = {
              recommendations: [
                {
                  crop: response.data.data.crop,
                  confidence_score: response.data.data.confidence_score || 0.9
                }
              ],
              timestamp: response.data.data.timestamp || new Date().toISOString()
            };
            response.data.data = transformedData;
          }
          return response.data;
        } else if (response.data && response.data.recommendations) {
          // If recommendations are directly in the response data
          return {
            status: "success",
            data: response.data
          };
        } else if (response.data && response.data.crop) {
          // If a single crop is directly in the response data
          return {
            status: "success",
            data: {
              recommendations: [
                {
                  crop: response.data.crop,
                  confidence_score: response.data.confidence_score || 0.9
                }
              ],
              timestamp: new Date().toISOString()
            }
          };
        }
        
        return response.data;
      } catch (apiError) {
        console.error('Error calling crop prediction API:', apiError);
        console.log('Using fallback data for crop recommendations (API error)');
        return getFallbackCropRecommendations();
      }
    } else {
      // If sensor API returns data but not in expected format, use fallback data
      console.log('Using fallback data for crop recommendations (sensor API returned unexpected format)');
      return getFallbackCropRecommendations();
    }
  } catch (error) {
    console.error('Error getting crop recommendations from sensors:', error);
    
    // Provide fallback data when API fails
    console.log('Using fallback data for crop recommendations (API error)');
    return getFallbackCropRecommendations();
  }
};

// Helper function to provide consistent fallback data
const getFallbackCropRecommendations = (): ApiResponse<CropRecommendationResponse> => {
  return {
    status: "success",
    data: {
      recommendations: [
        { crop: "rice", confidence_score: 0.95 },
        { crop: "maize", confidence_score: 0.82 },
        { crop: "cotton", confidence_score: 0.78 },
        { crop: "mungbean", confidence_score: 0.65 },
        { crop: "kidneybeans", confidence_score: 0.52 }
      ],
      timestamp: new Date().toISOString()
    }
  };
};

export const checkCropHealth = async (): Promise<ApiResponse<{ status: string }>> => {
  try {
    const response = await apiClient.get('/crop/health');
    return response.data;
  } catch (error) {
    console.error('Error checking crop health:', error);
    throw error;
  }
};

// Market Insights API
export interface MarketDataItem {
  'S.No': string;
  'Date': string;
  'Market': string;
  'Commodity': string;
  'Variety': string;
  'Min Price': string;
  'Max Price': string;
  'Modal Price': string;
}

export interface MarketInsightsResponse {
  length?: number;
  commodity?: string;
  state?: string;
  market?: string;
  min_price?: number;
  max_price?: number;
  modal_price?: number;
  date?: string;
  price_trend?: string;
  ai_insights?: {
    market_analysis: string;
    price_prediction: string;
    trading_recommendation: string;
  };
  historical_data?: {
    date: string;
    price: number;
  }[];
}

// Transform API response to a more consistent format
const transformMarketData = (data: any): MarketInsightsResponse => {
  // Check if data is an array (API response)
  if (Array.isArray(data) && data.length > 0) {
    // Current data is the first item in the array
    const currentData = data[0];
    
    // Format historical data for chart
    const historicalData = data.map(item => ({
      date: item['Date'],
      price: parseInt(item['Modal Price'])
    }));
    
    // Return in our consistent format
    return {
      commodity: currentData['Commodity'],
      market: currentData['Market'],
      state: '', // API doesn't return state
      min_price: parseInt(currentData['Min Price']),
      max_price: parseInt(currentData['Max Price']),
      modal_price: parseInt(currentData['Modal Price']),
      date: currentData['Date'],
      historical_data: historicalData
    };
  }
  
  // If it's already in our format, return as is
  return data;
};

// Fallback market insights data
const getFallbackMarketInsights = (
  commodity: string,
  state: string,
  market: string
): MarketInsightsResponse => {
  // Generate realistic fallback data based on the commodity
  const today = new Date().toISOString().split('T')[0];
  
  // Different price ranges for different commodities
  const priceRanges: Record<string, { min: number, max: number, modal: number }> = {
    'Potato': { min: 1200, max: 1800, modal: 1500 },
    'Rice': { min: 1800, max: 2400, modal: 2100 },
    'Wheat': { min: 2000, max: 2600, modal: 2300 },
    'Onion': { min: 1500, max: 2200, modal: 1800 },
    'Tomato': { min: 1000, max: 1600, modal: 1300 },
    'Cotton': { min: 5500, max: 6500, modal: 6000 },
    'Maize': { min: 1700, max: 2300, modal: 2000 },
    'Soyabean': { min: 3800, max: 4500, modal: 4200 }
  };
  
  // Use the price range for the specified commodity, or default to Potato
  const priceRange = priceRanges[commodity] || priceRanges['Potato'];
  
  return {
    commodity,
    state,
    market,
    min_price: priceRange.min,
    max_price: priceRange.max,
    modal_price: priceRange.modal,
    date: today,
    price_trend: 'stable'
  };
};

/**
 * Fetches market insights for a specific commodity, state, and market
 * @param commodity The commodity to get market insights for (e.g., "Potato")
 * @param state The state where the market is located (e.g., "Maharashtra")
 * @param market The specific market to get data for (e.g., "Pune")
 * @returns Market insights data
 */
export const getMarketInsights = async (
  commodity: string,
  state: string,
  market: string
): Promise<ApiResponse<MarketInsightsResponse>> => {
  try {
    console.log(`Fetching market insights for ${commodity} in ${market}, ${state}`);
    
    // First try to use the backend API
    try {
      const response = await apiClient.get(`/api/market/insights?commodity=${commodity}&state=${state}&market=${market}`);
      console.log('Backend API response:', response.data);
      
      if (response.data) {
        const transformedData = transformMarketData(response.data);
        
        // Get AI insights for the market data
        const aiInsights = await getMarketAIInsights(transformedData);
        transformedData.ai_insights = aiInsights;
        
        return {
          status: "success",
          data: transformedData
        };
      }
    } catch (backendError) {
      console.error('Error fetching from backend:', backendError);
      // Continue to fallback if backend fails
    }
    
    // Fallback to mock data if backend fails
    console.log('Using fallback market data');
    const fallbackData = getFallbackMarketInsights(commodity, state, market);
    
    // Get AI insights for the fallback data
    const aiInsights = await getMarketAIInsights(fallbackData);
    fallbackData.ai_insights = aiInsights;
    
    return {
      status: "success",
      data: fallbackData
    };
  } catch (error) {
    console.error('Error fetching market insights:', error);
    
    // Use fallback data in case of any error
    const fallbackData = getFallbackMarketInsights(commodity, state, market);
    console.log('Using fallback market data due to error:', fallbackData);
    
    return {
      status: "success", // Return success with fallback data instead of error
      data: fallbackData
    };
  }
};

// Function to get AI-generated market insights
export const getMarketAIInsights = async (marketData: MarketInsightsResponse): Promise<{
  market_analysis: string;
  price_prediction: string;
  trading_recommendation: string;
}> => {
  try {
    const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY;
    
    if (!GEMINI_API_KEY) {
      console.warn('Gemini API key not found, using fallback market insights');
      return {
        market_analysis: getFallbackMarketAnalysis(marketData.commodity || ""),
        price_prediction: getFallbackPricePrediction(marketData.commodity || "", marketData.modal_price || 0),
        trading_recommendation: getFallbackTradingRecommendation(marketData.commodity || "")
      };
    }
    
    const response = await fetch(`https://generativelanguage.googleapis.com/v1/models/gemini-1.5-flash:generateContent?key=${GEMINI_API_KEY}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        contents: [{
          parts: [{
            text: `You are an agricultural market expert. I need insights about the following market data:
            
            Commodity: ${marketData.commodity}
            Market: ${marketData.market}, ${marketData.state}
            Current Modal Price: ₹${marketData.modal_price}/quintal
            Min Price: ₹${marketData.min_price}/quintal
            Max Price: ₹${marketData.max_price}/quintal
            Date: ${marketData.date}
            
            Please provide:
            1. Market Analysis: A brief analysis of the current market situation for this commodity
            2. Price Prediction: A short-term price prediction based on current trends
            3. Trading Recommendation: Advice for farmers on whether to sell now or wait
            
            Format your response as a JSON object with three properties: "market_analysis", "price_prediction", and "trading_recommendation".
            Each should be a concise paragraph with practical advice. Keep each under 100 words.
            
            Example format:
            {
              "market_analysis": "Your market analysis here...",
              "price_prediction": "Your price prediction here...",
              "trading_recommendation": "Your trading recommendation here..."
            }`
          }]
        }]
      })
    });
    
    const data = await response.json();
    
    try {
      // Check if data has the expected structure
      if (data && data.candidates && data.candidates.length > 0 && 
          data.candidates[0].content && data.candidates[0].content.parts && 
          data.candidates[0].content.parts.length > 0) {
            
        const content = data.candidates[0].content.parts[0].text;
        const jsonMatch = content.match(/\{[\s\S]*\}/);
        
        if (jsonMatch) {
          const insights = JSON.parse(jsonMatch[0]);
          if (insights && typeof insights === 'object') {
            return {
              market_analysis: insights.market_analysis || getFallbackMarketAnalysis(marketData.commodity || ''),
              price_prediction: insights.price_prediction || getFallbackPricePrediction(marketData.commodity || '', marketData.modal_price || 0),
              trading_recommendation: insights.trading_recommendation || getFallbackTradingRecommendation(marketData.commodity || '')
            };
          }
        }
      } else {
        console.warn('Unexpected API response structure:', data);
      }
    } catch (parseError) {
      console.error('Error parsing AI response:', parseError);
    }
    
    // Fallback to static insights
    return {
      market_analysis: getFallbackMarketAnalysis(marketData.commodity || ""),
      price_prediction: getFallbackPricePrediction(marketData.commodity || "", marketData.modal_price || 0),
      trading_recommendation: getFallbackTradingRecommendation(marketData.commodity || "")
    };
  } catch (error) {
    console.error('Error getting AI market insights:', error);
    return {
      market_analysis: getFallbackMarketAnalysis(marketData.commodity || ""),
      price_prediction: getFallbackPricePrediction(marketData.commodity || "", marketData.modal_price || 0),
      trading_recommendation: getFallbackTradingRecommendation(marketData.commodity || "")
    };
  }
};

// Helper functions for fallback market insights
function getFallbackMarketAnalysis(commodity: string): string {
  const analyses: Record<string, string> = {
    "Potato": "The potato market is currently stable with moderate demand. Supply chains are functioning normally with adequate stock available in most markets. Quality variations are affecting pricing, with premium quality commanding higher prices.",
    "Rice": "Rice markets are showing strong demand due to consistent consumption patterns. Supply is adequate but prices are slightly elevated due to increased input costs for farmers. Export demand is also influencing domestic prices.",
    "Wheat": "Wheat prices are stable with good supply in most markets. Government procurement is ongoing which is providing price support. Quality is generally good this season with minimal pest damage reported.",
    "Onion": "Onion markets are experiencing typical seasonal fluctuations. Current supplies are moderate with new harvests starting to reach markets. Price sensitivity remains high for this essential commodity.",
    "Tomato": "Tomato prices are volatile due to weather-related supply disruptions. Quality issues from recent rains have affected market arrivals. Demand remains consistent for this kitchen staple.",
    "Cotton": "Cotton market is showing steady demand from textile industry. International prices are influencing domestic markets. Quality variations are significant factors in price determination.",
    "Maize": "Maize demand is strong from the poultry and starch industries. Supplies are adequate with good quality reported from major growing regions. Prices are stable with slight upward pressure.",
    "Soyabean": "Soyabean prices are firm due to strong demand from oil processors. International prices are providing support to domestic markets. New crop prospects are influencing current trading patterns."
  };
  
  return analyses[commodity] || "Market conditions are currently stable with balanced supply and demand. Price trends should be monitored closely as seasonal factors may cause fluctuations in the coming weeks.";
}

function getFallbackPricePrediction(commodity: string, currentPrice: number): string {
  const predictions: Record<string, string> = {
    "Potato": "Potato prices are expected to remain stable in the short term with possible minor increases of 3-5% as summer demand picks up. Long-term outlook suggests normal seasonal patterns with prices moderating after the next harvest.",
    "Rice": "Rice prices are likely to see a modest increase of 2-4% in the coming weeks due to steady demand and increasing input costs. Government policies on exports will be a key factor to watch.",
    "Wheat": "Wheat prices are projected to remain stable with potential for a slight decrease of 1-3% as new harvests reach markets. International wheat prices will continue to influence domestic markets.",
    "Onion": "Onion prices may see volatility with potential increases of 5-10% in the short term due to seasonal factors. Weather conditions in key growing regions will be critical for price stability.",
    "Tomato": "Tomato prices are expected to decrease by 8-12% in the coming weeks as new harvests improve supplies. However, any adverse weather events could quickly reverse this trend.",
    "Cotton": "Cotton prices are forecast to increase gradually by 3-6% due to steady demand from textile sector and global price trends. Quality premiums will continue to be significant.",
    "Maize": "Maize prices are likely to remain stable with a slight upward bias of 2-3% due to consistent industrial demand. Feed industry consumption patterns will be a key price driver.",
    "Soyabean": "Soyabean prices may increase by 4-7% in the short term due to strong processing demand and global supply concerns. International price movements will continue to influence domestic markets."
  };
  
  return predictions[commodity] || `Prices are expected to fluctuate within 5% of the current level (₹${currentPrice}/quintal) in the short term. Longer-term trends will depend on upcoming harvest quality and quantity, as well as broader market demand.`;
}

function getFallbackTradingRecommendation(commodity: string): string {
  const recommendations: Record<string, string> = {
    "Potato": "For potato farmers, consider staggered selling approach - sell 40-50% of stock now to cover immediate costs, and hold remainder for potential price improvements in 4-6 weeks. Ensure proper storage to maintain quality if holding stock.",
    "Rice": "Rice producers should consider selling gradually over the next 4-8 weeks rather than all at once. Current prices are reasonable, but there's potential for modest improvements. Monitor government procurement announcements closely.",
    "Wheat": "For wheat growers, selling to government procurement at MSP remains advantageous where available. In open markets, consider selling 60-70% of produce now and holding remainder only if storage facilities are adequate.",
    "Onion": "Onion farmers with good storage facilities might benefit from holding 30-40% of produce for 3-4 weeks as prices typically strengthen. However, quality deterioration risks should be carefully assessed.",
    "Tomato": "Due to perishability, tomato growers should sell most produce at current market rates. Grading and sorting to capture premium prices for top quality is recommended. Avoid holding stock due to spoilage risks.",
    "Cotton": "Cotton farmers should consider selling 50-60% of produce at current rates and hold remainder if storage is available. Quality maintenance is crucial for capturing premium prices later in the season.",
    "Maize": "For maize producers, current prices offer reasonable returns. Consider selling 70-80% of stock now and only hold remainder if expecting specific local demand increases or have proper storage facilities.",
    "Soyabean": "Soyabean farmers might benefit from holding 40-50% of produce for 6-8 weeks as processing demand typically strengthens. Current prices are fair but have potential for improvement."
  };
  
  return recommendations[commodity] || "Consider a balanced approach - sell a portion of your produce now to cover immediate expenses, while holding some stock if you have proper storage facilities and can manage the price risk. Monitor market trends closely and consult with local agricultural extension services for location-specific advice.";
}

// Export the API client for other services to use
export default apiClient;
