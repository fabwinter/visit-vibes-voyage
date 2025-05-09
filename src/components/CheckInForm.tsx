
import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogTitle, DialogHeader, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import StarRating from './StarRating';
import { Venue, Visit } from '@/types';
import { v4 as uuidv4 } from 'uuid';
import { toast } from "sonner";
import { useAuth } from '@/hooks/useAuth';

interface CheckInFormProps {
  venue: Venue;
  isOpen: boolean;
  onClose: () => void;
  onCheckIn: (checkInData: Visit) => void;
  initialVisit?: Visit; // Add initialVisit as optional prop
}

const CheckInForm = ({ venue, isOpen, onClose, onCheckIn, initialVisit }: CheckInFormProps) => {
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
  
  // Reset form when venue changes or populate with initial values if editing
  useEffect(() => {
    if (isOpen) {
      if (initialVisit) {
        // Populate form with initial values if editing
        setRating(initialVisit.rating);
        setNotes(initialVisit.notes || '');
        setDish(initialVisit.dishes.length > 0 ? initialVisit.dishes[0].name : '');
      } else {
        // Reset form when creating new visit
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
    }
  }, [venue.id, isOpen, initialVisit]);

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
    const checkIn: Visit = {
      id: initialVisit ? initialVisit.id : uuidv4(),
      venueId: venue.id,
      timestamp: initialVisit ? initialVisit.timestamp : new Date().toISOString(),
      dishes: [{
        id: uuidv4(),
        name: dish || 'Unspecified dish',
        type: 'dish',
        rating: rating.food,
        tags: [],
        photos: []
      }],
      rating,
      photos: initialVisit?.photos || [],
      notes: notes,
      tags: initialVisit?.tags || [],
      wouldVisitAgain: rating.overall >= 3.5 // Automatically set based on rating
    };
    
    onCheckIn(checkIn);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>{initialVisit ? 'Edit check-in for' : 'Check-in to'} {venue.name}</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4 pt-2">
          {/* Overall Rating */}
          <div className="space-y-1">
            <Label htmlFor="overall-rating" className="text-sm font-medium">
              Overall Rating <span className="text-red-500">*</span>
            </Label>
            <StarRating 
              value={rating.overall}
              onChange={(value) => setRating({...rating, overall: value})}
              required={true}
            />
          </div>
          
          {/* Food Rating */}
          <div className="space-y-1">
            <Label htmlFor="food-rating" className="text-sm font-medium">
              Food Rating
            </Label>
            <StarRating 
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
              {initialVisit ? 'Update' : 'Check-in'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default CheckInForm;
