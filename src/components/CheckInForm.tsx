
import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogTitle, DialogHeader, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import StarRating from './StarRating';
import { Venue } from '@/types';
import { v4 as uuidv4 } from 'uuid';
import { toast } from "sonner";
import { useAuth } from '@/hooks/useAuth';

interface CheckInFormProps {
  venue: Venue;
  isOpen: boolean;
  onClose: () => void;
  onCheckIn: (checkInData: any) => void;
}

const CheckInForm = ({ venue, isOpen, onClose, onCheckIn }: CheckInFormProps) => {
  const { user } = useAuth();
  
  // Define the rating state
  const [rating, setRating] = useState({
    overall: 0,
    food: 0,
    service: 0,
    ambiance: 0,
    value: 0
  });
  
  const [notes, setNotes] = useState('');
  const [dish, setDish] = useState('');
  
  // Reset form when venue changes
  useEffect(() => {
    if (isOpen) {
      setRating({
        overall: 0,
        food: 0,
        service: 0,
        ambiance: 0,
        value: 0
      });
      setNotes('');
      setDish('');
    }
  }, [venue.id, isOpen]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (rating.overall === 0) {
      toast.error('Please provide an overall rating');
      return;
    }
    
    // If user is not signed in, show a warning
    if (!user) {
      toast.warning('You are not signed in', { 
        description: 'Your check-in will be stored locally but not synced to your account' 
      });
    }
    
    // Create the check-in object
    const checkIn = {
      id: uuidv4(),
      venueId: venue.id,
      venueName: venue.name,
      venueAddress: venue.address,
      venueCoordinates: venue.coordinates,
      venueCategory: venue.category,
      venuePhotos: venue.photos,
      userId: user?.id, // Only add userId if user is signed in
      timestamp: new Date().toISOString(),
      rating,
      notes,
      dish: dish ? { name: dish } : undefined
    };
    
    onCheckIn(checkIn);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Check-in to {venue.name}</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4 pt-2">
          {/* Overall Rating */}
          <div className="space-y-1">
            <Label htmlFor="overall-rating" className="text-sm font-medium">
              Overall Rating <span className="text-red-500">*</span>
            </Label>
            <StarRating 
              id="overall-rating"
              value={rating.overall}
              onChange={(value) => setRating({...rating, overall: value})}
              required
            />
          </div>
          
          {/* Food Rating */}
          <div className="space-y-1">
            <Label htmlFor="food-rating" className="text-sm font-medium">
              Food Rating
            </Label>
            <StarRating 
              id="food-rating"
              value={rating.food}
              onChange={(value) => setRating({...rating, food: value})}
            />
          </div>
          
          {/* Service Rating */}
          <div className="space-y-1">
            <Label htmlFor="service-rating" className="text-sm font-medium">
              Service Rating
            </Label>
            <StarRating 
              id="service-rating"
              value={rating.service}
              onChange={(value) => setRating({...rating, service: value})}
            />
          </div>
          
          {/* Ambiance Rating */}
          <div className="space-y-1">
            <Label htmlFor="ambiance-rating" className="text-sm font-medium">
              Ambiance Rating
            </Label>
            <StarRating 
              id="ambiance-rating"
              value={rating.ambiance}
              onChange={(value) => setRating({...rating, ambiance: value})}
            />
          </div>
          
          {/* Value Rating */}
          <div className="space-y-1">
            <Label htmlFor="value-rating" className="text-sm font-medium">
              Value for Money
            </Label>
            <StarRating 
              id="value-rating"
              value={rating.value}
              onChange={(value) => setRating({...rating, value: value})}
            />
          </div>
          
          {/* Dish */}
          <div className="space-y-1">
            <Label htmlFor="dish" className="text-sm font-medium">
              What did you have?
            </Label>
            <Input
              id="dish"
              placeholder="Ex: Pasta Carbonara, Flat White, etc."
              value={dish}
              onChange={(e) => setDish(e.target.value)}
            />
          </div>
          
          {/* Notes */}
          <div className="space-y-1">
            <Label htmlFor="notes" className="text-sm font-medium">
              Notes
            </Label>
            <Textarea
              id="notes"
              placeholder="Any thoughts about your visit?"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={3}
            />
          </div>
          
          <DialogFooter className="flex flex-row justify-end gap-2 pt-2">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit">
              Check-in
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default CheckInForm;
