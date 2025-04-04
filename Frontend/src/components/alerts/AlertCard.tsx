
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertTriangle } from "lucide-react";

interface Alert {
  id: number;
  title: string;
  recommendation: string;
}

interface AlertCardProps {
  alerts: Alert[];
  className?: string;
}

const AlertCard = ({ alerts, className }: AlertCardProps) => {
  return (
    <Card className={`${className} border-orange-300 dark:border-orange-700`}>
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center text-lg text-orange-700 dark:text-orange-400">
          <AlertTriangle className="mr-2 h-5 w-5" />
          Crop Alerts
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          {alerts.map((alert) => (
            <div key={alert.id} className="flex items-start gap-2 pb-2 border-b">
              <AlertTriangle className="h-4 w-4 text-orange-600 mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-sm font-medium">{alert.title}</p>
                <p className="text-xs text-muted-foreground">{alert.recommendation}</p>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default AlertCard;
