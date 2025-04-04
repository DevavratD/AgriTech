import WeatherCard from "@/components/weather/WeatherCard";
import AlertCard from "@/components/alerts/AlertCard";
import SoilHealthCard from "@/components/soil/SoilHealthCard";
import SoilInsightsCard from "@/components/soil/SoilInsightsCard";
import { Droplets, ThermometerSun, Leaf, FlaskConical, Sprout } from "lucide-react";
import { useState, useEffect } from "react";
import { fetchSensorData } from "@/services/sensorService";
import { toast } from "sonner";

// Define Alert interface to match the one in AlertCard
interface Alert {
  id: number;
  title: string;
  recommendation: string;
}

// Define WeatherData interface
interface WeatherData {
  temperature: number;
  description: string;
  humidity: number;
  today: string;
  tomorrow: string;
  windSpeed: number;
}

// Define the sensor data interface to match the actual structure from the backend
interface SensorDataResponse {
  data: {
    moisture?: number;
    temperature?: number;
    ph?: number;
    airQuality?: number;
    waterQuality?: number;
    threshold?: number;
    irrigation?: boolean;
    soilHealth?: SoilHealthData;
    moistureData?: { time: string; value: number }[];
    temperatureData?: { time: string; value: number }[];
    phData?: { time: string; value: number }[];
    airQualityData?: { time: string; value: number }[];
    waterQualityData?: { time: string; value: number }[];
    weeklyWeatherData?: { day: string; temp: number; humidity: number; rain: number }[];
    weatherAlerts?: { id: string; title: string; message: string }[];
    waterFlow?: number;
    duration?: string;
    coverage?: string;
    lastUpdated?: string;
    salinity?: number;
    humidity?: number;
    wind_speed?: number;
    weatherData?: {
      wind_speed?: number;
      temperature?: number;
      humidity?: number;
    };
  };
  status: string;
}

interface SoilHealthData {
  health_index: number;
  active_issues: string[];
}

const Dashboard = () => {
  const [loading, setLoading] = useState(true);
  const [soilHealthData, setSoilHealthData] = useState({
    overallHealth: 0,
    metrics: [
      { name: "Moisture", value: 0, icon: Droplets, color: "text-blue-500" },
      { name: "Organic Content", value: 0, icon: Leaf, color: "text-green-500" },
      { name: "Temperature", value: 0, icon: ThermometerSun, color: "text-orange-500" },
      { name: "Salinity", value: 0, icon: Sprout, color: "text-emerald-500" }
    ]
  });
  const [lastUpdated, setLastUpdated] = useState("Loading...");
  const [alerts, setAlerts] = useState<Alert[]>([
    {
      id: 1,
      title: "Welcome to KrishiMitra Dashboard",
      recommendation: "Check your soil health and sensor data"
    }
  ]);
  // Add weather data state
  const [weatherData, setWeatherData] = useState<WeatherData>({
    temperature: 24,
    description: "Partly Cloudy",
    humidity: 65,
    today: "24°C / 18°C",
    tomorrow: "26°C / 19°C",
    windSpeed: 12
  });

  // Fetch sensor data from the backend
  useEffect(() => {
    const getSensorData = async () => {
      try {
        setLoading(true);
        const data = await fetchSensorData() as SensorDataResponse;
        console.log('Dashboard received sensor data:', data);
        
        // Update soil health data
        if (data.data.soilHealth) {
          // Convert soil health data to the format expected by SoilHealthCard
          const healthIndex = Math.round(data.data.soilHealth.health_index);
          
          // Generate a demo value for organic content (between 40-90%)
          const organicContent = Math.floor(Math.random() * 50) + 40;
          
          // Update metrics with real data
          const updatedMetrics = [
            { 
              name: "Moisture", 
              value: data.data.moisture || 0, 
              icon: Droplets, 
              color: "text-blue-500" 
            },
            { 
              name: "Organic Content", 
              value: organicContent, 
              icon: Leaf, 
              color: "text-green-500" 
            },
            { 
              name: "Temperature", 
              value: data.data.temperature ? Math.min(Math.round(data.data.temperature * 2), 100) : 0, 
              icon: ThermometerSun, 
              color: "text-orange-500" 
            },
            { 
              name: "Salinity", 
              value: data.data.salinity ? Math.min(Math.round(data.data.salinity * 10), 100) : 0, 
              icon: Sprout, 
              color: "text-emerald-500" 
            }
          ];
          
          setSoilHealthData({
            overallHealth: healthIndex,
            metrics: updatedMetrics
          });
          
          // Generate alerts based on soil health issues
          if (data.data.soilHealth.active_issues && data.data.soilHealth.active_issues.length > 0) {
            const soilAlerts: Alert[] = data.data.soilHealth.active_issues.map((issue, index) => ({
              id: 100 + index, // Using numeric IDs starting from 100
              title: `Soil Issue: ${issue}`,
              recommendation: "Check soil health details for recommendations"
            }));
            
            setAlerts(soilAlerts);
          }
        }
        
        // Update weather data from the API response
        if (data.data.temperature && data.data.weeklyWeatherData) {
          // Get current temperature and humidity from sensor data
          const currentTemp = Math.round(data.data.temperature);
          
          // Get humidity from various possible sources
          let currentHumidity = 65; // Default fallback
          
          // Try to get humidity from different possible locations in the API response
          if (typeof data.data.humidity === 'number') {
            currentHumidity = data.data.humidity;
          } else if (data.data.weeklyWeatherData && data.data.weeklyWeatherData[0] && 
                    typeof data.data.weeklyWeatherData[0].humidity === 'number') {
            // Get humidity from today's forecast if available
            currentHumidity = data.data.weeklyWeatherData[0].humidity;
          } else if (data.data.weatherData && typeof data.data.weatherData.humidity === 'number') {
            currentHumidity = data.data.weatherData.humidity;
          }
          
          // Get weather description based on temperature or from weatherAlerts if available
          let description = "Partly Cloudy";
          if (data.data.weatherAlerts && data.data.weatherAlerts.length > 0) {
            // Try to extract weather condition from alerts
            const weatherAlert = data.data.weatherAlerts.find(alert => 
              alert.title.includes("Rain") || 
              alert.title.includes("Snow") || 
              alert.title.includes("Cloud") ||
              alert.title.includes("Sun") ||
              alert.title.includes("Wind")
            );
            
            if (weatherAlert) {
              // Extract the weather condition from the alert title
              const match = weatherAlert.title.match(/(Rain|Snow|Cloud|Sun|Wind|Fog|Mist)/i);
              if (match) {
                description = match[0];
              }
            }
          }
          
          // Fallback to temperature-based description
          if (description === "Partly Cloudy") {
            if (currentTemp > 30) {
              description = "Sunny";
            } else if (currentTemp < 20) {
              description = "Cool";
            }
          }
          
          // Get today's and tomorrow's forecast from weeklyWeatherData
          const today = data.data.weeklyWeatherData[0];
          const tomorrow = data.data.weeklyWeatherData[1];
          
          const todayForecast = `${today ? today.temp : currentTemp}°C / ${Math.round(currentTemp - 5)}°C`;
          const tomorrowForecast = `${tomorrow ? tomorrow.temp : currentTemp + 2}°C / ${Math.round(currentTemp - 3)}°C`;
          
          // Get wind speed if available or calculate from temperature as a fallback
          // Note: The backend might not be sending wind_speed directly in the data object
          let windSpeed = 12; // Default fallback
          
          // Try to get wind speed from different possible locations in the API response
          if (typeof data.data.wind_speed === 'number') {
            windSpeed = data.data.wind_speed;
          } else if (data.data.weatherData && typeof data.data.weatherData.wind_speed === 'number') {
            windSpeed = data.data.weatherData.wind_speed;
          } else {
            // Generate a reasonable wind speed based on temperature as fallback
            windSpeed = Math.max(5, Math.min(20, Math.round(currentTemp / 3) + 5));
          }
          
          // Update weather data state
          setWeatherData({
            temperature: currentTemp,
            description: description,
            humidity: currentHumidity,
            today: todayForecast,
            tomorrow: tomorrowForecast,
            windSpeed: windSpeed
          });
          
          // Add weather alerts if they exist
          if (data.data.weatherAlerts && data.data.weatherAlerts.length > 0) {
            const weatherAlerts: Alert[] = data.data.weatherAlerts.map((alert, index) => ({
              id: 200 + index, // Using numeric IDs starting from 200
              title: alert.title,
              recommendation: alert.message
            }));
            
            // Combine soil and weather alerts
            setAlerts(prevAlerts => {
              // Filter out previous weather alerts (IDs starting with 200)
              const soilAlerts = prevAlerts.filter(a => a.id < 200);
              return [...soilAlerts, ...weatherAlerts];
            });
          }
        }
        
        // Update last updated time
        if (data.data.lastUpdated) {
          setLastUpdated(new Date(data.data.lastUpdated).toLocaleString());
        } else {
          setLastUpdated(new Date().toLocaleString());
        }
        
      } catch (err) {
        console.error('Error fetching sensor data for dashboard:', err);
        toast.error('Failed to update dashboard data');
      } finally {
        setLoading(false);
      }
    };

    getSensorData();
    
    // Poll for sensor data every 60 seconds
    const interval = setInterval(getSensorData, 60000);
    
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="space-y-4 sm:space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <h1 className="text-xl sm:text-2xl font-bold">Farm Dashboard</h1>
        <span className="text-xs sm:text-sm text-muted-foreground">
          {loading ? 'Updating...' : `Last updated: ${lastUpdated}`}
        </span>
      </div>
      <SoilHealthCard
        overallHealth={soilHealthData.overallHealth}
        metrics={soilHealthData.metrics}
        className="data-card"
      />
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
        <WeatherCard
          temperature={weatherData.temperature}
          description={weatherData.description}
          humidity={weatherData.humidity}
          today={weatherData.today}
          tomorrow={weatherData.tomorrow}
          windSpeed={weatherData.windSpeed}
          className="data-card"
        />
        <AlertCard alerts={alerts} className="data-card" />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
        <SoilInsightsCard
          soilHealth={soilHealthData.overallHealth}
          metrics={soilHealthData.metrics}
          className="data-card"
        />
      </div>
    </div>
  );
};

export default Dashboard;
