
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { format } from 'date-fns';
import { CalendarIcon, Clock, Plus, X, Share2, DollarSign, Camera } from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from "sonner";
import { Visit, Venue, DishRating, VisitRating } from '@/types';
import { v4 as uuidv4 } from 'uuid';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

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
    { id: uuidv4(), name: '', rating: 0, tags: [], type: 'dish', price: 0, quantity: 1, photos: [] }
  ]);
  const [photos, setPhotos] = useState<string[]>([]);
  const [ratings, setRatings] = useState<VisitRating>({
    food: 0,
    ambiance: 0,
    service: 0,
    value: 0,
    overall: 0,
    facilities: 0,
    cleanliness: 0
  });
  const [wouldVisitAgain, setWouldVisitAgain] = useState<boolean>(true);
  const [totalBill, setTotalBill] = useState<number>(0);
  const [manualBillEntry, setManualBillEntry] = useState<boolean>(false);
  const [manualBillAmount, setManualBillAmount] = useState<string>('');
  const [isTakeaway, setIsTakeaway] = useState<boolean>(false);
  
  // Calculate total bill whenever dishes change
  useEffect(() => {
    if (!manualBillEntry) {
      const calculatedTotal = dishes.reduce((sum, dish) => {
        return sum + ((dish.price || 0) * (dish.quantity || 1));
      }, 0);
      setTotalBill(calculatedTotal);
    }
  }, [dishes, manualBillEntry]);

  // Update total bill when manual amount changes
  useEffect(() => {
    if (manualBillEntry) {
      setTotalBill(parseFloat(manualBillAmount) || 0);
    }
  }, [manualBillAmount, manualBillEntry]);
  
  // Handle photo upload
  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>, dishIndex?: number) => {
    if (e.target.files && e.target.files.length > 0) {
      const uploadedPhotos: string[] = [];
      let processedCount = 0;
      
      Array.from(e.target.files).forEach(file => {
        const reader = new FileReader();
        reader.onloadend = () => {
          if (typeof reader.result === 'string') {
            uploadedPhotos.push(reader.result);
            processedCount++;
            
            if (processedCount === e.target.files!.length) {
              if (dishIndex !== undefined) {
                // Add photos to a specific dish
                const newDishes = [...dishes];
                const dishPhotos = newDishes[dishIndex].photos || [];
                newDishes[dishIndex].photos = [...dishPhotos, ...uploadedPhotos];
                setDishes(newDishes);
              } else {
                // Add photos to the visit
                setPhotos([...photos, ...uploadedPhotos]);
              }
            }
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
  
  // Remove a dish photo
  const removeDishPhoto = (dishIndex: number, photoIndex: number) => {
    const newDishes = [...dishes];
    const dishPhotos = newDishes[dishIndex].photos || [];
    dishPhotos.splice(photoIndex, 1);
    newDishes[dishIndex].photos = dishPhotos;
    setDishes(newDishes);
  };
  
  // Add a new dish
  const addDish = () => {
    setDishes([...dishes, { 
      id: uuidv4(), 
      name: '', 
      rating: 0, 
      tags: [], 
      type: 'dish', 
      price: 0,
      quantity: 1,
      photos: []
    }]);
  };
  
  // Update dish information
  const updateDish = (index: number, field: keyof DishRating, value: any) => {
    const newDishes = [...dishes];
    newDishes[index] = { ...newDishes[index], [field]: value };
    
    // Convert price to number when updating price field
    if (field === 'price') {
      newDishes[index].price = value !== '' ? parseFloat(value) : 0;
    }
    
    // Convert quantity to number when updating quantity field
    if (field === 'quantity') {
      newDishes[index].quantity = value !== '' ? parseInt(value) : 1;
    }
    
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

  // Handle sharing venue
  const handleShareVenue = () => {
    // Open share dialog
    if (navigator.share) {
      navigator.share({
        title: `Check out ${venue.name}`,
        text: `I found this great place: ${venue.name} at ${venue.address}`,
        url: window.location.href
      })
      .then(() => toast.success("Shared successfully"))
      .catch(error => console.error('Error sharing', error));
    } else {
      toast("Sharing not supported on this browser", {
        description: "Try copying the link directly"
      });
    }
  };
  
  // Submit check-in
  const handleSubmit = () => {
    // We're making all fields optional, so no validation needed
    
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
      photos: photos,
      wouldVisitAgain: wouldVisitAgain,
      totalBill: totalBill,
      isTakeaway: isTakeaway
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
        <DialogHeader className="flex flex-row items-center justify-between">
          <DialogTitle>Check In at {venue.name}</DialogTitle>
          <div className="flex items-center">
            <Label htmlFor="takeaway" className="mr-2 text-sm">Takeaway</Label>
            <Switch
              id="takeaway"
              checked={isTakeaway}
              onCheckedChange={setIsTakeaway}
            />
          </div>
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
          
          {/* Party Size and Occasion - disable if takeaway */}
          <div className={`grid grid-cols-2 gap-4 ${isTakeaway ? 'opacity-50' : ''}`}>
            <div className="flex flex-col space-y-1.5">
              <Label htmlFor="partySize">Party Size</Label>
              <Input
                id="partySize"
                type="number"
                min="1"
                value={partySize}
                onChange={(e) => setPartySize(parseInt(e.target.value) || 1)}
                disabled={isTakeaway}
              />
            </div>
            
            <div className="flex flex-col space-y-1.5">
              <Label htmlFor="occasion">Occasion (optional)</Label>
              <Input
                id="occasion"
                placeholder="Business, Date, Family..."
                value={occasion}
                onChange={(e) => setOccasion(e.target.value)}
                disabled={isTakeaway}
              />
            </div>
          </div>
          
          {/* Dishes and Drinks */}
          <div className="flex flex-col space-y-1.5">
            <Label>What did you have?</Label>
            {dishes.map((dish, index) => (
              <div key={dish.id} className="flex flex-col gap-2 p-3 border rounded-md mt-2">
                <div className="flex justify-between">
                  <Label htmlFor={`dish-${index}`}>
                    Item {index + 1}
                  </Label>
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
                
                <div className="grid grid-cols-2 gap-2">
                  <Input
                    id={`dish-${index}`}
                    placeholder="Item name"
                    value={dish.name}
                    onChange={(e) => updateDish(index, 'name', e.target.value)}
                  />
                  
                  <Select
                    value={dish.type}
                    onValueChange={(value) => updateDish(index, 'type', value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="dish">Dish</SelectItem>
                      <SelectItem value="drink">Drink</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="grid grid-cols-2 gap-2">
                  <div className="flex flex-col space-y-1.5">
                    <Label htmlFor={`dish-price-${index}`}>Price</Label>
                    <div className="flex items-center">
                      <span className="text-gray-500 mr-2">$</span>
                      <Input
                        id={`dish-price-${index}`}
                        type="number"
                        step="0.01"
                        min="0"
                        placeholder="0.00"
                        value={dish.price || ""}
                        onChange={(e) => updateDish(index, 'price', e.target.value)}
                      />
                    </div>
                  </div>
                  
                  <div className="flex flex-col space-y-1.5">
                    <Label htmlFor={`dish-quantity-${index}`}>Quantity</Label>
                    <Input
                      id={`dish-quantity-${index}`}
                      type="number"
                      min="1"
                      placeholder="1"
                      value={dish.quantity || 1}
                      onChange={(e) => updateDish(index, 'quantity', e.target.value)}
                    />
                  </div>
                </div>
                
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
                
                {/* Dish Photos */}
                <div className="flex flex-col space-y-1.5 mt-2">
                  <Label htmlFor={`dish-photos-${index}`}>Add Photos for This Item</Label>
                  <div className="flex items-center">
                    <Input
                      id={`dish-photos-${index}`}
                      type="file"
                      accept="image/*"
                      multiple
                      onChange={(e) => handlePhotoUpload(e, index)}
                      className="flex-1"
                    />
                    <Button 
                      type="button" 
                      variant="outline" 
                      size="icon"
                      className="ml-2"
                      onClick={() => {
                        document.getElementById(`dish-photos-${index}`)?.click();
                      }}
                    >
                      <Camera className="h-4 w-4" />
                    </Button>
                  </div>
                  
                  {/* Display dish photos */}
                  {dish.photos && dish.photos.length > 0 && (
                    <div className="grid grid-cols-3 gap-2 mt-2">
                      {dish.photos.map((photo, photoIndex) => (
                        <div key={photoIndex} className="relative">
                          <img 
                            src={photo} 
                            alt={`${dish.name || 'Dish'} photo ${photoIndex + 1}`}
                            className="w-full h-20 object-cover rounded" 
                          />
                          <Button 
                            variant="destructive"
                            size="sm"
                            onClick={() => removeDishPhoto(index, photoIndex)}
                            className="absolute top-1 right-1 h-6 w-6 p-0"
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  )}
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
              Add Another Item
            </Button>
          </div>
          
          {/* Total Bill */}
          <div className="flex flex-col space-y-1.5 p-3 border rounded-md">
            <div className="flex items-center justify-between">
              <Label htmlFor="total-bill">Total Bill</Label>
              <div className="flex items-center">
                <Label htmlFor="manual-bill" className="text-sm mr-2">Manual entry</Label>
                <Switch
                  id="manual-bill"
                  checked={manualBillEntry}
                  onCheckedChange={setManualBillEntry}
                />
              </div>
            </div>
            
            {manualBillEntry ? (
              <div className="flex items-center mt-2">
                <span className="text-gray-500 mr-2">$</span>
                <Input
                  id="manual-bill-amount"
                  type="number"
                  step="0.01"
                  min="0"
                  placeholder="0.00"
                  value={manualBillAmount}
                  onChange={(e) => setManualBillAmount(e.target.value)}
                />
              </div>
            ) : (
              <div className="bg-gray-50 p-3 rounded-md mt-2">
                <div className="flex justify-between">
                  <span>Items total:</span>
                  <span>${totalBill.toFixed(2)}</span>
                </div>
                <div className="flex justify-between font-semibold text-lg mt-2 pt-2 border-t">
                  <span>Total Bill:</span>
                  <span>${totalBill.toFixed(2)}</span>
                </div>
              </div>
            )}
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
            
            {/* New ratings: facilities and cleanliness */}
            <div className="grid grid-cols-2 gap-4">
              <div className="flex flex-col space-y-1.5">
                <Label htmlFor="facilities-rating">Facilities</Label>
                <div className="flex gap-1">
                  {ratingOptions.map(option => (
                    <Button
                      key={option.value}
                      variant={ratings.facilities === option.value ? "default" : "outline"}
                      size="sm"
                      onClick={() => updateRating('facilities', option.value)}
                      className="flex-1"
                    >
                      {option.label}
                    </Button>
                  ))}
                </div>
              </div>
              
              <div className="flex flex-col space-y-1.5">
                <Label htmlFor="cleanliness-rating">Cleanliness</Label>
                <div className="flex gap-1">
                  {ratingOptions.map(option => (
                    <Button
                      key={option.value}
                      variant={ratings.cleanliness === option.value ? "default" : "outline"}
                      size="sm"
                      onClick={() => updateRating('cleanliness', option.value)}
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
            
            {/* Would Visit Again toggle */}
            <div className="flex items-center justify-between pt-2">
              <Label htmlFor="visit-again">Would Visit Again</Label>
              <Switch
                id="visit-again"
                checked={wouldVisitAgain}
                onCheckedChange={setWouldVisitAgain}
              />
            </div>
          </div>
          
          {/* Photo Upload */}
          <div className="flex flex-col space-y-1.5">
            <Label>Add Photos of Your Visit</Label>
            <div className="flex items-center">
              <Input
                type="file"
                accept="image/*"
                multiple
                onChange={handlePhotoUpload}
                className="flex-1"
              />
              <Button 
                type="button" 
                variant="outline" 
                size="icon"
                className="ml-2"
                onClick={() => {
                  document.querySelector('input[type="file"]')?.click();
                }}
              >
                <Camera className="h-4 w-4" />
              </Button>
            </div>
            
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
          
          {/* Share Venue */}
          <Button 
            variant="outline" 
            type="button" 
            onClick={handleShareVenue}
            className="flex items-center justify-center gap-2 mt-2"
          >
            <Share2 className="h-4 w-4" />
            Share This Venue
          </Button>
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
