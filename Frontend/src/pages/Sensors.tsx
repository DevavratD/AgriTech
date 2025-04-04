import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { useState, useEffect } from "react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { AreaChart, Area } from 'recharts';
import { Droplets, ThermometerSun, FlaskConical, Wind, Cloud, Gauge, Waves, Brain, Info, CloudLightning, Save } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";
import { Slider } from "@/components/ui/slider";
import SensorInsightsCard from "@/components/sensors/SensorInsightsCard";
import { fetchSensorData, updateThreshold, updateIrrigation, SensorData } from "@/services/sensorService";
import { toast } from "sonner";

// Helper function to generate time-series data
const generateTimeSeriesData = (currentValue: number, hours = 24, variance = 10) => {
  const now = new Date();
  const data = [];
  
  for (let i = hours; i >= 0; i--) {
    const time = new Date(now.getTime() - i * 60 * 60 * 1000);
    const timeString = time.getHours().toString().padStart(2, '0') + ':00';
    
    // Generate a value that's somewhat close to the current value but with some variance
    // Values trend toward the current value as we approach the present time
    const randomFactor = Math.random() * variance * 2 - variance;
    const trendFactor = (hours - i) / hours; // 0 to 1, higher as we get closer to now
    const value = Math.max(0, Math.round(currentValue + randomFactor * (1 - trendFactor * 0.8)));
    
    data.push({ time: timeString, value });
  }
  
  return data;
};

const Sensors = () => {
  const [irrigation, setIrrigation] = useState(false);
  const [threshold, setThreshold] = useState(60);
  const [isAutomatic, setIsAutomatic] = useState(true);
  const [sensorData, setSensorData] = useState<SensorData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<string>('');
  const [chartData, setChartData] = useState({
    moistureData: [],
    temperatureData: [],
    salinityData: []
  });
  const [thresholdUpdating, setThresholdUpdating] = useState(false);

  // Fetch sensor data from the backend
  useEffect(() => {
    const getSensorData = async () => {
      try {
        setLoading(true);
        const data = await fetchSensorData();
        console.log('Received sensor data:', data);
        setSensorData(data);
        
        // Update local state with values from backend
        if (data.data.threshold !== undefined) {
          setThreshold(data.data.threshold);
        }
        
        if (data.data.irrigation !== undefined) {
          // Convert to boolean to handle both boolean and numeric values (0/1)
          setIrrigation(Boolean(data.data.irrigation));
        }
        
        if (data.data.lastUpdated) {
          setLastUpdated(new Date(data.data.lastUpdated).toLocaleString());
        } else {
          setLastUpdated(new Date().toLocaleString());
        }

        // Generate chart data based on current sensor values
        const moisture = data.data.moisture || 60;
        const temperature = data.data.temperature || 25;
        const salinity = data.data.salinity || 1.5;
        
        setChartData({
          moistureData: generateTimeSeriesData(moisture, 24, 15),
          temperatureData: generateTimeSeriesData(temperature, 24, 5),
          salinityData: generateTimeSeriesData(salinity * 10, 24, 3) // Scale up for better visualization
        });
        
        setError(null);
      } catch (err) {
        console.error('Error fetching sensor data:', err);
        setError('Failed to fetch sensor data. Please try again later.');
        toast.error('Failed to connect to sensor system');
        
        // Generate fallback demo data if real data fetch fails
        setChartData({
          moistureData: generateTimeSeriesData(65, 24, 15),
          temperatureData: generateTimeSeriesData(24, 24, 5),
          salinityData: generateTimeSeriesData(15, 24, 3)
        });
      } finally {
        setLoading(false);
      }
    };

    getSensorData();
    
    // Poll for sensor data every 15 seconds instead of 30 for more responsive updates
    const interval = setInterval(getSensorData, 15000);
    
    return () => clearInterval(interval);
  }, []);

  const toggleIrrigation = async () => {
    try {
      const newState = !irrigation;
      setIrrigation(newState);
      await updateIrrigation(newState);
      toast.success(`Irrigation ${newState ? 'enabled' : 'disabled'}`);
    } catch (err) {
      console.error('Error updating irrigation:', err);
      setIrrigation(irrigation); // Revert to previous state
      toast.error('Failed to update irrigation status');
    }
  };

  const handleThresholdChange = async (value: number[]) => {
    const newThreshold = value[0];
    setThreshold(newThreshold);
  };

  const saveThreshold = async () => {
    try {
      setThresholdUpdating(true);
      await updateThreshold(threshold);
      toast.success(`Moisture threshold updated to ${threshold}%`);
    } catch (err) {
      console.error('Error updating threshold:', err);
      toast.error('Failed to update moisture threshold');
    } finally {
      setThresholdUpdating(false);
    }
  };

  const getAirQualityStatus = (value: number) => {
    if (value <= 50) return { text: "Good", color: "text-green-500" };
    if (value <= 100) return { text: "Moderate", color: "text-yellow-500" };
    if (value <= 150) return { text: "Poor", color: "text-orange-500" };
    return { text: "Very Poor", color: "text-red-500" };
  };

  const getWaterQualityStatus = (value: number) => {
    if (value >= 90) return { text: "Excellent", color: "text-blue-500" };
    if (value >= 80) return { text: "Good", color: "text-green-500" };
    if (value >= 70) return { text: "Fair", color: "text-yellow-500" };
    return { text: "Poor", color: "text-red-500" };
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Sensor Data</h1>
        <span className="text-sm text-muted-foreground">
          {loading ? 'Updating...' : `Last updated: ${lastUpdated}`}
        </span>
      </div>

      {error && (
        <div className="bg-red-50 dark:bg-red-900/20 text-red-800 dark:text-red-200 p-3 rounded-md text-sm">
          {error}
        </div>
      )}

      <Tabs defaultValue="soil" className="w-full">
        <TabsList className="w-full grid grid-cols-3 mb-4">
          <TabsTrigger value="soil" className="text-xs sm:text-sm px-1 sm:px-3">Soil</TabsTrigger>
          <TabsTrigger value="environment" className="text-xs sm:text-sm px-1 sm:px-3">Environment</TabsTrigger>
          <TabsTrigger value="weather" className="text-xs sm:text-sm px-1 sm:px-3">Weather</TabsTrigger>
        </TabsList>

        {/* Soil Tab */}
        <TabsContent value="soil" className="space-y-4">
          {/* Irrigation Control */}
          <Card className="data-card">
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center text-lg">
                <Droplets className="mr-2 h-5 w-5 text-blue-500" />
                Irrigation Control
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <div>
                    <h3 className="font-medium">System Status</h3>
                    <p className="text-sm text-muted-foreground">
                      {irrigation ? "Active - Water flowing" : "Inactive - System on standby"}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium">{irrigation ? "ON" : "OFF"}</span>
                    <Switch
                      checked={irrigation}
                      onCheckedChange={toggleIrrigation}
                    />
                  </div>
                </div>

                <div className="pt-4 border-t">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                      <h3 className="font-medium">Control Mode</h3>
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-muted-foreground">Automatic</span>
                        <Switch
                          checked={isAutomatic}
                          onCheckedChange={setIsAutomatic}
                        />
                        <span className="text-sm text-muted-foreground">Manual</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-1 text-xs text-muted-foreground">
                      <Info className="h-3 w-3" />
                      <span>Automatic mode uses sensor data</span>
                    </div>
                  </div>

                  {!isAutomatic && (
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <label className="text-sm font-medium">Moisture Threshold</label>
                          <span className="text-sm font-medium">{threshold}%</span>
                        </div>
                        <Slider
                          value={[threshold]}
                          onValueChange={handleThresholdChange}
                          min={0}
                          max={100}
                          step={1}
                          className="w-full"
                        />
                        <div className="flex justify-between text-xs text-muted-foreground">
                          <span>0%</span>
                          <span>100%</span>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div className="p-3 bg-muted rounded-lg">
                          <p className="text-muted-foreground">Current Moisture</p>
                          <p className="font-medium">{sensorData?.data.moisture}%</p>
                        </div>
                        <div className="p-3 bg-muted rounded-lg">
                          <p className="text-muted-foreground">Threshold</p>
                          <p className="font-medium">{threshold}%</p>
                        </div>
                      </div>

                      <div className="p-3 bg-blue-50 dark:bg-blue-950/20 rounded-lg">
                        <p className="text-sm text-blue-800 dark:text-blue-300">
                          Irrigation will {irrigation ? "stop" : "start"} when moisture level goes {irrigation ? "above" : "below"} {threshold}%
                        </p>
                      </div>
                      
                      <div className="flex justify-end">
                        <Button 
                          onClick={saveThreshold} 
                          disabled={thresholdUpdating}
                          className="flex items-center gap-2"
                        >
                          {thresholdUpdating ? 'Saving...' : 'Save Threshold'}
                          <Save className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  )}

                  {isAutomatic && (
                    <div className="p-3 bg-green-50 dark:bg-green-950/20 rounded-lg">
                      <p className="text-sm text-green-800 dark:text-green-300">
                        System is using AI-powered automatic control based on soil moisture, temperature, and weather conditions
                      </p>
                    </div>
                  )}
                </div>

                {irrigation && (
                  <div className="mt-4 pt-4 border-t grid grid-cols-3 gap-4 text-center text-sm">
                    <div>
                      <p className="text-muted-foreground">Water Flow</p>
                      <p className="font-medium">{sensorData?.data.waterFlow} L/min</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Duration</p>
                      <p className="font-medium">{sensorData?.data.duration}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Coverage</p>
                      <p className="font-medium">{sensorData?.data.coverage}</p>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Soil Moisture Chart */}
          <Card className="data-card">
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center text-lg">
                <Droplets className="mr-2 h-5 w-5 text-blue-500" />
                Soil Moisture
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={chartData.moistureData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="time" />
                    <YAxis domain={[0, 100]} />
                    <Tooltip />
                    <Area
                      type="monotone"
                      dataKey="value"
                      stroke="#3b82f6"
                      fill="#93c5fd"
                      name="Moisture %"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
              <div className="mt-4 grid grid-cols-3 gap-4 text-sm">
                <div className="p-3 bg-muted rounded-lg text-center">
                  <p className="text-muted-foreground">Current</p>
                  <p className="font-medium text-lg">{sensorData?.data.moisture || 0}%</p>
                </div>
                <div className="p-3 bg-muted rounded-lg text-center">
                  <p className="text-muted-foreground">Average</p>
                  <p className="font-medium text-lg">
                    {chartData.moistureData.length > 0 
                      ? Math.round(chartData.moistureData.reduce((acc, item) => acc + item.value, 0) / chartData.moistureData.length) 
                      : 0}%
                  </p>
                </div>
                <div className="p-3 bg-muted rounded-lg text-center">
                  <p className="text-muted-foreground">Optimal</p>
                  <p className="font-medium text-lg">65-75%</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Temperature Chart */}
          <Card className="data-card">
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center text-lg">
                <ThermometerSun className="mr-2 h-5 w-5 text-red-500" />
                Soil Temperature
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={chartData.temperatureData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="time" />
                    <YAxis domain={[0, 40]} />
                    <Tooltip />
                    <Area
                      type="monotone"
                      dataKey="value"
                      stroke="#ef4444"
                      fill="#fca5a5"
                      name="Temperature °C"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
              <div className="mt-4 grid grid-cols-3 gap-4 text-sm">
                <div className="p-3 bg-muted rounded-lg text-center">
                  <p className="text-muted-foreground">Current</p>
                  <p className="font-medium text-lg">{sensorData?.data.temperature || 0}°C</p>
                </div>
                <div className="p-3 bg-muted rounded-lg text-center">
                  <p className="text-muted-foreground">Average</p>
                  <p className="font-medium text-lg">
                    {chartData.temperatureData.length > 0 
                      ? Math.round(chartData.temperatureData.reduce((acc, item) => acc + item.value, 0) / chartData.temperatureData.length) 
                      : 0}°C
                  </p>
                </div>
                <div className="p-3 bg-muted rounded-lg text-center">
                  <p className="text-muted-foreground">Optimal</p>
                  <p className="font-medium text-lg">20-25°C</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Salinity Level Chart */}
          <Card className="data-card">
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center text-lg">
                <CloudLightning className="mr-2 h-5 w-5 text-purple-500" />
                EC/Salinity Level
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={chartData.salinityData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="time" />
                    <YAxis domain={[0, 30]} />
                    <Tooltip />
                    <Area
                      type="monotone"
                      dataKey="value"
                      stroke="#a855f7"
                      fill="#d8b4fe"
                      name="EC (dS/m x10)"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
              <div className="mt-4 grid grid-cols-3 gap-4 text-sm">
                <div className="p-3 bg-muted rounded-lg text-center">
                  <p className="text-muted-foreground">Current</p>
                  <p className="font-medium text-lg">{sensorData?.data.salinity || 0} dS/m</p>
                </div>
                <div className="p-3 bg-muted rounded-lg text-center">
                  <p className="text-muted-foreground">Average</p>
                  <p className="font-medium text-lg">
                    {chartData.salinityData.length > 0 
                      ? (chartData.salinityData.reduce((acc, item) => acc + item.value, 0) / chartData.salinityData.length / 10).toFixed(1) 
                      : 0} dS/m
                  </p>
                </div>
                <div className="p-3 bg-muted rounded-lg text-center">
                  <p className="text-muted-foreground">Optimal</p>
                  <p className="font-medium text-lg">0.8-1.5 dS/m</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Environment Tab */}
        <TabsContent value="environment" className="space-y-4">
          {/* Air Quality */}
          <Card className="data-card">
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center text-lg">
                <Wind className="mr-2 h-5 w-5 text-blue-500" />
                Air Quality Index
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={sensorData?.data.airQualityData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="time" />
                    <YAxis domain={[0, 200]} />
                    <Tooltip />
                    <Area
                      type="monotone"
                      dataKey="value"
                      stroke="#3b82f6"
                      fill="#93c5fd"
                      name="AQI"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          <SensorInsightsCard
            sensorType="air quality"
            currentValue={sensorData?.data.airQuality}
            unit=" AQI"
            className="data-card"
          />

          {/* Water Quality */}
          <Card className="data-card">
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center text-lg">
                <Waves className="mr-2 h-5 w-5 text-blue-500" />
                Water Quality
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={sensorData?.data.waterQualityData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="time" />
                    <YAxis domain={[0, 100]} />
                    <Tooltip />
                    <Area
                      type="monotone"
                      dataKey="value"
                      stroke="#3b82f6"
                      fill="#93c5fd"
                      name="Quality %"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          <SensorInsightsCard
            sensorType="water quality"
            currentValue={sensorData?.data.waterQuality}
            unit="%"
            className="data-card"
          />
        </TabsContent>

        {/* Weather Tab */}
        <TabsContent value="weather" className="space-y-4">
          {/* 7-Day Forecast */}
          <Card className="data-card">
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center text-lg">
                <Cloud className="mr-2 h-5 w-5 text-blue-500" />
                7-Day Weather Forecast
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={sensorData?.data.weeklyWeatherData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="day" />
                    <YAxis yAxisId="left" orientation="left" domain={[15, 35]} />
                    <YAxis yAxisId="right" orientation="right" domain={[0, 100]} />
                    <Tooltip />
                    <Bar
                      yAxisId="left"
                      dataKey="temp"
                      fill="#f59e0b"
                      name="Temperature °C"
                    />
                    <Bar
                      yAxisId="right"
                      dataKey="humidity"
                      fill="#3b82f6"
                      name="Humidity %"
                    />
                    <Bar
                      yAxisId="right"
                      dataKey="rain"
                      fill="#60a5fa"
                      name="Rain Chance %"
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
              <div className="mt-4 grid grid-cols-7 gap-2">
                {sensorData?.data.weeklyWeatherData.map((day) => (
                  <div key={day.day} className="text-center">
                    <p className="text-sm font-medium">{day.day}</p>
                    <p className="text-lg font-bold">{day.temp}°</p>
                    <div className="flex items-center justify-center gap-1 text-xs text-muted-foreground">
                      <Droplets className="h-3 w-3" />
                      <span>{day.humidity}%</span>
                    </div>
                    <div className="flex items-center justify-center gap-1 text-xs text-muted-foreground">
                      <Cloud className="h-3 w-3" />
                      <span>{day.rain}%</span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Weather Alerts */}
          <Card className="data-card border-orange-300 dark:border-orange-700">
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center text-lg text-orange-700 dark:text-orange-400">
                <Gauge className="mr-2 h-5 w-5" />
                Weather Alerts
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {sensorData?.data.weatherAlerts.map((alert) => (
                  <div key={alert.id} className="p-4 bg-orange-50 dark:bg-orange-950/20 rounded-lg">
                    <h4 className="font-medium text-orange-800 dark:text-orange-300">{alert.title}</h4>
                    <p className="text-sm text-orange-700 dark:text-orange-400 mt-1">
                      {alert.message}
                    </p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <div className="flex justify-center">
        <Button>View All Sensor Data</Button>
      </div>
    </div>
  );
};

export default Sensors;
