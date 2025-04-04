import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, Brain, AlertCircle, LucideIcon, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";
import { getSoilAIInsights } from '@/services/apiService';
import { Badge } from '@/components/ui/badge';

interface SoilInsightsCardProps {
    soilHealth: number;
    metrics: {
        name: string;
        value: number;
        icon: LucideIcon;
        color: string;
    }[];
    className?: string;
}

const SoilInsightsCard = ({ soilHealth, metrics, className }: SoilInsightsCardProps) => {
    const [insights, setInsights] = useState<string[]>([]);
    const [loading, setLoading] = useState(false);
    const [isAIGenerated, setIsAIGenerated] = useState(false);

    useEffect(() => {
        const fetchInsights = async () => {
            setLoading(true);
            try {
                // Only get insights for metrics with issues (below 70)
                const problematicMetrics = metrics.filter(m => m.value < 70);
                
                // If no issues, set a simple message
                if (problematicMetrics.length === 0) {
                    setInsights(["Your soil is healthy. No immediate actions needed."]);
                    setIsAIGenerated(false);
                    setLoading(false);
                    return;
                }
                
                // Format metrics for the AI insights call - only include problematic ones
                const soilData = {
                    overallHealth: soilHealth,
                    metrics: problematicMetrics.map(m => ({ name: m.name, value: m.value }))
                };

                // Get AI-generated insights
                const aiInsights = await getSoilAIInsights(soilData);
                
                if (aiInsights && aiInsights.length > 0) {
                    // Limit to 2 insights maximum for more compact display
                    setInsights(aiInsights.slice(0, 2));
                    setIsAIGenerated(true);
                } else {
                    setInsights(["Unable to fetch insights at this time."]);
                    setIsAIGenerated(false);
                }
            } catch (error) {
                console.error('Error fetching insights:', error);
                setInsights(["Unable to fetch insights at this time."]);
                setIsAIGenerated(false);
            } finally {
                setLoading(false);
            }
        };

        fetchInsights();
    }, [metrics, soilHealth]);

    return (
        <Card className={cn("border-l-4 border-blue-500", className)}>
            <CardHeader className="pb-1 pt-3">
                <CardTitle className="text-sm flex items-center justify-between">
                    <div className="flex items-center">
                        <div className="mr-2 p-1.5 rounded-lg bg-blue-500/10">
                            <Brain className="h-4 w-4 text-blue-600" />
                        </div>
                        Soil Action Items
                    </div>
                    {isAIGenerated && (
                        <Badge variant="outline" className="flex items-center gap-1 text-xs">
                            <Sparkles className="h-3 w-3 text-yellow-500" />
                            AI
                        </Badge>
                    )}
                </CardTitle>
            </CardHeader>
            <CardContent className="pt-0 pb-3">
                {loading ? (
                    <div className="flex items-center justify-center py-4">
                        <Loader2 className="h-6 w-6 animate-spin text-blue-500" />
                    </div>
                ) : insights.length > 0 ? (
                    <div className="space-y-2">
                        {insights.map((insight, index) => (
                            <div key={index} className="flex items-start gap-2 text-xs">
                                <AlertCircle className="h-4 w-4 text-blue-500 mt-0.5 flex-shrink-0" />
                                <p>{insight}</p>
                            </div>
                        ))}
                    </div>
                ) : (
                    <p className="text-center text-muted-foreground py-2 text-xs">No issues detected</p>
                )}
            </CardContent>
        </Card>
    );
};

export default SoilInsightsCard;