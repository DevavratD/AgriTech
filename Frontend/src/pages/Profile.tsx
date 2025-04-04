
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { User, Settings, Map, Shield, Bell, Languages, MapPin, Thermometer } from "lucide-react";
import { toast } from "@/components/ui/use-toast";

const Profile = () => {
  const [notifications, setNotifications] = useState(true);
  
  const saveSettings = () => {
    toast({
      title: "Settings saved",
      description: "Your profile settings have been updated successfully.",
    });
  };

  return (
    <div className="space-y-6 animate-fade-in max-w-2xl mx-auto">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">My Profile</h1>
      </div>
      
      <Tabs defaultValue="profile" className="w-full">
        <TabsList className="grid grid-cols-3 mb-4">
          <TabsTrigger value="profile">Profile</TabsTrigger>
          <TabsTrigger value="farm">Farm Details</TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
        </TabsList>
        
        {/* Profile Tab */}
        <TabsContent value="profile">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center text-lg">
                <User className="mr-2 h-5 w-5" />
                Personal Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex flex-col items-center pb-4 mb-4 border-b">
                <div className="bg-primary text-primary-foreground w-20 h-20 rounded-full flex items-center justify-center text-3xl font-medium mb-3">
                  R
                </div>
                <h3 className="font-medium text-xl">Ramesh Kumar</h3>
                <p className="text-sm text-muted-foreground flex items-center">
                  <MapPin className="h-3 w-3 mr-1" />
                  Madhya Pradesh, India
                </p>
              </div>
              
              <div className="grid gap-4">
                <div className="grid sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Full Name</Label>
                    <Input id="name" defaultValue="Ramesh Kumar" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="phone">Mobile Number</Label>
                    <Input id="phone" defaultValue="9876543210" type="tel" />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="email">Email Address</Label>
                  <Input id="email" defaultValue="ramesh@example.com" type="email" />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="address">Address</Label>
                  <Textarea id="address" defaultValue="Village Satpura, District Hoshangabad, Madhya Pradesh" />
                </div>
              </div>
            </CardContent>
            <CardFooter className="border-t pt-4">
              <Button onClick={saveSettings}>Save Changes</Button>
            </CardFooter>
          </Card>
        </TabsContent>
        
        {/* Farm Details Tab */}
        <TabsContent value="farm">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center text-lg">
                <Map className="mr-2 h-5 w-5" />
                Farm Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4">
                <div className="grid sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="farm-name">Farm Name</Label>
                    <Input id="farm-name" defaultValue="Satpura Organic Farm" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="farm-size">Farm Size (Acres)</Label>
                    <Input id="farm-size" defaultValue="12.5" type="number" step="0.1" />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="main-crop">Primary Crops</Label>
                  <Select defaultValue="wheat">
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="wheat">Wheat</SelectItem>
                      <SelectItem value="rice">Rice</SelectItem>
                      <SelectItem value="cotton">Cotton</SelectItem>
                      <SelectItem value="soybeans">Soybeans</SelectItem>
                      <SelectItem value="vegetables">Mixed Vegetables</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="soil-type">Soil Type</Label>
                  <Select defaultValue="clay-loam">
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="clay-loam">Clay Loam</SelectItem>
                      <SelectItem value="sandy-loam">Sandy Loam</SelectItem>
                      <SelectItem value="silt-loam">Silt Loam</SelectItem>
                      <SelectItem value="clay">Clay</SelectItem>
                      <SelectItem value="sandy">Sandy</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label>Farming Practices</Label>
                  <div className="flex flex-wrap gap-2">
                    <Badge variant="outline" className="bg-muted/50">Organic</Badge>
                    <Badge variant="outline" className="bg-muted/50">Drip Irrigation</Badge>
                    <Badge variant="outline" className="bg-muted/50">Crop Rotation</Badge>
                    <Badge variant="outline" className="bg-muted/50">+ Add New</Badge>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label>Sensors Installed</Label>
                  <div className="bg-muted/30 p-3 rounded-lg space-y-2">
                    <div className="flex justify-between items-center">
                      <div className="flex items-center">
                        <div className="mr-3 p-1.5 bg-blue-100 dark:bg-blue-900/30 rounded-md text-blue-600 dark:text-blue-400">
                          <Thermometer className="h-5 w-5" />
                        </div>
                        <div>
                          <h4 className="text-sm font-medium">Soil Moisture Sensor</h4>
                          <p className="text-xs text-muted-foreground">North Field (3 units)</p>
                        </div>
                      </div>
                      <Button variant="outline" size="sm">Calibrate</Button>
                    </div>
                    
                    <div className="flex justify-between items-center">
                      <div className="flex items-center">
                        <div className="mr-3 p-1.5 bg-amber-100 dark:bg-amber-900/30 rounded-md text-amber-600 dark:text-amber-400">
                          <Thermometer className="h-5 w-5" />
                        </div>
                        <div>
                          <h4 className="text-sm font-medium">Temperature Sensor</h4>
                          <p className="text-xs text-muted-foreground">All Fields (2 units)</p>
                        </div>
                      </div>
                      <Button variant="outline" size="sm">Calibrate</Button>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
            <CardFooter className="border-t pt-4">
              <Button onClick={saveSettings}>Save Changes</Button>
            </CardFooter>
          </Card>
        </TabsContent>
        
        {/* Settings Tab */}
        <TabsContent value="settings">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center text-lg">
                <Settings className="mr-2 h-5 w-5" />
                Application Settings
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label className="text-base">Notifications</Label>
                    <p className="text-sm text-muted-foreground">
                      Receive alerts about weather and crop conditions
                    </p>
                  </div>
                  <Switch 
                    checked={notifications}
                    onCheckedChange={setNotifications}
                  />
                </div>
                
                <div className="border-t pt-4">
                  <div className="space-y-2">
                    <Label>Language</Label>
                    <Select defaultValue="en">
                      <SelectTrigger className="flex items-center gap-2">
                        <Languages className="h-4 w-4 opacity-70" />
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="en">English</SelectItem>
                        <SelectItem value="hi">Hindi</SelectItem>
                        <SelectItem value="mr">Marathi</SelectItem>
                        <SelectItem value="gu">Gujarati</SelectItem>
                        <SelectItem value="pa">Punjabi</SelectItem>
                      </SelectContent>
                    </Select>
                    <p className="text-xs text-muted-foreground mt-1">
                      Chatbot and UI language preference
                    </p>
                  </div>
                </div>
                
                <div className="border-t pt-4 space-y-4">
                  <h3 className="font-medium flex items-center">
                    <Shield className="mr-2 h-4 w-4" />
                    Privacy Settings
                  </h3>
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm">Data Collection</p>
                      <p className="text-xs text-muted-foreground">
                        Allow app to collect anonymous usage data
                      </p>
                    </div>
                    <Switch defaultChecked />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm">Location Services</p>
                      <p className="text-xs text-muted-foreground">
                        Enable precise weather forecasts
                      </p>
                    </div>
                    <Switch defaultChecked />
                  </div>
                </div>
                
                <div className="border-t pt-4">
                  <h3 className="font-medium flex items-center mb-3">
                    <Bell className="mr-2 h-4 w-4" />
                    Alert Preferences
                  </h3>
                  
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <p className="text-sm">Weather Alerts</p>
                      <Switch defaultChecked />
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <p className="text-sm">Moisture Alerts</p>
                      <Switch defaultChecked />
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <p className="text-sm">Disease Detection</p>
                      <Switch defaultChecked />
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <p className="text-sm">Market Price Updates</p>
                      <Switch defaultChecked />
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
            <CardFooter className="border-t pt-4">
              <Button onClick={saveSettings}>Save Settings</Button>
            </CardFooter>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Profile;
