
import { useState } from 'react';
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
  const [token, setToken] = useState(MAPBOX_TOKEN || '');

  const handleSave = () => {
    if (!token || token.trim() === '') {
      toast.error("Please enter a valid Mapbox token");
      return;
    }
    
    // Save token to localStorage for persistence
    localStorage.setItem('mapbox_token', token);
    
    // Notify parent component
    onTokenSaved(token);
    
    toast.success("Mapbox token saved successfully");
    onClose();
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
        </div>
        
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button onClick={handleSave}>Save Token</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default MapboxTokenInput;
