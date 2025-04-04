import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, Brain, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";

interface SensorInsightsCardProps {
    sensorType: string;
    currentValue: number;
    threshold?: number;
    unit?: string;
    className?: string;
}

const SensorInsightsCard = ({
    sensorType,
    currentValue,
    threshold,
    unit = "",
    className
}: SensorInsightsCardProps) => {
    const [insight, setInsight] = useState<string>("");
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        const fetchInsight = async () => {
            setLoading(true);
            try {
                // Check if API key is available
                const apiKey = import.meta.env.VITE_OPENROUTER_API_KEY || localStorage.getItem('OPENROUTER_API_KEY');
                
                if (!apiKey) {
                    // Provide fallback insights without API call
                    setInsight(getLocalInsight(sensorType, currentValue, threshold, unit));
                    setLoading(false);
                    return;
                }
                
                const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${apiKey}`
                    },
                    body: JSON.stringify({
                        model: "anthropic/claude-3-opus",
                        messages: [{
                            role: "user",
                            content: `Provide a brief, actionable recommendation for ${sensorType} sensor reading of ${currentValue}${unit}. ${threshold ? `The threshold is set to ${threshold}${unit}.` : ''
                                } Keep the recommendation under 100 words and focus on agricultural context.`
                        }]
                    })
                });

                const data = await response.json();
                setInsight(data.choices[0].message.content);
            } catch (error) {
                console.error('Error fetching insight:', error);
                // Use local insights as fallback
                setInsight(getLocalInsight(sensorType, currentValue, threshold, unit));
            } finally {
                setLoading(false);
            }
        };

        fetchInsight();
    }, [sensorType, currentValue, threshold, unit]);
    
    // Function to generate local insights without API call
    const getLocalInsight = (type: string, value: number, threshold: number | undefined, unit: string): string => {
        switch (type.toLowerCase()) {
            case 'temperature':
                if (value > 30) {
                    return "High temperature detected. Consider increasing irrigation frequency and providing shade for sensitive crops. Monitor plants for heat stress symptoms.";
                } else if (value < 15) {
                    return "Low temperature detected. Protect sensitive crops with covers if frost is possible. Delay planting of heat-loving crops until temperatures rise.";
                } else {
                    return "Temperature is within optimal range for most crops. Maintain regular irrigation and monitoring schedules.";
                }
            
            case 'humidity':
                if (value > 80) {
                    return "High humidity levels detected. Monitor crops for fungal diseases. Ensure adequate spacing between plants for air circulation and consider fungicide application if necessary.";
                } else if (value < 40) {
                    return "Low humidity detected. Increase irrigation frequency and consider misting for humidity-loving crops. Mulch soil to retain moisture.";
                } else {
                    return "Humidity is within optimal range for most crops. Maintain regular monitoring for any changes.";
                }
                
            case 'soil moisture':
                if (value > (threshold || 80)) {
                    return "Soil moisture is high. Reduce irrigation frequency to prevent waterlogging and root diseases. Ensure proper drainage in the field.";
                } else if (value < (threshold || 30)) {
                    return "Soil moisture is low. Increase irrigation to prevent water stress. Consider applying mulch to reduce evaporation from soil.";
                } else {
                    return "Soil moisture is within optimal range. Maintain current irrigation schedule and monitor for any changes.";
                }
                
            case 'soil ph':
                if (value > 7.5) {
                    return "Soil pH is alkaline. Consider adding organic matter or sulfur to lower pH for acid-loving crops. Choose crops that tolerate alkaline conditions.";
                } else if (value < 5.5) {
                    return "Soil pH is acidic. Consider adding lime to raise pH. Choose crops that tolerate acidic conditions or adjust soil for your target crops.";
                } else {
                    return "Soil pH is within optimal range for most crops. Continue regular soil testing to monitor any changes.";
                }
                
            default:
                return `Current ${type} reading is ${value}${unit}. ${threshold ? `Your threshold is set at ${threshold}${unit}.` : ''} Monitor regularly and adjust farm management practices as needed.`;
        }
    };

    return (
        <Card className={cn("border-l-4 border-blue-500", className)}>
            <CardHeader className="pb-2">
                <CardTitle className="flex items-center gap-2 text-lg">
                    <Brain className="h-5 w-5 text-blue-500" />
                    <span>AI Insights</span>
                </CardTitle>
            </CardHeader>
            <CardContent>
                {loading ? (
                    <div className="flex items-center justify-center py-4">
                        <Loader2 className="h-6 w-6 animate-spin text-blue-500" />
                    </div>
                ) : (
                    <div className="flex items-start gap-3 p-3 bg-blue-50 dark:bg-blue-950/20 rounded-lg">
                        <AlertCircle className="h-5 w-5 text-blue-500 mt-0.5 flex-shrink-0" />
                        <p className="text-sm text-blue-800 dark:text-blue-300">
                            {insight}
                        </p>
                    </div>
                )}
            </CardContent>
        </Card>
    );
};

export default SensorInsightsCard; 