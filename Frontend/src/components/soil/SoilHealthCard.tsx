import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Sprout, Droplets, Leaf, FlaskConical } from "lucide-react";
import { cn } from "@/lib/utils";

interface SoilMetric {
  name: string;
  value: number;
  icon: React.ElementType;
  color: string;
}

interface SoilHealthCardProps {
  overallHealth: number;
  metrics: SoilMetric[];
  className?: string;
}

const SoilHealthCard = ({ overallHealth, metrics, className }: SoilHealthCardProps) => {
  const getHealthStatus = (value: number) => {
    if (value >= 75) return { text: "Good", color: "text-green-500" };
    if (value >= 50) return { text: "Fair", color: "text-yellow-500" };
    return { text: "Poor", color: "text-red-500" };
  };

  const healthStatus = getHealthStatus(overallHealth);

  return (
    <Card className={cn("overflow-hidden", className)}>
      <CardHeader className="pb-2 bg-gradient-to-r from-green-500/10 to-emerald-500/10">
        <CardTitle className="flex items-center text-lg">
          <div className="mr-2 p-2 rounded-lg bg-green-500/10">
            <Sprout className="h-5 w-5 text-green-600" />
          </div>
          Soil Health Index
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-6">
        <div className="flex flex-col items-center mb-6">
          <div className="relative w-24 h-24 mb-3">
            <svg className="w-full h-full" viewBox="0 0 36 36">
              <path
                d="M18 2.0845
                  a 15.9155 15.9155 0 0 1 0 31.831
                  a 15.9155 15.9155 0 0 1 0 -31.831"
                fill="none"
                stroke="#e5e7eb"
                strokeWidth="3"
              />
              <path
                d="M18 2.0845
                  a 15.9155 15.9155 0 0 1 0 31.831
                  a 15.9155 15.9155 0 0 1 0 -31.831"
                fill="none"
                stroke={overallHealth >= 75 ? "#22c55e" : overallHealth >= 50 ? "#eab308" : "#ef4444"}
                strokeWidth="3"
                strokeDasharray={`${overallHealth}, 100`}
                className="transition-all duration-500"
              />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-2xl font-bold">{overallHealth}</span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className={cn("text-sm font-medium", healthStatus.color)}>
              {healthStatus.text}
            </span>
            <span className="text-sm text-muted-foreground">Overall Health</span>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          {metrics.map((metric, index) => {
            const Icon = metric.icon;
            const progressColor = metric.value >= 75 ? "bg-green-500" :
              metric.value >= 50 ? "bg-yellow-500" :
                "bg-red-500";
            return (
              <div key={index} className="space-y-2">
                <div className="flex items-center gap-2">
                  <div className={cn("p-1.5 rounded-md", metric.color.replace("text-", "bg-") + "/10")}>
                    <Icon className={cn("h-4 w-4", metric.color)} />
                  </div>
                  <span className="text-sm font-medium">{metric.name}</span>
                </div>
                <div className="space-y-1">
                  <div className="flex justify-between">
                    <span className="text-xs text-muted-foreground">Current Level</span>
                    <span className="text-xs font-medium">{metric.value}%</span>
                  </div>
                  <div className="relative">
                    <Progress
                      value={metric.value}
                      className={cn("h-1.5", progressColor)}
                    />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
};

export default SoilHealthCard;
