import requests
import os
from dotenv import load_dotenv
import logging
from typing import Dict, Any, Optional

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Load environment variables
load_dotenv()

# OpenWeatherMap API key
API_KEY = os.getenv("OPENWEATHER_API_KEY", "")
if not API_KEY or API_KEY == "your_openweathermap_api_key_here":
    logger.warning("OpenWeatherMap API key not found or using placeholder. Weather data will use fallback values.")
    API_KEY = "e91fc4ea7fb3389cef7287be7daf3ba4"  # Use the key from .env directly as a fallback

# Default location (can be overridden)
DEFAULT_LAT = float(os.getenv("DEFAULT_LAT", "18.5204"))
DEFAULT_LON = float(os.getenv("DEFAULT_LON", "73.8567"))  # Pune, Maharashtra coordinates

class WeatherAPI:
    """Utility class for interacting with OpenWeatherMap API"""
    
    def __init__(self, api_key: Optional[str] = None, lat: float = DEFAULT_LAT, lon: float = DEFAULT_LON):
        """Initialize the WeatherAPI with API key and location"""
        self.api_key = api_key or API_KEY
        self.lat = lat
        self.lon = lon
        
        if not self.api_key:
            logger.warning("OpenWeatherMap API key not found. Weather data will use fallback values.")
    
    def get_current_weather(self) -> Dict[str, Any]:
        """Get current weather data for the specified location"""
        if not self.api_key:
            return self._get_fallback_weather()
            
        try:
            url = f"https://api.openweathermap.org/data/2.5/weather?lat={self.lat}&lon={self.lon}&appid={self.api_key}&units=metric"
            response = requests.get(url, timeout=10)
            response.raise_for_status()
            data = response.json()
            
            # Extract relevant weather information
            weather_data = {
                "temperature": data["main"]["temp"],
                "humidity": data["main"]["humidity"],
                "pressure": data["main"]["pressure"],
                "wind_speed": data["wind"]["speed"],
                "weather_condition": data["weather"][0]["main"],
                "weather_description": data["weather"][0]["description"],
                "rainfall_mm": self._get_rainfall(data),
                "timestamp": data["dt"]
            }
            
            logger.info(f"Weather data retrieved successfully for {self.lat}, {self.lon}")
            return weather_data
            
        except Exception as e:
            logger.error(f"Error fetching weather data: {str(e)}")
            return self._get_fallback_weather()
    
    def get_air_quality(self) -> Dict[str, Any]:
        """Get current air quality data for the specified location"""
        if not self.api_key:
            return self._get_fallback_air_quality()
            
        try:
            url = f"https://api.openweathermap.org/data/2.5/air_pollution?lat={self.lat}&lon={self.lon}&appid={self.api_key}"
            response = requests.get(url, timeout=10)
            response.raise_for_status()
            data = response.json()
            
            # Extract air quality information
            air_data = {
                "aqi": data["list"][0]["main"]["aqi"],  # AQI index (1-5)
                "co": data["list"][0]["components"]["co"],
                "no2": data["list"][0]["components"]["no2"],
                "o3": data["list"][0]["components"]["o3"],
                "pm2_5": data["list"][0]["components"]["pm2_5"],
                "pm10": data["list"][0]["components"]["pm10"],
                "timestamp": data["list"][0]["dt"]
            }
            
            logger.info(f"Air quality data retrieved successfully for {self.lat}, {self.lon}")
            return air_data
            
        except Exception as e:
            logger.error(f"Error fetching air quality data: {str(e)}")
            return self._get_fallback_air_quality()
    
    def get_weather_and_air_data(self) -> Dict[str, Any]:
        """Get combined weather and air quality data"""
        weather_data = self.get_current_weather()
        air_data = self.get_air_quality()
        
        # Combine the data
        combined_data = {**weather_data, **air_data}
        return combined_data
    
    def _get_rainfall(self, data: Dict[str, Any]) -> float:
        """Extract rainfall from weather data if available"""
        rain_1h = 0
        
        # Check if rain data is available
        if "rain" in data and "1h" in data["rain"]:
            rain_1h = data["rain"]["1h"]
        
        # Convert to annual estimate (very rough approximation)
        # This is just for the model's benefit, not for display
        annual_rainfall_estimate = rain_1h * 24 * 365 / 12  # Rough monthly to annual conversion
        
        return annual_rainfall_estimate
    
    def _get_fallback_weather(self) -> Dict[str, Any]:
        """Return fallback weather data when API is unavailable"""
        return {
            "temperature": 25.0,
            "humidity": 65,
            "pressure": 1013,
            "wind_speed": 3.5,
            "weather_condition": "Clear",
            "weather_description": "clear sky",
            "rainfall_mm": 750,  # Annual rainfall estimate for Maharashtra
            "timestamp": 0
        }
    
    def _get_fallback_air_quality(self) -> Dict[str, Any]:
        """Return fallback air quality data when API is unavailable"""
        return {
            "aqi": 2,  # Moderate
            "co": 400.5,
            "no2": 15.0,
            "o3": 40.5,
            "pm2_5": 12.5,
            "pm10": 25.0,
            "timestamp": 0
        }

# Create a singleton instance for easy import
weather_api = WeatherAPI()

def get_weather_data() -> Dict[str, Any]:
    """Convenience function to get weather data"""
    return weather_api.get_current_weather()

def get_air_quality_data() -> Dict[str, Any]:
    """Convenience function to get air quality data"""
    return weather_api.get_air_quality()

def get_combined_data() -> Dict[str, Any]:
    """Convenience function to get combined weather and air quality data"""
    return weather_api.get_weather_and_air_data()
