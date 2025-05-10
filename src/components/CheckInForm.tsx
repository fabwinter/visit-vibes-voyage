
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Venue, Visit } from '@/types';
import { v4 as uuidv4 } from 'uuid';
import StarRating from './StarRating';

interface CheckInFormProps {
  venue: Venue;
  isOpen: boolean;
  onClose: () => void;
  onCheckIn: (visit: Visit) => void;
}

const CheckInForm: React.FC<CheckInFormProps> = ({
  venue,
  isOpen,
  onClose,
  onCheckIn,
}) => {
  const [note, setNote] = useState("");
  const [dishName, setDishName] = useState("");
  const [photo, setPhoto] = useState("");
  const [ratings, setRatings] = useState({
    food: 0,
    service: 0,
    ambiance: 0,
    value: 0,
    overall: 0,
  });

  const handleRatingChange = (type: keyof typeof ratings) => (value: number) => {
    setRatings(prev => {
      const newRatings = { ...prev, [type]: value };
      // Calculate the overall rating as an average of the other ratings
      const { overall, ...rest } = newRatings;
      const values = Object.values(rest);
      const validRatings = values.filter(val => val > 0);
      const newOverall = validRatings.length > 0 
        ? validRatings.reduce((a, b) => a + b, 0) / validRatings.length
        : 0;
      
      return { 
        ...newRatings, 
        overall: parseFloat(newOverall.toFixed(1)) 
      };
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (ratings.overall === 0) {
      alert("Please add at least one rating");
      return;
    }

    const visit: Visit = {
      id: uuidv4(),
      venueId: venue.id,
      venueName: venue.name,
      address: venue.address,
      timestamp: new Date().toISOString(),
      note,
      dishes: dishName ? [{ name: dishName, photo, rating: ratings.food }] : [],
      rating: ratings,
    };

    onCheckIn(visit);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold">Check in at {venue.name}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-5 pt-3">
          {/* Ratings Section */}
          <div className="space-y-4 bg-slate-50 p-4 rounded-lg">
            <h3 className="font-medium text-base text-slate-700">Rate your experience</h3>
            
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <Label className="font-medium">Food Quality</Label>
                <StarRating 
                  rating={ratings.food} 
                  editable 
                  onChange={handleRatingChange('food')} 
                  size="md"
                  showValue={false}
                />
              </div>
              
              <div className="flex justify-between items-center">
                <Label className="font-medium">Service</Label>
                <StarRating 
                  rating={ratings.service} 
                  editable 
                  onChange={handleRatingChange('service')} 
                  size="md"
                  showValue={false}
                />
              </div>
              
              <div className="flex justify-between items-center">
                <Label className="font-medium">Ambiance</Label>
                <StarRating 
                  rating={ratings.ambiance} 
                  editable 
                  onChange={handleRatingChange('ambiance')} 
                  size="md"
                  showValue={false}
                />
              </div>
              
              <div className="flex justify-between items-center">
                <Label className="font-medium">Value for Money</Label>
                <StarRating 
                  rating={ratings.value} 
                  editable 
                  onChange={handleRatingChange('value')} 
                  size="md"
                  showValue={false}
                />
              </div>
              
              <div className="flex justify-between items-center pt-2 border-t border-slate-200">
                <Label className="font-bold">Overall Rating</Label>
                <div className="flex items-center gap-2">
                  <StarRating 
                    rating={ratings.overall} 
                    size="md" 
                  />
                </div>
              </div>
            </div>
          </div>
          
          {/* What did you have section */}
          <div className="space-y-2">
            <Label htmlFor="dish">What did you have?</Label>
            <Input
              id="dish"
              placeholder="E.g., Chicken Parmesan, Matcha Latte"
              value={dishName}
              onChange={(e) => setDishName(e.target.value)}
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="note">Notes (optional)</Label>
            <Textarea
              id="note"
              placeholder="Add any notes about your visit..."
              value={note}
              onChange={(e) => setNote(e.target.value)}
              className="min-h-[100px]"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="photo">Photo URL (optional)</Label>
            <Input
              id="photo"
              placeholder="https://example.com/food-photo.jpg"
              value={photo}
              onChange={(e) => setPhoto(e.target.value)}
            />
          </div>

          <div className="flex justify-end gap-2 pt-3">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit">Check In</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default CheckInForm;
