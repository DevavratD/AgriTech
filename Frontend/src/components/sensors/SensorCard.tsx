
import { Card, CardContent } from "@/components/ui/card";
import { LucideIcon } from "lucide-react";

interface SensorCardProps {
  icon: LucideIcon;
  iconColor: string;
  title: string;
  value: string | number;
  optimalRange: string;
  className?: string;
}

const SensorCard = ({
  icon: Icon,
  iconColor,
  title,
  value,
  optimalRange,
  className,
}: SensorCardProps) => {
  return (
    <Card className={className}>
      <CardContent className="pt-3 pb-3 px-3 sm:pt-4 sm:pb-4 sm:px-4">
        <div className="flex flex-col items-center text-center">
          <Icon className={`h-6 w-6 sm:h-8 sm:w-8 ${iconColor} mb-1 sm:mb-2`} />
          <h3 className="font-medium text-sm sm:text-base">{title}</h3>
          <div className="text-xl sm:text-2xl font-bold mt-0.5 sm:mt-1">{value}</div>
          <span className="text-2xs sm:text-xs text-muted-foreground mt-0.5 sm:mt-1">
            Optimal Range: {optimalRange}
          </span>
        </div>
      </CardContent>
    </Card>
  );
};

export default SensorCard;
