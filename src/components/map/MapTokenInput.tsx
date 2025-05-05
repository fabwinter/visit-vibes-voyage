
import { useState } from 'react';
import { Button } from '@/components/ui/button';

interface MapTokenInputProps {
  token: string;
  onTokenChange: (token: string) => void;
  onTokenSubmit: () => void;
}

const MapTokenInput = ({ token, onTokenChange, onTokenSubmit }: MapTokenInputProps) => {
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onTokenSubmit();
  };

  return (
    <div className="absolute inset-0 flex items-center justify-center bg-gray-100 z-10 p-4">
      <form onSubmit={handleSubmit} className="bg-white p-4 rounded-lg shadow-md w-full max-w-md">
        <h3 className="text-lg font-semibold mb-3">Mapbox API Token Required</h3>
        <p className="text-sm text-gray-600 mb-4">
          Please enter your Mapbox public token to enable the interactive map.
          You can get one from <a href="https://mapbox.com/" target="_blank" rel="noopener noreferrer" className="text-visitvibe-primary underline">mapbox.com</a>
        </p>
        <input
          type="text"
          value={token}
          onChange={(e) => onTokenChange(e.target.value)}
          className="w-full p-2 border rounded mb-4"
          placeholder="Enter your Mapbox public token"
        />
        <Button 
          type="submit"
          className="bg-visitvibe-primary text-white px-4 py-2 rounded hover:bg-visitvibe-primary/90"
        >
          Apply Token
        </Button>
      </form>
    </div>
  );
};

export default MapTokenInput;
