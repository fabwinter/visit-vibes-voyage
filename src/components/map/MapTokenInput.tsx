
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { toast } from 'sonner';

interface MapTokenInputProps {
  onTokenSaved: (token: string) => void;
  isOpen: boolean;
  onClose: () => void;
}

const MapTokenInput = ({ onTokenSaved, isOpen, onClose }: MapTokenInputProps) => {
  const [token, setToken] = useState('');

  const handleSave = () => {
    if (!token || token.trim() === '') {
      toast.error("Please enter a valid token");
      return;
    }
    
    // Save token to localStorage for persistence
    localStorage.setItem('google_maps_token', token);
    
    // Notify parent component
    onTokenSaved(token);
    
    toast.success("Maps token saved successfully");
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Google Maps API Token</DialogTitle>
          <DialogDescription>
            Enter your Google Maps access token to enable maps and location features.
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4 py-4">
          <Input
            value={token}
            onChange={(e) => setToken(e.target.value)}
            placeholder="Enter your Google Maps API key"
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

export default MapTokenInput;
