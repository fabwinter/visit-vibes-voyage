
import { useState, useEffect } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from './ui/dialog';
import { MAPBOX_TOKEN } from '@/services/places/config';
import { toast } from 'sonner';

interface MapboxTokenInputProps {
  onTokenSaved: (token: string) => void;
  isOpen: boolean;
  onClose: () => void;
}

const MapboxTokenInput = ({ onTokenSaved, isOpen, onClose }: MapboxTokenInputProps) => {
  const [token, setToken] = useState(localStorage.getItem('mapbox_token') || MAPBOX_TOKEN || '');
  const [loading, setLoading] = useState(false);

  // Check existing tokens on mount
  useEffect(() => {
    // Try to load token from localStorage first
    const storedToken = localStorage.getItem('mapbox_token');
    if (storedToken) {
      setToken(storedToken);
    }
  }, []);

  const handleSave = async () => {
    if (!token || token.trim() === '') {
      toast.error("Please enter a valid Mapbox token");
      return;
    }
    
    setLoading(true);
    
    try {
      // Simple validation - test the token with a basic Mapbox API call
      const response = await fetch(
        `https://api.mapbox.com/geocoding/v5/mapbox.places/sydney.json?access_token=${token}`,
        { method: 'GET' }
      );
      
      if (!response.ok) {
        throw new Error('Invalid Mapbox token');
      }
      
      // Save token to localStorage for persistence
      localStorage.setItem('mapbox_token', token);
      
      // Notify parent component
      onTokenSaved(token);
      
      toast.success("Mapbox token saved successfully");
      onClose();
    } catch (error) {
      console.error('Error validating Mapbox token:', error);
      toast.error("Could not validate your Mapbox token. Please check it and try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Mapbox API Token</DialogTitle>
          <DialogDescription>
            Enter your Mapbox access token to enable maps and location features.
            You can get one for free at <a href="https://www.mapbox.com/signup" target="_blank" rel="noopener noreferrer" className="underline text-blue-600">mapbox.com</a>.
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4 py-4">
          <Input
            value={token}
            onChange={(e) => setToken(e.target.value)}
            placeholder="pk.eyJ1Ijoi..."
            className="w-full"
          />
          <p className="text-xs text-gray-500">
            This token will be stored in your browser and used for all map-related features.
          </p>
          <div className="bg-yellow-50 p-3 rounded-md text-xs text-yellow-800">
            <p className="font-medium">Important:</p>
            <ul className="list-disc pl-4 mt-1">
              <li>Create a free Mapbox account at mapbox.com</li>
              <li>In your Mapbox account dashboard, create a new token with the following scopes:</li>
              <ul className="list-disc pl-4 mt-1">
                <li>styles:read</li>
                <li>fonts:read</li>
                <li>datasets:read</li>
                <li>vision:read</li>
                <li>geocoding</li>
              </ul>
              <li>Copy the token and paste it here</li>
              <li>Make sure your token starts with "pk." (public key)</li>
            </ul>
          </div>
        </div>
        
        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={loading}>Cancel</Button>
          <Button onClick={handleSave} disabled={loading}>
            {loading ? "Validating..." : "Save Token"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default MapboxTokenInput;
