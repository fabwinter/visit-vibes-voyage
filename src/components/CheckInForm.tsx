
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { format } from 'date-fns';
import { CalendarIcon, Clock, Plus, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import { Visit, Venue, DishRating, VisitRating } from '@/types';
import { v4 as uuidv4 } from 'uuid';

interface CheckInFormProps {
  venue: Venue;
  isOpen: boolean;
  onClose: () => void;
  onCheckIn: (visit: Visit) => void;
}

const CheckInForm = ({ venue, isOpen, onClose, onCheckIn }: CheckInFormProps) => {
  const navigate = useNavigate();
  const [date, setDate] = useState<Date>(new Date());
  const [time, setTime] = useState<string>(format(new Date(), 'HH:mm'));
  const [occasion, setOccasion] = useState<string>('');
  const [partySize, setPartySize] = useState<number>(1);
  const [notes, setNotes] = useState<string>('');
  const [dishes, setDishes] = useState<DishRating[]>([
    { id: uuidv4(), name: '', rating: 0, tags: [] }
  ]);
  const [photos, setPhotos] = useState<string[]>([]);
  const [ratings, setRatings] = useState<VisitRating>({
    food: 0,
    ambiance: 0,
    service: 0,
    value: 0,
    overall: 0
  });
  
  // Handle photo upload
  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const newPhotos = [...photos];
      
      Array.from(e.target.files).forEach(file => {
        const reader = new FileReader();
        reader.onloadend = () => {
          if (typeof reader.result === 'string') {
            newPhotos.push(reader.result);
            setPhotos([...newPhotos]);
          }
        };
        reader.readAsDataURL(file);
      });
    }
  };
  
  // Remove a photo
  const removePhoto = (index: number) => {
    const newPhotos = [...photos];
    newPhotos.splice(index, 1);
    setPhotos(newPhotos);
  };
  
  // Add a new dish
  const addDish = () => {
    setDishes([...dishes, { id: uuidv4(), name: '', rating: 0, tags: [] }]);
  };
  
  // Update dish information
  const updateDish = (index: number, field: keyof DishRating, value: any) => {
    const newDishes = [...dishes];
    newDishes[index] = { ...newDishes[index], [field]: value };
    setDishes(newDishes);
  };
  
  // Remove a dish
  const removeDish = (index: number) => {
    if (dishes.length > 1) {
      const newDishes = [...dishes];
      newDishes.splice(index, 1);
      setDishes(newDishes);
    }
  };
  
  // Update rating
  const updateRating = (field: keyof VisitRating, value: number) => {
    const newRatings = { ...ratings, [field]: value };
    
    // Calculate overall rating as average of other ratings
    const { overall, ...otherRatings } = newRatings;
    const ratingValues = Object.values(otherRatings) as number[];
    const validRatings = ratingValues.filter(r => r > 0);
    
    if (validRatings.length > 0) {
      const average = validRatings.reduce((sum, val) => sum + val, 0) / validRatings.length;
      newRatings.overall = Math.round(average * 10) / 10; // Round to 1 decimal place
    } else {
      newRatings.overall = 0;
    }
    
    setRatings(newRatings);
  };
  
  // Submit check-in
  const handleSubmit = () => {
    // Validate required fields
    if (dishes.some(dish => !dish.name)) {
      toast.error("Please enter a name for each dish");
      return;
    }
    
    // Create timestamp from date and time
    const visitDate = new Date(date);
    const [hours, minutes] = time.split(':').map(Number);
    visitDate.setHours(hours, minutes);
    
    // Create the visit object
    const visit: Visit = {
      id: uuidv4(),
      venueId: venue.id,
      timestamp: visitDate.toISOString(),
      dishes: dishes.filter(dish => dish.name.trim() !== ''),
      rating: ratings,
      tags: occasion ? [occasion] : [],
      notes: notes,
      photos: photos
    };
    
    // Pass the visit to parent component
    onCheckIn(visit);
    
    // Navigate to visits page
    toast.success("Check-in recorded!");
    navigate('/visits');
  };
  
  // Rating options
  const ratingOptions = [
    { value: 1, label: '1' },
    { value: 2, label: '2' },
    { value: 3, label: '3' },
    { value: 4, label: '4' },
    { value: 5, label: '5' }
  ];
  
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Check In at {venue.name}</DialogTitle>
        </DialogHeader>
        
        <div className="grid gap-4 py-4">
          {/* Date and Time */}
          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col space-y-1.5">
              <Label htmlFor="date">Date</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    id="date"
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal",
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {format(date, "MMM d, yyyy")}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={date}
                    onSelect={(date) => date && setDate(date)}
                    className={cn("p-3 pointer-events-auto")}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>
            
            <div className="flex flex-col space-y-1.5">
              <Label htmlFor="time">Time</Label>
              <div className="flex">
                <Button
                  variant="outline"
                  className="w-full justify-start pl-3"
                >
                  <Clock className="mr-2 h-4 w-4" />
                  <input
                    type="time"
                    value={time}
                    onChange={(e) => setTime(e.target.value)}
                    className="focus:outline-none bg-transparent w-full"
                  />
                </Button>
              </div>
            </div>
          </div>
          
          {/* Party Size and Occasion */}
          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col space-y-1.5">
              <Label htmlFor="partySize">Party Size</Label>
              <Input
                id="partySize"
                type="number"
                min="1"
                value={partySize}
                onChange={(e) => setPartySize(parseInt(e.target.value) || 1)}
              />
            </div>
            
            <div className="flex flex-col space-y-1.5">
              <Label htmlFor="occasion">Occasion (optional)</Label>
              <Input
                id="occasion"
                placeholder="Business, Date, Family..."
                value={occasion}
                onChange={(e) => setOccasion(e.target.value)}
              />
            </div>
          </div>
          
          {/* Dishes */}
          <div className="flex flex-col space-y-1.5">
            <Label>What did you have?</Label>
            {dishes.map((dish, index) => (
              <div key={dish.id} className="flex flex-col gap-2 p-3 border rounded-md mt-2">
                <div className="flex justify-between">
                  <Label htmlFor={`dish-${index}`}>Dish {index + 1}</Label>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={() => removeDish(index)}
                    className="h-6 w-6 p-0"
                    disabled={dishes.length <= 1}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
                
                <Input
                  id={`dish-${index}`}
                  placeholder="Dish name"
                  value={dish.name}
                  onChange={(e) => updateDish(index, 'name', e.target.value)}
                />
                
                <div className="flex flex-col space-y-1.5">
                  <Label htmlFor={`dish-rating-${index}`}>Rating (1-5)</Label>
                  <div className="flex gap-2">
                    {ratingOptions.map(option => (
                      <Button
                        key={option.value}
                        variant={dish.rating === option.value ? "default" : "outline"}
                        size="sm"
                        onClick={() => updateDish(index, 'rating', option.value)}
                        className="flex-1"
                      >
                        {option.label}
                      </Button>
                    ))}
                  </div>
                </div>
              </div>
            ))}
            
            <Button 
              variant="outline" 
              className="mt-2" 
              onClick={addDish}
              type="button"
            >
              <Plus className="mr-2 h-4 w-4" />
              Add Another Dish
            </Button>
          </div>
          
          {/* Ratings */}
          <div className="flex flex-col space-y-3">
            <Label>How was it?</Label>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="flex flex-col space-y-1.5">
                <Label htmlFor="food-rating">Food Quality</Label>
                <div className="flex gap-1">
                  {ratingOptions.map(option => (
                    <Button
                      key={option.value}
                      variant={ratings.food === option.value ? "default" : "outline"}
                      size="sm"
                      onClick={() => updateRating('food', option.value)}
                      className="flex-1"
                    >
                      {option.label}
                    </Button>
                  ))}
                </div>
              </div>
              
              <div className="flex flex-col space-y-1.5">
                <Label htmlFor="service-rating">Service</Label>
                <div className="flex gap-1">
                  {ratingOptions.map(option => (
                    <Button
                      key={option.value}
                      variant={ratings.service === option.value ? "default" : "outline"}
                      size="sm"
                      onClick={() => updateRating('service', option.value)}
                      className="flex-1"
                    >
                      {option.label}
                    </Button>
                  ))}
                </div>
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="flex flex-col space-y-1.5">
                <Label htmlFor="ambiance-rating">Ambiance</Label>
                <div className="flex gap-1">
                  {ratingOptions.map(option => (
                    <Button
                      key={option.value}
                      variant={ratings.ambiance === option.value ? "default" : "outline"}
                      size="sm"
                      onClick={() => updateRating('ambiance', option.value)}
                      className="flex-1"
                    >
                      {option.label}
                    </Button>
                  ))}
                </div>
              </div>
              
              <div className="flex flex-col space-y-1.5">
                <Label htmlFor="value-rating">Value</Label>
                <div className="flex gap-1">
                  {ratingOptions.map(option => (
                    <Button
                      key={option.value}
                      variant={ratings.value === option.value ? "default" : "outline"}
                      size="sm"
                      onClick={() => updateRating('value', option.value)}
                      className="flex-1"
                    >
                      {option.label}
                    </Button>
                  ))}
                </div>
              </div>
            </div>
            
            <div className="flex flex-col space-y-1.5 pt-2">
              <Label>Overall Rating: {ratings.overall}</Label>
            </div>
          </div>
          
          {/* Photo Upload */}
          <div className="flex flex-col space-y-1.5">
            <Label>Add Photos</Label>
            <Input
              type="file"
              accept="image/*"
              multiple
              onChange={handlePhotoUpload}
              className="flex h-10 w-full rounded-md border border-input px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium"
            />
            
            {photos.length > 0 && (
              <div className="grid grid-cols-3 gap-2 mt-2">
                {photos.map((photo, index) => (
                  <div key={index} className="relative">
                    <img 
                      src={photo} 
                      alt={`Visit photo ${index + 1}`}
                      className="w-full h-20 object-cover rounded" 
                    />
                    <Button 
                      variant="destructive"
                      size="sm"
                      onClick={() => removePhoto(index)}
                      className="absolute top-1 right-1 h-6 w-6 p-0"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </div>
          
          {/* Notes */}
          <div className="flex flex-col space-y-1.5">
            <Label htmlFor="notes">Notes (optional)</Label>
            <Textarea
              id="notes"
              placeholder="Any additional comments about your visit..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={3}
            />
          </div>
        </div>
        
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button onClick={handleSubmit}>Check In</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default CheckInForm;
