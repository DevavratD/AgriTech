"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Cloud, CloudRain, Sun, Wind } from "lucide-react"
import { cn } from "@/lib/utils"

interface WeatherCardProps {
  temperature: number;
  description: string;
  humidity: number;
  today: string;
  tomorrow: string;
  windSpeed?: number;
  className?: string;
}

export default function WeatherCard({
  temperature,
  description,
  humidity,
  today,
  tomorrow,
  windSpeed = 12,
  className
}: WeatherCardProps) {
  const getWeatherIcon = () => {
    const desc = description.toLowerCase();
    if (desc.includes('rain') || desc.includes('drizzle') || desc.includes('shower')) {
      return <CloudRain className="h-12 w-12 mr-4 text-blue-500" />;
    } else if (desc.includes('cloud') || desc.includes('overcast') || desc.includes('fog') || desc.includes('mist')) {
      return <Cloud className="h-12 w-12 mr-4 text-blue-600" />;
    } else if (desc.includes('sunny') || desc.includes('clear')) {
      return <Sun className="h-12 w-12 mr-4 text-yellow-500" />;
    } else {
      return temperature > 25 
        ? <Sun className="h-12 w-12 mr-4 text-yellow-500" /> 
        : <Cloud className="h-12 w-12 mr-4 text-blue-600" />;
    }
  };

  const getTomorrowIcon = () => {
    if (tomorrow.includes('rain') || tomorrow.includes('shower')) {
      return <CloudRain className="h-6 w-6 my-1 text-blue-500" />;
    } else if (tomorrow.toLowerCase().includes('cloud')) {
      return <Cloud className="h-6 w-6 my-1 text-blue-500" />;
    } else {
      return <Sun className="h-6 w-6 my-1 text-yellow-500" />;
    }
  };

  return (
    <Card className={cn("overflow-hidden", className)}>
      <CardHeader className="pb-2 bg-gradient-to-r from-blue-500/10 to-cyan-500/10">
        <CardTitle className="text-lg flex items-center">
          <div className="mr-2 p-2 rounded-lg bg-blue-500/10">
            <Cloud className="h-5 w-5 text-blue-600" />
          </div>
          Weather Forecast
        </CardTitle>
        <CardDescription>Current and upcoming weather conditions</CardDescription>
      </CardHeader>
      <CardContent className="pt-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center">
            {getWeatherIcon()}
            <div>
              <p className="text-3xl font-bold">{temperature}°C</p>
              <p className="text-sm text-gray-500">{description}</p>
            </div>
          </div>
          <div className="space-y-2">
            <div className="flex items-center text-sm">
              <CloudRain className="h-4 w-4 mr-2 text-blue-500" />
              <span>{humidity}% humidity</span>
            </div>
            <div className="flex items-center text-sm">
              <Wind className="h-4 w-4 mr-2 text-gray-500" />
              <span>{windSpeed} km/h winds</span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 text-center">
          <div className="flex flex-col items-center p-3 bg-blue-50 dark:bg-blue-950/20 rounded-lg">
            <span className="text-sm font-medium">Today</span>
            <Sun className="h-6 w-6 my-1 text-yellow-500" />
            <span className="text-sm">{today}</span>
          </div>
          <div className="flex flex-col items-center p-3 bg-blue-50 dark:bg-blue-950/20 rounded-lg">
            <span className="text-sm font-medium">Tomorrow</span>
            {getTomorrowIcon()}
            <span className="text-sm">{tomorrow}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
