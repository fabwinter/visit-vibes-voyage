
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { MapIcon, InfoIcon, Check } from 'lucide-react';
import { MAPBOX_TOKEN } from '@/services/places/config';
import { useNavigate } from 'react-router-dom';

const MapSettingsView = () => {
  const [token, setToken] = useState(localStorage.getItem('mapbox_token') || MAPBOX_TOKEN || '');
  const [isSaving, setIsSaving] = useState(false);
  const [isValid, setIsValid] = useState<boolean | null>(null);
  const navigate = useNavigate();

  // Check if token is valid on mount
  useEffect(() => {
    if (token) {
      validateToken(token);
    }
  }, []);

  // Validate token by making a simple API request
  const validateToken = async (tokenToValidate: string) => {
    try {
      // Make a simple request to Mapbox API to validate the token
      const response = await fetch(
        `https://api.mapbox.com/geocoding/v5/mapbox.places/San%20Francisco.json?access_token=${tokenToValidate}`
      );
      
      if (response.ok) {
        setIsValid(true);
        return true;
      } else {
        const data = await response.json();
        console.error("Token validation failed:", data);
        setIsValid(false);
        return false;
      }
    } catch (error) {
      console.error("Error validating token:", error);
      setIsValid(false);
      return false;
    }
  };

  // Save token
  const saveToken = async () => {
    if (!token.trim()) {
      toast.error("Please enter a Mapbox token");
      return;
    }
    
    setIsSaving(true);
    
    try {
      // Validate token before saving
      const valid = await validateToken(token);
      
      if (valid) {
        // Save token to localStorage
        localStorage.setItem('mapbox_token', token);
        toast.success("Mapbox token saved successfully");
        
        // Redirect to map view
        navigate('/');
      } else {
        toast.error("Invalid Mapbox token. Please check and try again.");
      }
    } catch (error) {
      toast.error("Failed to save token");
      console.error("Save token error:", error);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="container max-w-md mx-auto px-4 py-8">
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2 mb-2">
            <MapIcon className="h-6 w-6 text-visitvibe-primary" />
            <CardTitle>Mapbox API Settings</CardTitle>
          </div>
          <CardDescription>
            Configure your Mapbox API token to enable maps and location features.
          </CardDescription>
        </CardHeader>
        
        <CardContent className="space-y-4">
          <div className="bg-amber-50 border border-amber-200 rounded-md p-3">
            <div className="flex gap-2">
              <InfoIcon className="h-5 w-5 text-amber-500 shrink-0 mt-0.5" />
              <div className="text-sm text-amber-800">
                <p className="font-medium">Get a Free Mapbox Token</p>
                <p className="mt-1">
                  You need a Mapbox token to use the map features. You can get a free token by 
                  <a 
                    href="https://account.mapbox.com/auth/signup/" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:underline ml-1"
                  >
                    signing up for Mapbox
                  </a>.
                </p>
              </div>
            </div>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="mapbox-token">Mapbox Access Token</Label>
            <Input
              id="mapbox-token"
              placeholder="pk.eyJ1Ijoi..."
              value={token}
              onChange={(e) => setToken(e.target.value)}
            />
            
            {isValid !== null && (
              <div className={`text-sm ${isValid ? 'text-green-600' : 'text-red-600'} mt-1 flex gap-1 items-center`}>
                {isValid ? (
                  <>
                    <Check className="h-4 w-4" />
                    <span>Token is valid</span>
                  </>
                ) : (
                  <span>Token is invalid or expired</span>
                )}
              </div>
            )}
            
            <p className="text-xs text-gray-500 mt-1">
              This token will be stored in your browser and used for all map-related features.
            </p>
          </div>
        </CardContent>
        
        <CardFooter className="flex justify-end gap-3">
          <Button variant="outline" onClick={() => navigate('/')}>
            Cancel
          </Button>
          <Button onClick={saveToken} disabled={isSaving}>
            {isSaving ? 'Saving...' : 'Save Token'}
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
};

export default MapSettingsView;
