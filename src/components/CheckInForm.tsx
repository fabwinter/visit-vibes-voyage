
import React, { useState, useRef, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Venue, Visit, VisitRating, DishRating } from '@/types';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Camera, Plus, X, Trash, Edit, ShoppingBag, Building2, Sparkles } from 'lucide-react';
import { v4 as uuidv4 } from 'uuid';
import { predefinedTags } from '@/data/mockData';
import { toast } from 'sonner';

// Define dish-specific tags
const FOOD_TAGS = [
  'Delicious', 'Spicy', 'Sweet', 'Savory', 'Fresh', 
  'Overpriced', 'Worth It', 'Healthy', 'Indulgent', 'Authentic'
];

const DRINK_TAGS = [
  'Refreshing', 'Strong', 'Sweet', 'Bitter', 'Balanced',
  'Overpriced', 'Worth It', 'Unique', 'Smooth', 'Well-presented'
];

interface CheckInFormProps {
  venue: Venue;
  isOpen: boolean;
  onClose: () => void;
  onCheckIn: (visit: Visit) => void;
  initialVisit?: Visit; // For editing existing check-ins
}

const CheckInForm: React.FC<CheckInFormProps> = ({
  venue,
  isOpen,
  onClose,
  onCheckIn,
  initialVisit
}) => {
  const [photos, setPhotos] = useState<string[]>([]);
  const [notes, setNotes] = useState('');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [customTag, setCustomTag] = useState('');
  const [wouldVisitAgain, setWouldVisitAgain] = useState<boolean | undefined>(undefined);
  const [partySize, setPartySize] = useState<number>(1);
  const [occasion, setOccasion] = useState<string>('');
  const [isTakeaway, setIsTakeaway] = useState<boolean>(false);
  const [totalBill, setTotalBill] = useState<string>('');
  const [isEditing, setIsEditing] = useState(false);
  
  // New state for ratings
  const [rating, setRating] = useState<VisitRating>({
    food: 3,
    service: 3,
    ambiance: 3,
    value: 3,
    overall: 3,
    facilities: 3,
    cleanliness: 3
  });
  
  // State for dishes
  const [dishes, setDishes] = useState<DishRating[]>([
    {
      id: uuidv4(),
      name: '',
      type: 'dish',
      rating: 3,
      tags: [],
      price: undefined,
      quantity: 1,
      photos: []
    }
  ]);
  
  // Hidden file input ref
  const fileInputRef = useRef<HTMLInputElement>(null);
  const dishFileInputRefs = useRef<Map<string, HTMLInputElement>>(new Map());

  // Initialize form with existing data if editing
  useEffect(() => {
    if (initialVisit) {
      setIsEditing(true);
      setPhotos(initialVisit.photos || []);
      setNotes(initialVisit.notes || '');
      setSelectedTags(initialVisit.tags || []);
      setWouldVisitAgain(initialVisit.wouldVisitAgain);
      setIsTakeaway(initialVisit.isTakeaway || false);
      
      // Restore dishes if available
      if (initialVisit.dishes && initialVisit.dishes.length > 0) {
        setDishes(initialVisit.dishes);
      }
      
      // Restore rating
      if (initialVisit.rating) {
        setRating(initialVisit.rating);
      }
      
      // Restore other fields if available
      if (initialVisit.totalBill) {
        setTotalBill(initialVisit.totalBill.toString());
      }
    } else {
      setIsEditing(false);
      resetForm();
    }
  }, [initialVisit]);
  
  // Calculate overall rating
  useEffect(() => {
    const { food, service, ambiance, value, facilities, cleanliness } = rating;
    const factors = [food, service, ambiance, value];
    
    // Add optional factors if they are relevant (not for takeaway)
    if (!isTakeaway) {
      if (facilities) factors.push(facilities);
      if (cleanliness) factors.push(cleanliness);
    }
    
    const sum = factors.reduce((acc, val) => acc + val, 0);
    const overall = parseFloat((sum / factors.length).toFixed(1));
    
    setRating(prev => ({ ...prev, overall }));
  }, [rating.food, rating.service, rating.ambiance, rating.value, rating.facilities, rating.cleanliness, isTakeaway]);
  
  // Calculate the total bill based on dish prices and quantities
  useEffect(() => {
    const calculatedTotal = dishes.reduce((total, dish) => {
      if (dish.price && dish.quantity) {
        return total + (dish.price * dish.quantity);
      }
      return total;
    }, 0);
    
    if (calculatedTotal > 0) {
      setTotalBill(calculatedTotal.toFixed(2));
    }
  }, [dishes]);

  // Handle venue image upload
  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const newPhotos = Array.from(e.target.files).map(file => URL.createObjectURL(file));
      setPhotos(prev => [...prev, ...newPhotos]);
    }
  };
  
  // Handle dish image upload
  const handleDishPhotoUpload = (dishId: string, e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const newPhotos = Array.from(e.target.files).map(file => URL.createObjectURL(file));
      
      setDishes(prev => 
        prev.map(dish => 
          dish.id === dishId 
            ? { ...dish, photos: [...(dish.photos || []), ...newPhotos] }
            : dish
        )
      );
    }
  };
  
  // Handle dish fields change
  const handleDishChange = (id: string, field: keyof DishRating, value: any) => {
    setDishes(prev => 
      prev.map(dish => 
        dish.id === id ? { ...dish, [field]: value } : dish
      )
    );
  };
  
  // Add new dish
  const addDish = () => {
    const newDish: DishRating = {
      id: uuidv4(),
      name: '',
      type: 'dish',
      rating: 3,
      tags: [],
      price: undefined,
      quantity: 1,
      photos: []
    };
    
    setDishes(prev => [...prev, newDish]);
  };
  
  // Remove dish
  const removeDish = (id: string) => {
    if (dishes.length <= 1) {
      toast.warning("You need at least one dish");
      return;
    }
    setDishes(prev => prev.filter(dish => dish.id !== id));
  };
  
  // Add tag to dish
  const addTagToDish = (dishId: string, tag: string) => {
    setDishes(prev => 
      prev.map(dish => {
        if (dish.id === dishId) {
          const updatedTags = dish.tags.includes(tag) 
            ? dish.tags 
            : [...dish.tags, tag];
          return { ...dish, tags: updatedTags };
        }
        return dish;
      })
    );
  };
  
  // Remove tag from dish
  const removeTagFromDish = (dishId: string, tag: string) => {
    setDishes(prev => 
      prev.map(dish => {
        if (dish.id === dishId) {
          return { ...dish, tags: dish.tags.filter(t => t !== tag) };
        }
        return dish;
      })
    );
  };

  // Handle tag selection
  const toggleTag = (tag: string) => {
    if (selectedTags.includes(tag)) {
      setSelectedTags(prev => prev.filter(t => t !== tag));
    } else {
      setSelectedTags(prev => [...prev, tag]);
    }
  };

  // Add custom tag
  const addCustomTag = () => {
    if (customTag.trim() === '') return;
    
    if (!selectedTags.includes(customTag)) {
      setSelectedTags(prev => [...prev, customTag]);
    }
    setCustomTag('');
  };
  
  // Add custom tag to dish
  const addCustomTagToDish = (dishId: string, tag: string) => {
    if (tag.trim() === '') return;
    
    setDishes(prev => 
      prev.map(dish => {
        if (dish.id === dishId && !dish.tags.includes(tag)) {
          return { ...dish, tags: [...dish.tags, tag] };
        }
        return dish;
      })
    );
  };
  
  // Trigger file input click
  const triggerFileInput = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };
  
  // Trigger dish file input click
  const triggerDishFileInput = (dishId: string) => {
    const fileInput = dishFileInputRefs.current.get(dishId);
    if (fileInput) {
      fileInput.click();
    }
  };

  // Handle check-in submission
  const handleSubmit = () => {
    // Make sure venue at least has a name
    if (!venue || !venue.name) {
      toast.error("Missing venue information");
      return;
    }
    
    // Filter out empty dishes
    const validDishes = dishes.filter(dish => dish.name.trim() !== '');
    
    if (validDishes.length === 0) {
      toast.error("Please add at least one dish or drink");
      return;
    }
    
    // Create the visit object
    const visit: Visit = {
      id: initialVisit?.id || uuidv4(),
      venueId: venue.id,
      timestamp: initialVisit?.timestamp || new Date().toISOString(),
      dishes: validDishes,
      rating,
      tags: selectedTags,
      notes: notes.trim() || undefined,
      photos: photos,
      wouldVisitAgain,
      totalBill: totalBill ? parseFloat(totalBill) : undefined,
      isTakeaway
    };
    
    // Pass the visit object to the parent component
    onCheckIn(visit);
    
    // Reset form state
    resetForm();
  };
  
  // Reset the form
  const resetForm = () => {
    setPhotos([]);
    setNotes('');
    setSelectedTags([]);
    setCustomTag('');
    setWouldVisitAgain(undefined);
    setPartySize(1);
    setOccasion('');
    setIsTakeaway(false);
    setTotalBill('');
    setRating({
      food: 3,
      service: 3,
      ambiance: 3,
      value: 3,
      overall: 3,
      facilities: 3,
      cleanliness: 3
    });
    setDishes([
      {
        id: uuidv4(),
        name: '',
        type: 'dish',
        rating: 3,
        tags: [],
        price: undefined,
        quantity: 1,
        photos: []
      }
    ]);
  };
  
  // Common rating slider component
  const RatingSlider = ({ 
    value, 
    onChange, 
    label 
  }: { 
    value: number; 
    onChange: (value: number) => void; 
    label: React.ReactNode; // Changed from string to ReactNode to accept JSX elements
  }) => (
    <div className="mb-6">
      <div className="flex justify-between items-center mb-2">
        <Label>{label}</Label>
        <span className="font-medium">{value}/5</span>
      </div>
      <Slider 
        value={[value]} 
        onValueChange={(values) => onChange(values[0])}
        min={1}
        max={5}
        step={0.5}
      />
    </div>
  );

  // Dish component
  const DishForm = ({ dish, index }: { dish: DishRating; index: number }) => {
    const [customDishTag, setCustomDishTag] = useState('');
    
    // Set up the file input ref for this dish
    useEffect(() => {
      const input = document.createElement('input');
      input.type = 'file';
      input.multiple = true;
      input.accept = 'image/*';
      input.style.display = 'none';
      input.addEventListener('change', (e) => {
        if (e.target instanceof HTMLInputElement && e.target.files) {
          handleDishPhotoUpload(dish.id, e as unknown as React.ChangeEvent<HTMLInputElement>);
        }
      });
      
      dishFileInputRefs.current.set(dish.id, input);
      
      return () => {
        dishFileInputRefs.current.delete(dish.id);
      };
    }, [dish.id]);
    
    // Get tags based on dish type
    const dishTypeTags = dish.type === 'drink' ? DRINK_TAGS : FOOD_TAGS;
    
    // Handle adding custom tag
    const handleAddCustomTag = () => {
      if (customDishTag.trim() === '') return;
      addCustomTagToDish(dish.id, customDishTag);
      setCustomDishTag('');
    };
    
    return (
      <div className="border rounded-md p-4 mb-4">
        <div className="flex justify-between items-center mb-3">
          <h3 className="font-medium">Dish {index + 1}</h3>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={() => removeDish(dish.id)}
          >
            <Trash className="h-4 w-4" />
          </Button>
        </div>
        
        <div className="space-y-3">
          {/* Dish name */}
          <div>
            <Label htmlFor={`dish-name-${dish.id}`}>Name</Label>
            <Input
              id={`dish-name-${dish.id}`}
              value={dish.name}
              onChange={(e) => handleDishChange(dish.id, 'name', e.target.value)}
              placeholder="Dish name"
            />
          </div>
          
          {/* Type selection */}
          <div className="flex gap-2">
            <Button
              type="button"
              variant={dish.type === 'dish' ? 'default' : 'outline'}
              onClick={() => handleDishChange(dish.id, 'type', 'dish')}
              className="flex-1"
            >
              Food
            </Button>
            <Button
              type="button"
              variant={dish.type === 'drink' ? 'default' : 'outline'}
              onClick={() => handleDishChange(dish.id, 'type', 'drink')}
              className="flex-1"
            >
              Drink
            </Button>
          </div>
          
          {/* Price and quantity */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label htmlFor={`dish-price-${dish.id}`}>Price</Label>
              <Input
                id={`dish-price-${dish.id}`}
                type="number"
                min="0"
                step="0.01"
                value={dish.price || ''}
                onChange={(e) => handleDishChange(dish.id, 'price', e.target.value ? parseFloat(e.target.value) : undefined)}
                placeholder="Price"
              />
            </div>
            <div>
              <Label htmlFor={`dish-quantity-${dish.id}`}>Quantity</Label>
              <Input
                id={`dish-quantity-${dish.id}`}
                type="number"
                min="1"
                value={dish.quantity || 1}
                onChange={(e) => handleDishChange(dish.id, 'quantity', parseInt(e.target.value) || 1)}
              />
            </div>
          </div>
          
          {/* Rating */}
          <div>
            <div className="flex justify-between items-center mb-2">
              <Label>Rating</Label>
              <span className="font-medium">{dish.rating}/5</span>
            </div>
            <Slider
              value={[dish.rating]}
              onValueChange={(values) => handleDishChange(dish.id, 'rating', values[0])}
              min={1}
              max={5}
              step={0.5}
            />
          </div>
          
          {/* Tags - dynamic based on dish type */}
          <div>
            <Label>Tags</Label>
            <div className="flex flex-wrap gap-2 my-2">
              {dishTypeTags.map(tag => (
                <Button
                  key={tag}
                  type="button"
                  variant={dish.tags.includes(tag) ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => dish.tags.includes(tag) 
                    ? removeTagFromDish(dish.id, tag)
                    : addTagToDish(dish.id, tag)
                  }
                >
                  {tag}
                </Button>
              ))}
            </div>
            
            {/* Custom tag input for this dish */}
            <div className="flex gap-2 mt-2">
              <Input
                value={customDishTag}
                onChange={(e) => setCustomDishTag(e.target.value)}
                placeholder="Add custom tag"
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleAddCustomTag();
                  }
                }}
              />
              <Button type="button" onClick={handleAddCustomTag}>Add</Button>
            </div>
            
            {/* Show applied custom tags */}
            {dish.tags.filter(tag => !dishTypeTags.includes(tag)).length > 0 && (
              <div className="flex flex-wrap gap-1 mt-2">
                {dish.tags
                  .filter(tag => !dishTypeTags.includes(tag))
                  .map(tag => (
                    <div key={tag} className="bg-blue-100 text-blue-700 px-2 py-1 rounded-full text-xs flex items-center">
                      {tag}
                      <Button 
                        type="button" 
                        variant="ghost" 
                        size="sm" 
                        className="h-4 w-4 p-0 ml-1"
                        onClick={() => removeTagFromDish(dish.id, tag)}
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    </div>
                  ))}
              </div>
            )}
          </div>
          
          {/* Photos */}
          <div>
            <Label className="block mb-2">Photos</Label>
            <div className="flex flex-wrap gap-2">
              {dish.photos && dish.photos.length > 0 && dish.photos.map((photo, i) => (
                <div key={i} className="relative w-16 h-16 rounded overflow-hidden">
                  <img src={photo} alt={`Dish ${index} photo ${i}`} className="w-full h-full object-cover" />
                  <button
                    type="button"
                    className="absolute top-0 right-0 bg-black/60 p-1 rounded-bl"
                    onClick={() => {
                      const updatedPhotos = [...dish.photos!];
                      updatedPhotos.splice(i, 1);
                      handleDishChange(dish.id, 'photos', updatedPhotos);
                    }}
                  >
                    <X className="h-3 w-3 text-white" />
                  </button>
                </div>
              ))}
              <button
                type="button"
                onClick={() => triggerDishFileInput(dish.id)}
                className="w-16 h-16 flex items-center justify-center border-2 border-dashed border-gray-300 rounded hover:border-gray-400 transition-colors"
              >
                <Camera className="h-6 w-6 text-gray-400" />
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <Dialog open={isOpen} onOpenChange={() => onClose()}>
      <DialogContent className="sm:max-w-[600px] max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex justify-between items-center">
            <span>{isEditing ? "Edit Check-in at" : "Check In at"} {venue.name}</span>
            <Button
              variant="outline"
              size="sm"
              className="flex items-center gap-1"
              onClick={() => setIsTakeaway(!isTakeaway)}
            >
              <ShoppingBag className="h-4 w-4" />
              {isTakeaway ? "Take-away" : "Dine-in"}
            </Button>
          </DialogTitle>
        </DialogHeader>
        
        <div className="flex justify-between items-center mb-4">
          <div className="text-gray-500 text-sm">{venue.address}</div>
        </div>
        
        <div className="space-y-6">
          {/* Main ratings */}
          <div>
            <h3 className="text-lg font-medium mb-3">Ratings</h3>
            
            <RatingSlider
              label="Food Quality"
              value={rating.food}
              onChange={(value) => setRating(prev => ({ ...prev, food: value }))}
            />
            
            <RatingSlider
              label="Service"
              value={rating.service}
              onChange={(value) => setRating(prev => ({ ...prev, service: value }))}
            />
            
            {!isTakeaway && (
              <>
                <RatingSlider
                  label="Ambiance"
                  value={rating.ambiance}
                  onChange={(value) => setRating(prev => ({ ...prev, ambiance: value }))}
                />
                
                <RatingSlider
                  label={<div className="flex items-center gap-1"><Building2 className="h-4 w-4" /> Facilities</div>}
                  value={rating.facilities || 3}
                  onChange={(value) => setRating(prev => ({ ...prev, facilities: value }))}
                />
                
                <RatingSlider
                  label={<div className="flex items-center gap-1"><Sparkles className="h-4 w-4" /> Cleanliness</div>}
                  value={rating.cleanliness || 3}
                  onChange={(value) => setRating(prev => ({ ...prev, cleanliness: value }))}
                />
              </>
            )}
            
            <RatingSlider
              label="Value for Money"
              value={rating.value}
              onChange={(value) => setRating(prev => ({ ...prev, value: value }))}
            />
            
            <div className="flex justify-between items-center py-2 px-1 bg-gray-50 rounded-md mt-4">
              <Label className="font-medium">Overall Rating</Label>
              <span className="text-lg font-bold">{rating.overall.toFixed(1)}/5</span>
            </div>
          </div>
          
          {/* Non-takeaway specific fields */}
          {!isTakeaway && (
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="party-size">Party Size</Label>
                <Input
                  id="party-size"
                  type="number"
                  min="1"
                  value={partySize}
                  onChange={(e) => setPartySize(parseInt(e.target.value) || 1)}
                />
              </div>
              <div>
                <Label htmlFor="occasion">Occasion</Label>
                <Input
                  id="occasion"
                  value={occasion}
                  onChange={(e) => setOccasion(e.target.value)}
                  placeholder="Birthday, Date night, etc."
                />
              </div>
            </div>
          )}
          
          {/* Dishes section */}
          <div>
            <div className="flex justify-between items-center mb-3">
              <h3 className="text-lg font-medium">What did you have?</h3>
              <Button type="button" variant="outline" size="sm" onClick={addDish}>
                <Plus className="h-4 w-4 mr-1" /> Add Dish
              </Button>
            </div>
            
            {dishes.map((dish, index) => (
              <DishForm key={dish.id} dish={dish} index={index} />
            ))}
            
            <div>
              <Label htmlFor="total-bill">Total Bill</Label>
              <div className="relative">
                <span className="absolute left-3 top-2.5">$</span>
                <Input
                  id="total-bill"
                  type="number"
                  className="pl-7"
                  min="0"
                  step="0.01"
                  value={totalBill}
                  onChange={(e) => setTotalBill(e.target.value)}
                  placeholder="Total amount"
                />
              </div>
            </div>
          </div>
          
          {/* Tags */}
          <div>
            <Label className="mb-2 block">Visit Tags</Label>
            <div className="flex flex-wrap gap-2 mb-2">
              {predefinedTags.map(tag => (
                <Button
                  key={tag}
                  type="button"
                  variant={selectedTags.includes(tag) ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => toggleTag(tag)}
                >
                  {tag}
                </Button>
              ))}
            </div>
            
            <div className="flex gap-2">
              <Input
                value={customTag}
                onChange={(e) => setCustomTag(e.target.value)}
                placeholder="Add a custom tag"
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    addCustomTag();
                  }
                }}
              />
              <Button type="button" onClick={addCustomTag}>Add</Button>
            </div>
            
            {/* Show applied custom tags */}
            {selectedTags.filter(tag => !predefinedTags.includes(tag)).length > 0 && (
              <div className="flex flex-wrap gap-1 mt-2">
                {selectedTags
                  .filter(tag => !predefinedTags.includes(tag))
                  .map(tag => (
                    <div key={tag} className="bg-blue-100 text-blue-700 px-2 py-1 rounded-full text-xs flex items-center">
                      {tag}
                      <Button 
                        type="button" 
                        variant="ghost" 
                        size="sm" 
                        className="h-4 w-4 p-0 ml-1"
                        onClick={() => toggleTag(tag)}
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    </div>
                  ))}
              </div>
            )}
          </div>
          
          {/* Visit photos */}
          <div>
            <Label className="mb-2 block">Photos</Label>
            <div className="flex flex-wrap gap-2">
              {photos.map((photo, index) => (
                <div key={index} className="relative w-20 h-20 rounded overflow-hidden">
                  <img src={photo} alt={`Visit photo ${index}`} className="w-full h-full object-cover" />
                  <button
                    type="button"
                    className="absolute top-0 right-0 bg-black/60 p-1 rounded-bl"
                    onClick={() => setPhotos(prev => prev.filter((_, i) => i !== index))}
                  >
                    <X className="h-3 w-3 text-white" />
                  </button>
                </div>
              ))}
              <button
                type="button"
                onClick={triggerFileInput}
                className="w-20 h-20 flex items-center justify-center border-2 border-dashed border-gray-300 rounded hover:border-gray-400 transition-colors"
              >
                <Camera className="h-6 w-6 text-gray-400" />
              </button>
            </div>
            
            <input
              type="file"
              ref={fileInputRef}
              className="hidden"
              accept="image/*"
              multiple
              onChange={handlePhotoUpload}
            />
          </div>
          
          {/* Notes */}
          <div>
            <Label htmlFor="notes">Notes</Label>
            <Textarea
              id="notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Any additional notes about your visit..."
              rows={3}
            />
          </div>
          
          {/* Would visit again */}
          <div>
            <Label className="mb-2 block">Would visit again?</Label>
            <div className="flex gap-2">
              <Button
                type="button"
                variant={wouldVisitAgain === true ? 'default' : 'outline'}
                onClick={() => setWouldVisitAgain(true)}
                className="flex-1"
              >
                Yes
              </Button>
              <Button
                type="button"
                variant={wouldVisitAgain === false ? 'destructive' : 'outline'}
                onClick={() => setWouldVisitAgain(false)}
                className="flex-1"
              >
                No
              </Button>
            </div>
          </div>
        </div>
        
        <div className="flex justify-end gap-2 mt-6">
          <Button type="button" variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button type="button" onClick={handleSubmit}>
            {isEditing ? "Save Changes" : "Check In"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default CheckInForm;
