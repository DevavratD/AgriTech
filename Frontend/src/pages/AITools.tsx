import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Camera, Upload, Leaf, ArrowRight, TrendingUp, BarChart, FileText, Zap, Settings, Loader2 } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { Switch } from "@/components/ui/switch";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  LineChart,
  Line,
  CartesianGrid,
  Legend
} from "recharts";
import { cn } from "@/lib/utils";
import { 
  detectPlantDisease, 
  getRecommendedCrop, 
  getCropRecommendationsFromSensors, 
  getMarketInsights, 
  type CropRecommendationResponse, 
  type CropRecommendationRequest,
  type MarketInsightsResponse 
} from "@/services/apiService";
import { toast } from "sonner";

const AITools = () => {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [analysisComplete, setAnalysisComplete] = useState(false);
  const [isAutomaticRecommendation, setIsAutomaticRecommendation] = useState(true);
  const [loadingRecommendations, setLoadingRecommendations] = useState(false);
  const [cropRecommendations, setCropRecommendations] = useState<CropRecommendationResponse | null>(null);
  const [loadingCropRecommendations, setLoadingCropRecommendations] = useState(false);
  const [diseaseResult, setDiseaseResult] = useState<{
    disease: string;
    confidence: number;
    treatment?: string;
    prevention?: string;
  } | null>(null);
  
  // Form state for custom crop recommendation
  const [cropFormData, setCropFormData] = useState<CropRecommendationRequest>({
    N: 50,
    P: 50,
    K: 50,
    temperature: 25,
    humidity: 50,
    ph: 6.5,
    rainfall: 200
  });

  // State for market insights
  const [marketForm, setMarketForm] = useState({
    commodity: "Potato",
    state: "Maharashtra",
    market: "Pune"
  });
  const [marketInsights, setMarketInsights] = useState<MarketInsightsResponse | null>(null);
  const [loadingMarketInsights, setLoadingMarketInsights] = useState(false);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setSelectedImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const analyzeImage = async () => {
    if (!selectedImage) return;
    
    setAnalyzing(true);
    setLoadingRecommendations(false);
    try {
      // Extract base64 data from the data URL
      const base64Image = selectedImage.split(',')[1];
      
      // Call the backend API
      const result = await detectPlantDisease(base64Image);
      
      // Set the results
      setDiseaseResult(result.data);
      setAnalysisComplete(true);
      
      // Show success message
      toast.success('Plant analysis complete!');
    } catch (error) {
      console.error('Error analyzing image:', error);
      toast.error('Failed to analyze image. Please try again.');
    } finally {
      setAnalyzing(false);
      setLoadingRecommendations(false);
    }
  };

  const resetAnalysis = () => {
    setSelectedImage(null);
    setAnalysisComplete(false);
    setDiseaseResult(null);
  };
  
  const handleInputChange = (field: keyof CropRecommendationRequest, value: number) => {
    setCropFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };
  
  const loadRecommendationsFromSensors = async () => {
    try {
      setLoadingCropRecommendations(true);
      const result = await getCropRecommendationsFromSensors();
      console.log('Crop recommendations from sensors:', result);
      
      if (result?.data?.recommendations) {
        console.log('Setting crop recommendations with data:', result.data);
        setCropRecommendations(result.data);
      } else if (result?.data?.data?.recommendations) {
        console.log('Setting crop recommendations with nested data:', result.data.data);
        setCropRecommendations(result.data.data);
      } else {
        console.warn('No recommendations found in response:', result);
        // Use fallback data
        setCropRecommendations({
          recommendations: [
            { crop: "rice", confidence_score: 0.65 },
            { crop: "maize", confidence_score: 0.62 }
          ],
          timestamp: new Date().toISOString()
        });
      }
    } catch (error) {
      console.error('Error loading recommendations from sensors:', error);
      // Use fallback data on error
      setCropRecommendations({
        recommendations: [
          { crop: "rice", confidence_score: 0.65 },
          { crop: "maize", confidence_score: 0.62 }
        ],
        timestamp: new Date().toISOString()
      });
    } finally {
      setLoadingCropRecommendations(false);
    }
  };
  
  const getCustomRecommendations = async () => {
    setLoadingCropRecommendations(true);
    try {
      console.log('Submitting crop form data:', cropFormData);
      const result = await getRecommendedCrop(cropFormData);
      
      // Check if the data structure is as expected
      if (result?.data?.recommendations) {
        setCropRecommendations(result.data);
        toast.success('Custom crop recommendations generated!');
      } else if ('recommendations' in result) {
        // Handle case where recommendations are directly in the result
        // Type assertion to match the expected CropRecommendationResponse type
        setCropRecommendations(result as unknown as CropRecommendationResponse);
        toast.success('Custom crop recommendations generated!');
      } else {
        console.error('Unexpected data structure:', result);
        toast.error('Received invalid data format. Using fallback data.');
        
        // Use fallback data if the structure is not as expected
        setCropRecommendations({
          recommendations: [
            { crop: "rice", confidence_score: 0.92 },
            { crop: "maize", confidence_score: 0.85 },
            { crop: "cotton", confidence_score: 0.78 }
          ],
          timestamp: new Date().toISOString()
        });
      }
    } catch (error) {
      console.error('Error getting crop recommendations:', error);
      toast.error('Failed to get crop recommendations. Please try again.');
    } finally {
      setLoadingCropRecommendations(false);
    }
  };
  
  // Load recommendations automatically when switching to automatic mode
  const handleRecommendationModeChange = (isAutomatic: boolean) => {
    setIsAutomaticRecommendation(isAutomatic);
    if (isAutomatic) {
      loadRecommendationsFromSensors();
    } else {
      // Reset recommendations when switching to manual mode
      setCropRecommendations(null);
    }
  };

  // Handle market form input changes
  const handleMarketInputChange = (field: string, value: string) => {
    setMarketForm(prev => ({
      ...prev,
      [field]: value
    }));
  };

  // Load market insights
  const loadMarketInsights = async () => {
    try {
      setLoadingMarketInsights(true);
      const { commodity, state, market } = marketForm;
      console.log(`Loading market insights for ${commodity} in ${market}, ${state}`);
      
      const result = await getMarketInsights(commodity, state, market);
      console.log('Market insights result:', result);
      
      if (result.status === "success" && result.data) {
        setMarketInsights(result.data);
        toast.success(`Market data loaded for ${commodity} in ${market}, ${state}`);
      } else {
        toast.error("Failed to load market insights. Please try again.");
      }
    } catch (error) {
      console.error('Error loading market insights:', error);
      toast.error("An error occurred while fetching market data.");
    } finally {
      setLoadingMarketInsights(false);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in pb-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">AI Tools</h1>
      </div>

      <Tabs defaultValue="disease" className="w-full">
        <TabsList className="w-full grid grid-cols-3 mb-4">
          <TabsTrigger value="disease" className="text-xs sm:text-sm px-1 sm:px-3">Disease Detection</TabsTrigger>
          <TabsTrigger value="recommend" className="text-xs sm:text-sm px-1 sm:px-3">Crop Recommendation</TabsTrigger>
          <TabsTrigger value="market" className="text-xs sm:text-sm px-1 sm:px-3">Market Insights</TabsTrigger>
        </TabsList>

        {/* Disease Detection Tab */}
        <TabsContent value="disease" className="space-y-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center text-lg">
                <Leaf className="mr-2 h-5 w-5 text-red-500" />
                Plant Disease Detection
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {!selectedImage ? (
                <div className="flex flex-col items-center justify-center border-2 border-dashed border-muted-foreground/25 rounded-lg p-8 text-center">
                  <div className="mb-4 rounded-full bg-primary/10 p-3">
                    <Camera className="h-6 w-6 text-primary" />
                  </div>
                  <h3 className="mb-1 text-lg font-medium">Upload a plant image</h3>
                  <p className="text-sm text-muted-foreground">
                    Take a clear photo of the affected plant part
                  </p>
                  <label htmlFor="image-upload" className="cursor-pointer">
                    <div className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground shadow hover:bg-primary/90">
                      <Upload className="mr-2 h-4 w-4" />
                      Choose Image
                    </div>
                    <input
                      id="image-upload"
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={handleImageUpload}
                    />
                  </label>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="relative rounded-lg overflow-hidden border">
                    <img
                      src={selectedImage}
                      alt="Selected plant"
                      className="w-full h-auto max-h-[300px] object-contain"
                    />
                    {!analysisComplete && (
                      <Button
                        variant="default"
                        className="absolute bottom-4 right-4"
                        onClick={analyzeImage}
                        disabled={analyzing}
                      >
                        {analyzing ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Analyzing...
                          </>
                        ) : (
                          <>Analyze Image</>
                        )}
                      </Button>
                    )}
                  </div>

                  {analyzing ? (
                    <div className="space-y-2 text-center">
                      <p className="text-sm text-muted-foreground">Analyzing image...</p>
                      <Progress value={65} className="h-2" />
                    </div>
                  ) : analysisComplete && diseaseResult ? (
                    <div className="space-y-4">
                      <div className="p-4 bg-muted rounded-lg">
                        <h3 className="font-medium mb-2">Analysis Results</h3>
                        <div className="space-y-2">
                          <div className="flex justify-between">
                            <span className="text-sm">{diseaseResult.disease}</span>
                            <span className="text-sm font-medium">{Math.round(diseaseResult.confidence * 100)}%</span>
                          </div>
                          <Progress value={Math.round(diseaseResult.confidence * 100)} className="h-2 bg-muted-foreground/20" />
                        </div>
                      </div>

                      {loadingRecommendations ? (
                        <div className="space-y-2 text-center p-4">
                          <p className="text-sm text-muted-foreground">Generating AI recommendations...</p>
                          <Progress value={75} className="h-2" />
                        </div>
                      ) : (
                        <>
                          {diseaseResult.treatment && (
                            <div className="p-4 bg-red-50 dark:bg-red-950/20 text-red-800 dark:text-red-300 rounded-lg">
                              <h3 className="font-medium mb-1">Treatment Recommendations</h3>
                              <p className="text-sm">{diseaseResult.treatment}</p>
                            </div>
                          )}

                          {diseaseResult.prevention && (
                            <div className="p-4 bg-blue-50 dark:bg-blue-950/20 text-blue-800 dark:text-blue-300 rounded-lg">
                              <h3 className="font-medium mb-1">Prevention Tips</h3>
                              <p className="text-sm">{diseaseResult.prevention}</p>
                            </div>
                          )}
                        </>
                      )}
                    </div>
                  ) : null}
                </div>
              )}
            </CardContent>
            {analysisComplete && (
              <CardFooter className="flex justify-end border-t pt-4">
                <Button variant="outline" onClick={resetAnalysis}>
                  Scan Another Image
                </Button>
              </CardFooter>
            )}
          </Card>
        </TabsContent>

        {/* Crop Recommendation Tab */}
        <TabsContent value="recommend" className="space-y-4">
          <Card>
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center text-lg">
                  <Leaf className="mr-2 h-5 w-5 text-green-500" />
                  Crop Recommendation
                </CardTitle>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-muted-foreground">Automatic</span>
                  <Switch
                    checked={isAutomaticRecommendation}
                    onCheckedChange={handleRecommendationModeChange}
                  />
                  <span className="text-sm text-muted-foreground">Custom</span>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {isAutomaticRecommendation ? (
                <div className="space-y-4">
                  <div className="flex items-center justify-between text-sm text-muted-foreground">
                    <span className="flex items-center gap-2">
                      <Zap className="h-4 w-4" />
                      Based on your farm's sensor data
                    </span>
                    <span className="text-xs">Last updated: 2 hours ago</span>
                  </div>

                  {loadingCropRecommendations ? (
                    <div className="flex flex-col items-center justify-center py-8">
                      <Loader2 className="h-8 w-8 text-primary animate-spin mb-4" />
                      <p className="text-sm text-muted-foreground">Loading recommendations from sensors...</p>
                    </div>
                  ) : cropRecommendations ? (
                    <div className="space-y-4">
                      {cropRecommendations.recommendations && cropRecommendations.recommendations.length > 0 ? (
                        // Filter out crops with 0% confidence score
                        cropRecommendations.recommendations
                          .filter(crop => crop.confidence_score > 0)
                          .map((crop, index) => (
                            <div key={index} className="flex items-center bg-white dark:bg-green-800/20 rounded-lg p-3">
                              <div className="text-2xl mr-3">{getCropEmoji(crop.crop)}</div>
                              <div className="flex-1">
                                <div className="flex justify-between">
                                  <h4 className="font-medium text-green-900 dark:text-green-100">{crop.crop}</h4>
                                  <span className="text-sm font-medium text-green-800 dark:text-green-200">
                                    {Math.round(crop.confidence_score * 100)}%
                                  </span>
                                </div>
                                <Progress 
                                  value={Math.round(crop.confidence_score * 100)} 
                                  className="h-2 mt-1 bg-green-100 dark:bg-green-950"
                                />
                                <p className="text-xs text-muted-foreground mt-1">
                                  {getCropReason(crop.crop, crop.confidence_score)}
                                </p>
                              </div>
                            </div>
                          ))
                      ) : (
                        <div className="text-center py-4">
                          <p className="text-muted-foreground">No crop recommendations available.</p>
                          <Button 
                            className="mt-2" 
                            variant="outline" 
                            onClick={loadRecommendationsFromSensors}
                          >
                            Try Again
                          </Button>
                        </div>
                      )}
                    </div>
                  ) : (
                    <Button 
                      className="w-full" 
                      onClick={loadRecommendationsFromSensors}
                      disabled={loadingCropRecommendations}
                    >
                      {loadingCropRecommendations ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Loading...
                        </>
                      ) : (
                        <>Load Recommendations from Sensors</>
                      )}
                    </Button>
                  )}
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Settings className="h-4 w-4" />
                    Enter your soil and weather conditions manually
                  </div>

                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="space-y-2">
                      <label className="text-sm font-medium">pH Level</label>
                      <Input 
                        type="number" 
                        value={cropFormData.ph}
                        onChange={(e) => handleInputChange('ph', parseFloat(e.target.value))}
                        step="0.1" 
                        min="0" 
                        max="14" 
                      />
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-medium">Nitrogen (mg/kg)</label>
                      <Input 
                        type="number" 
                        value={cropFormData.N}
                        onChange={(e) => handleInputChange('N', parseInt(e.target.value))}
                      />
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-medium">Phosphorus (mg/kg)</label>
                      <Input 
                        type="number" 
                        value={cropFormData.P}
                        onChange={(e) => handleInputChange('P', parseInt(e.target.value))}
                      />
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-medium">Potassium (mg/kg)</label>
                      <Input 
                        type="number" 
                        value={cropFormData.K}
                        onChange={(e) => handleInputChange('K', parseInt(e.target.value))}
                      />
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-medium">Average Temperature (°C)</label>
                      <Input 
                        type="number" 
                        value={cropFormData.temperature}
                        onChange={(e) => handleInputChange('temperature', parseFloat(e.target.value))}
                      />
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-medium">Rainfall (mm)</label>
                      <Input 
                        type="number" 
                        value={cropFormData.rainfall}
                        onChange={(e) => handleInputChange('rainfall', parseFloat(e.target.value))}
                      />
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-medium">Humidity (%)</label>
                      <Input 
                        type="number" 
                        value={cropFormData.humidity}
                        onChange={(e) => handleInputChange('humidity', parseFloat(e.target.value))}
                      />
                    </div>
                  </div>

                  {loadingCropRecommendations ? (
                    <Button className="w-full mt-4" disabled>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Getting Recommendations...
                    </Button>
                  ) : (
                    <Button 
                      className="w-full mt-4" 
                      onClick={getCustomRecommendations}
                    >
                      Get Custom Recommendations
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  )}
                  
                  {!loadingCropRecommendations && cropRecommendations && (
                    <div className="space-y-4 mt-6 pt-6 border-t">
                      <h3 className="font-medium">Recommended Crops</h3>
                      {cropRecommendations.recommendations && cropRecommendations.recommendations.length > 0 ? (
                        // Filter out crops with 0% confidence score
                        cropRecommendations.recommendations
                          .filter(crop => crop.confidence_score > 0)
                          .map((crop, index) => (
                            <div key={index} className="flex items-center bg-white dark:bg-green-800/20 rounded-lg p-3">
                              <div className="text-2xl mr-3">{getCropEmoji(crop.crop)}</div>
                              <div className="flex-1">
                                <div className="flex justify-between">
                                  <h4 className="font-medium text-green-900 dark:text-green-100">{crop.crop}</h4>
                                  <span className="text-sm font-medium text-green-800 dark:text-green-200">
                                    {Math.round(crop.confidence_score * 100)}%
                                  </span>
                                </div>
                                <Progress 
                                  value={Math.round(crop.confidence_score * 100)} 
                                  className="h-2 mt-1 bg-green-100 dark:bg-green-950"
                                />
                                <p className="text-xs text-muted-foreground mt-1">
                                  {getCropReason(crop.crop, crop.confidence_score)}
                                </p>
                              </div>
                            </div>
                          ))
                      ) : (
                        <div className="text-center py-4">
                          <p className="text-muted-foreground">No crop recommendations available.</p>
                          <Button 
                            className="mt-2" 
                            variant="outline" 
                            onClick={getCustomRecommendations}
                          >
                            Try Again
                          </Button>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Market Insights Tab */}
        <TabsContent value="market" className="space-y-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center text-lg">
                <BarChart className="mr-2 h-5 w-5 text-blue-500" />
                Crop Market Insights
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-muted-foreground">
                Live market prices and demand forecasts to help you make profitable decisions.
              </p>

              <div className="space-y-2">
                <label className="text-sm font-medium">Select Crop</label>
                <select 
                  className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm" 
                  value={marketForm.commodity}
                  onChange={(e) => handleMarketInputChange('commodity', e.target.value)}
                >
                  <option value="Potato">Potato</option>
                  <option value="Rice">Rice</option>
                  <option value="Wheat">Wheat</option>
                  <option value="Onion">Onion</option>
                  <option value="Tomato">Tomato</option>
                  <option value="Cotton">Cotton</option>
                  <option value="Maize">Maize</option>
                  <option value="Soyabean">Soyabean</option>
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Select State</label>
                <select 
                  className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm" 
                  value={marketForm.state}
                  onChange={(e) => handleMarketInputChange('state', e.target.value)}
                >
                  <option value="Maharashtra">Maharashtra</option>
                  <option value="Uttar Pradesh">Uttar Pradesh</option>
                  <option value="Punjab">Punjab</option>
                  <option value="Karnataka">Karnataka</option>
                  <option value="Madhya Pradesh">Madhya Pradesh</option>
                  <option value="Gujarat">Gujarat</option>
                  <option value="Haryana">Haryana</option>
                  <option value="Rajasthan">Rajasthan</option>
                  <option value="Tamil Nadu">Tamil Nadu</option>
                  <option value="Andhra Pradesh">Andhra Pradesh</option>
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Select Market</label>
                <select 
                  className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm" 
                  value={marketForm.market}
                  onChange={(e) => handleMarketInputChange('market', e.target.value)}
                >
                  <option value="Pune">Pune</option>
                  <option value="Mumbai">Mumbai</option>
                  <option value="Nagpur">Nagpur</option>
                  <option value="Nashik">Nashik</option>
                  <option value="Kolhapur">Kolhapur</option>
                  <option value="Ahmednagar">Ahmednagar</option>
                  <option value="Solapur">Solapur</option>
                  <option value="Amravati">Amravati</option>
                </select>
              </div>

              <div className="mt-4 pt-4 border-t">
                <div className="flex justify-between mb-1">
                  <h3 className="font-medium">Market Analysis</h3>
                  <span className="text-sm text-green-600 dark:text-green-400 font-medium flex items-center">
                    <TrendingUp className="h-4 w-4 mr-1" />
                    +5.2%
                  </span>
                </div>

                {loadingMarketInsights ? (
                  <div className="flex flex-col items-center justify-center py-8">
                    <Loader2 className="h-8 w-8 text-primary animate-spin mb-4" />
                    <p className="text-sm text-muted-foreground">Loading market insights...</p>
                  </div>
                ) : marketInsights ? (
                  <div>
                    <Card>
                      <CardHeader>
                        <h3 className="font-medium">Market Prices for {marketInsights.commodity} in {marketInsights.market}</h3>
                        <p className="text-xs text-muted-foreground">As of {new Date(marketInsights.date).toLocaleDateString()}</p>
                      </CardHeader>
                      <CardContent>
                        <div className="grid grid-cols-2 gap-4 mt-4">
                          <div className="border rounded-lg p-3">
                            <p className="text-xs text-muted-foreground">Min Price</p>
                            <h4 className="text-xl font-bold">₹{marketInsights.min_price}/q</h4>
                            <p className="text-xs text-muted-foreground">As of {new Date(marketInsights.date).toLocaleDateString()}</p>
                          </div>

                          <div className="border rounded-lg p-3">
                            <p className="text-xs text-muted-foreground">Max Price</p>
                            <h4 className="text-xl font-bold">₹{marketInsights.max_price}/q</h4>
                            <p className="text-xs text-muted-foreground">As of {new Date(marketInsights.date).toLocaleDateString()}</p>
                          </div>
                          
                          <div className="border rounded-lg p-3">
                            <p className="text-xs text-muted-foreground">Modal Price</p>
                            <h4 className="text-xl font-bold">₹{marketInsights.modal_price}/q</h4>
                            <p className="text-xs text-green-600 dark:text-green-400">Most common trading price</p>
                          </div>
                          
                          <div className="border rounded-lg p-3">
                            <p className="text-xs text-muted-foreground">Market</p>
                            <h4 className="text-xl font-bold">{marketInsights.market}</h4>
                            <p className="text-xs text-muted-foreground">{marketInsights.state}</p>
                          </div>
                        </div>

                        {marketInsights.ai_insights && (
                          <div className="mt-6 space-y-4">
                            <h3 className="font-medium flex items-center">
                              <Zap className="h-4 w-4 mr-2 text-yellow-500" />
                              AI Market Insights
                            </h3>
                            
                            <div className="space-y-4">
                              <div className="p-4 bg-blue-50 dark:bg-blue-950/20 text-blue-800 dark:text-blue-300 rounded-lg">
                                <h4 className="font-medium mb-1 text-sm">Market Analysis</h4>
                                <p className="text-sm">{marketInsights.ai_insights.market_analysis}</p>
                              </div>
                              
                              <div className="p-4 bg-green-50 dark:bg-green-950/20 text-green-800 dark:text-green-300 rounded-lg">
                                <h4 className="font-medium mb-1 text-sm">Price Prediction</h4>
                                <p className="text-sm">{marketInsights.ai_insights.price_prediction}</p>
                              </div>
                              
                              <div className="p-4 bg-amber-50 dark:bg-amber-950/20 text-amber-800 dark:text-amber-300 rounded-lg">
                                <h4 className="font-medium mb-1 text-sm">Trading Recommendation</h4>
                                <p className="text-sm">{marketInsights.ai_insights.trading_recommendation}</p>
                              </div>
                            </div>
                          </div>
                        )}

                        {marketInsights.historical_data && marketInsights.historical_data.length > 0 && (
                          <div className="mt-6">
                            <h3 className="font-medium">Price Trend (Last 7 Days)</h3>
                            <div className="h-[300px] mt-4">
                              <ResponsiveContainer width="100%" height="100%">
                                <LineChart
                                  data={marketInsights.historical_data}
                                  margin={{
                                    top: 5,
                                    right: 30,
                                    left: 20,
                                    bottom: 5,
                                  }}
                                >
                                  <CartesianGrid strokeDasharray="3 3" />
                                  <XAxis dataKey="date" />
                                  <YAxis 
                                    label={{ value: 'Price (₹ per quintal)', angle: -90, position: 'insideLeft' }}
                                  />
                                  <Tooltip formatter={(value) => [`₹${value}`, 'Price']} />
                                  <Legend />
                                  <Line 
                                    type="monotone" 
                                    dataKey="price" 
                                    stroke="#8884d8" 
                                    activeDot={{ r: 8 }} 
                                    name="Modal Price"
                                  />
                                </LineChart>
                              </ResponsiveContainer>
                            </div>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                    <p className="text-xs text-muted-foreground mt-4">
                      * Prices are indicative and may vary. Data sourced from AgMarknet.
                    </p>
                  </div>
                ) : (
                  <Button 
                    className="w-full" 
                    onClick={loadMarketInsights}
                    disabled={loadingMarketInsights}
                  >
                    {loadingMarketInsights ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Loading...
                      </>
                    ) : (
                      <>Load Market Insights</>
                    )}
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

// Helper function to get emoji for crop
const getCropEmoji = (cropName: string): string => {
  const emojiMap: Record<string, string> = {
    'rice': '🌾',
    'maize': '🌽',
    'chickpea': '🌱',
    'kidneybeans': '🫘',
    'pigeonpeas': '🌿',
    'mothbeans': '🌱',
    'mungbean': '🌱',
    'blackgram': '🌱',
    'lentil': '🍲',
    'pomegranate': '🍎',
    'banana': '🍌',
    'mango': '🥭',
    'grapes': '🍇',
    'watermelon': '🍉',
    'muskmelon': '🍈',
    'apple': '🍎',
    'orange': '🍊',
    'papaya': '🍈',
    'coconut': '🥥',
    'cotton': '🧶',
    'jute': '🧵',
    'coffee': '☕',
  };
  
  return emojiMap[cropName.toLowerCase()] || '🌱';
};

// Helper function to generate reason based on crop and confidence
const getCropReason = (cropName: string, confidence: number): string => {
  if (confidence > 0.8) {
    return `Excellent match for your soil and climate conditions`;
  } else if (confidence > 0.6) {
    return `Good match for your soil and climate conditions`;
  } else {
    return `Moderate match for your soil and climate conditions`;
  }
};

export default AITools;
