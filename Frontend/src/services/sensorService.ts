import apiClient from './apiService';

export interface SoilHealthData {
    health_index: number;
    health_category: string;
    issues: Record<string, boolean>;
    active_issues: string[];
}

export interface SensorData {
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
    };
    status: string;
}

export const fetchSensorData = async (): Promise<SensorData> => {
    try {
        console.log('Fetching sensor data from:', '/api/sensor');
        const response = await apiClient.get('/api/sensor');
        console.log('Sensor data response:', response.data);
        
        const enhancedData = JSON.parse(JSON.stringify(response.data));
        
        if (!enhancedData.data.moistureData) {
            enhancedData.data.moistureData = [
                { time: '6AM', value: enhancedData.data.moisture ? enhancedData.data.moisture - 5 : 50 },
                { time: '9AM', value: enhancedData.data.moisture ? enhancedData.data.moisture - 10 : 45 },
                { time: '12PM', value: enhancedData.data.moisture ? enhancedData.data.moisture - 2 : 60 },
                { time: '3PM', value: enhancedData.data.moisture ? enhancedData.data.moisture : 65 },
                { time: '6PM', value: enhancedData.data.moisture ? enhancedData.data.moisture - 3 : 60 },
                { time: '9PM', value: enhancedData.data.moisture ? enhancedData.data.moisture + 2 : 65 },
                { time: '12AM', value: enhancedData.data.moisture ? enhancedData.data.moisture + 5 : 70 },
            ];
        }
        
        if (!enhancedData.data.temperatureData) {
            enhancedData.data.temperatureData = [
                { time: '6AM', value: enhancedData.data.temperature ? enhancedData.data.temperature - 3 : 18 },
                { time: '9AM', value: enhancedData.data.temperature ? enhancedData.data.temperature - 2 : 20 },
                { time: '12PM', value: enhancedData.data.temperature ? enhancedData.data.temperature + 1 : 24 },
                { time: '3PM', value: enhancedData.data.temperature ? enhancedData.data.temperature + 2 : 26 },
                { time: '6PM', value: enhancedData.data.temperature ? enhancedData.data.temperature + 1 : 25 },
                { time: '9PM', value: enhancedData.data.temperature ? enhancedData.data.temperature - 1 : 22 },
                { time: '12AM', value: enhancedData.data.temperature ? enhancedData.data.temperature - 2 : 20 },
            ];
        }
        
        if (!enhancedData.data.phData) {
            enhancedData.data.phData = [
                { time: '6AM', value: enhancedData.data.ph ? enhancedData.data.ph - 0.3 : 6.2 },
                { time: '9AM', value: enhancedData.data.ph ? enhancedData.data.ph - 0.2 : 6.3 },
                { time: '12PM', value: enhancedData.data.ph ? enhancedData.data.ph : 6.5 },
                { time: '3PM', value: enhancedData.data.ph ? enhancedData.data.ph + 0.1 : 6.6 },
                { time: '6PM', value: enhancedData.data.ph ? enhancedData.data.ph : 6.5 },
                { time: '9PM', value: enhancedData.data.ph ? enhancedData.data.ph - 0.1 : 6.4 },
                { time: '12AM', value: enhancedData.data.ph ? enhancedData.data.ph - 0.2 : 6.3 },
            ];
        }
        
        if (!enhancedData.data.airQualityData) {
            enhancedData.data.airQualityData = [
                { time: '6AM', value: enhancedData.data.airQuality ? enhancedData.data.airQuality - 10 : 45 },
                { time: '9AM', value: enhancedData.data.airQuality ? enhancedData.data.airQuality - 5 : 52 },
                { time: '12PM', value: enhancedData.data.airQuality ? enhancedData.data.airQuality : 58 },
                { time: '3PM', value: enhancedData.data.airQuality ? enhancedData.data.airQuality + 5 : 65 },
                { time: '6PM', value: enhancedData.data.airQuality ? enhancedData.data.airQuality - 3 : 55 },
                { time: '9PM', value: enhancedData.data.airQuality ? enhancedData.data.airQuality - 8 : 48 },
                { time: '12AM', value: enhancedData.data.airQuality ? enhancedData.data.airQuality - 15 : 42 },
            ];
        }
        
        if (!enhancedData.data.waterQualityData) {
            enhancedData.data.waterQualityData = [
                { time: '6AM', value: enhancedData.data.waterQuality ? enhancedData.data.waterQuality - 3 : 85 },
                { time: '9AM', value: enhancedData.data.waterQuality ? enhancedData.data.waterQuality - 4 : 84 },
                { time: '12PM', value: enhancedData.data.waterQuality ? enhancedData.data.waterQuality - 6 : 82 },
                { time: '3PM', value: enhancedData.data.waterQuality ? enhancedData.data.waterQuality - 8 : 80 },
                { time: '6PM', value: enhancedData.data.waterQuality ? enhancedData.data.waterQuality - 5 : 83 },
                { time: '9PM', value: enhancedData.data.waterQuality ? enhancedData.data.waterQuality - 2 : 86 },
                { time: '12AM', value: enhancedData.data.waterQuality ? enhancedData.data.waterQuality : 88 },
            ];
        }
        
        if (!enhancedData.data.weeklyWeatherData) {
            enhancedData.data.weeklyWeatherData = [
                { day: 'Mon', temp: 22, humidity: 60, rain: 10 },
                { day: 'Tue', temp: 24, humidity: 55, rain: 0 },
                { day: 'Wed', temp: 25, humidity: 50, rain: 0 },
                { day: 'Thu', temp: 23, humidity: 65, rain: 30 },
                { day: 'Fri', temp: 21, humidity: 70, rain: 40 },
                { day: 'Sat', temp: 24, humidity: 60, rain: 5 },
                { day: 'Sun', temp: 26, humidity: 65, rain: 20 },
            ];
        }
        
        if (!enhancedData.data.weatherAlerts) {
            enhancedData.data.weatherAlerts = [
                { id: '1', title: 'High Wind Warning', message: 'Strong winds expected on Wednesday. Consider postponing pesticide application.' },
                { id: '2', title: 'Rain Forecast', message: 'Moderate rain expected on Thursday. Plan irrigation accordingly.' }
            ];
        }
        
        if (!enhancedData.data.waterFlow) {
            enhancedData.data.waterFlow = 12.5;
        }
        
        if (!enhancedData.data.duration) {
            enhancedData.data.duration = '15:20';
        }
        
        if (!enhancedData.data.coverage) {
            enhancedData.data.coverage = 'North Field';
        }
        
        if (!enhancedData.data.soilHealth) {
            enhancedData.data.soilHealth = {
                health_index: 75,
                health_category: 'Good',
                issues: {
                    'Low_Nitrogen': false,
                    'High_Nitrogen': false,
                    'Low_Phosphorus': false,
                    'High_Phosphorus': false,
                    'Low_Potassium': false,
                    'High_Potassium': false,
                    'Acidic_pH': false,
                    'Alkaline_pH': false,
                    'Low_Organic_Carbon': true,
                    'High_Organic_Carbon': false,
                    'High_Salinity': false,
                    'Poor_Texture': false,
                    'Low_Soil_Moisture': false,
                    'High_Soil_Moisture': false
                },
                active_issues: ['Low Organic Carbon']
            };
        }
        
        return enhancedData;
    } catch (error) {
        console.error('Error fetching sensor data:', error);
        
        return {
            data: {
                moisture: 65,
                temperature: 24,
                ph: 6.5,
                airQuality: 58,
                waterQuality: 85,
                threshold: 60,
                irrigation: false,
                soilHealth: {
                    health_index: 75,
                    health_category: 'Good',
                    issues: {
                        'Low_Nitrogen': false,
                        'High_Nitrogen': false,
                        'Low_Phosphorus': false,
                        'High_Phosphorus': false,
                        'Low_Potassium': false,
                        'High_Potassium': false,
                        'Acidic_pH': false,
                        'Alkaline_pH': false,
                        'Low_Organic_Carbon': true,
                        'High_Organic_Carbon': false,
                        'High_Salinity': false,
                        'Poor_Texture': false,
                        'Low_Soil_Moisture': false,
                        'High_Soil_Moisture': false
                    },
                    active_issues: ['Low Organic Carbon']
                },
                moistureData: [
                    { time: '6AM', value: 50 },
                    { time: '9AM', value: 45 },
                    { time: '12PM', value: 60 },
                    { time: '3PM', value: 65 },
                    { time: '6PM', value: 60 },
                    { time: '9PM', value: 65 },
                    { time: '12AM', value: 70 },
                ],
                temperatureData: [
                    { time: '6AM', value: 18 },
                    { time: '9AM', value: 20 },
                    { time: '12PM', value: 24 },
                    { time: '3PM', value: 26 },
                    { time: '6PM', value: 25 },
                    { time: '9PM', value: 22 },
                    { time: '12AM', value: 20 },
                ],
                phData: [
                    { time: '6AM', value: 6.2 },
                    { time: '9AM', value: 6.3 },
                    { time: '12PM', value: 6.5 },
                    { time: '3PM', value: 6.6 },
                    { time: '6PM', value: 6.5 },
                    { time: '9PM', value: 6.4 },
                    { time: '12AM', value: 6.3 },
                ],
                airQualityData: [
                    { time: '6AM', value: 45 },
                    { time: '9AM', value: 52 },
                    { time: '12PM', value: 58 },
                    { time: '3PM', value: 65 },
                    { time: '6PM', value: 55 },
                    { time: '9PM', value: 48 },
                    { time: '12AM', value: 42 },
                ],
                waterQualityData: [
                    { time: '6AM', value: 85 },
                    { time: '9AM', value: 84 },
                    { time: '12PM', value: 82 },
                    { time: '3PM', value: 80 },
                    { time: '6PM', value: 83 },
                    { time: '9PM', value: 86 },
                    { time: '12AM', value: 88 },
                ],
                weeklyWeatherData: [
                    { day: 'Mon', temp: 22, humidity: 60, rain: 10 },
                    { day: 'Tue', temp: 24, humidity: 55, rain: 0 },
                    { day: 'Wed', temp: 25, humidity: 50, rain: 0 },
                    { day: 'Thu', temp: 23, humidity: 65, rain: 30 },
                    { day: 'Fri', temp: 21, humidity: 70, rain: 40 },
                    { day: 'Sat', temp: 24, humidity: 60, rain: 5 },
                    { day: 'Sun', temp: 26, humidity: 65, rain: 20 },
                ],
                weatherAlerts: [
                    { id: '1', title: 'High Wind Warning', message: 'Strong winds expected on Wednesday. Consider postponing pesticide application.' },
                    { id: '2', title: 'Rain Forecast', message: 'Moderate rain expected on Thursday. Plan irrigation accordingly.' }
                ],
                waterFlow: 12.5,
                duration: '15:20',
                coverage: 'North Field'
            },
            status: 'success'
        };
    }
};

export const fetchSoilHealth = async (): Promise<SoilHealthData> => {
    try {
        const response = await apiClient.get('/api/sensor/soil-health');
        return response.data.data;
    } catch (error) {
        console.error('Error fetching soil health data:', error);
        return {
            health_index: 75,
            health_category: 'Good',
            issues: {
                'Low_Nitrogen': false,
                'High_Nitrogen': false,
                'Low_Phosphorus': false,
                'High_Phosphorus': false,
                'Low_Potassium': false,
                'High_Potassium': false,
                'Acidic_pH': false,
                'Alkaline_pH': false,
                'Low_Organic_Carbon': true,
                'High_Organic_Carbon': false,
                'High_Salinity': false,
                'Poor_Texture': false,
                'Low_Soil_Moisture': false,
                'High_Soil_Moisture': false
            },
            active_issues: ['Low Organic Carbon']
        };
    }
};

export const updateThreshold = async (threshold: number): Promise<void> => {
    try {
        await apiClient.post('/api/sensor/update', { threshold });
    } catch (error) {
        console.error('Error updating threshold:', error);
        throw error;
    }
};

export const updateIrrigation = async (irrigation: boolean): Promise<void> => {
    try {
        await apiClient.post('/api/sensor/irrigate', { irrigation });
    } catch (error) {
        console.error('Error updating irrigation:', error);
        throw error;
    }
};