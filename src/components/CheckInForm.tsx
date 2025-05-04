
import { useState } from 'react';
import { Venue, Visit, DishRating } from '@/types';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './ui/dialog';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Textarea } from './ui/textarea';
import { Label } from './ui/label';
import { RadioGroup, RadioGroupItem } from './ui/radio-group';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import StarRatingInput from './StarRatingInput';
import { Calendar } from './ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from './ui/popover';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { CalendarIcon, X, Plus, Image as ImageIcon, Trash } from 'lucide-react';
import { toast } from 'sonner';

interface CheckInFormProps {
  venue: Venue;
  isOpen: boolean;
  onClose: () => void;
  onCheckIn: (visit: any) => void;
  initialVisit?: Visit;
}

const CheckInForm = ({ venue, isOpen, onClose, onCheckIn, initialVisit }: CheckInFormProps) => {
  // Form state
  const [date, setDate] = useState<Date>(initialVisit?.timestamp ? new Date(initialVisit.timestamp) : new Date());
  const [rating, setRating] = useState({
    food: initialVisit?.rating?.food || 0,
    ambiance: initialVisit?.rating?.ambiance || 0,
    service: initialVisit?.rating?.service || 0,
    value: initialVisit?.rating?.value || 0,
  });
  const [wouldVisitAgain, setWouldVisitAgain] = useState<boolean>(initialVisit?.wouldVisitAgain ?? true);
  const [visitType, setVisitType] = useState<'eat-in' | 'takeaway'>(initialVisit?.visitType || 'eat-in');
  const [notes, setNotes] = useState(initialVisit?.notes || '');
  const [tags, setTags] = useState<string[]>(initialVisit?.tags || []);
  const [newTag, setNewTag] = useState('');
  const [photos, setPhotos] = useState<string[]>(initialVisit?.photos || []);
  const [dishes, setDishes] = useState<DishRating[]>(initialVisit?.dishes || []);
  const [activeTab, setActiveTab] = useState('details');
  const [partySize, setPartySize] = useState<number | undefined>(initialVisit?.partySize || 1);
  const [totalBill, setTotalBill] = useState<number | undefined>(initialVisit?.totalBill);

  // Editable dish state
  const [editingDish, setEditingDish] = useState<DishRating | null>(null);
  const [dishName, setDishName] = useState('');
  const [dishPrice, setDishPrice] = useState<number | undefined>();
  const [dishRating, setDishRating] = useState(0);
  const [dishType, setDishType] = useState<'dish' | 'drink'>('dish');
  const [dishQuantity, setDishQuantity] = useState(1);
  const [dishPhoto, setDishPhoto] = useState<string | undefined>();
  const [dishNotes, setDishNotes] = useState('');
  const [dishTags, setDishTags] = useState<string[]>([]);
  const [newDishTag, setNewDishTag] = useState('');

  // Calculate overall rating
  const calculateOverall = () => {
    const sum = rating.food + rating.ambiance + rating.service + rating.value;
    const validRatings = Object.values(rating).filter(r => r > 0).length;
    return validRatings > 0 ? Math.round((sum / validRatings) * 10) / 10 : 0;
  };

  // Calculate total bill from dishes
  const calculateTotalFromDishes = () => {
    return dishes.reduce((total, dish) => {
      const price = dish.price || 0;
      const quantity = dish.quantity || 1;
      return total + (price * quantity);
    }, 0);
  };

  // Update total bill when dishes change
  useState(() => {
    const calculatedTotal = calculateTotalFromDishes();
    if (calculatedTotal > 0) {
      setTotalBill(calculatedTotal);
    }
  });

  // Handle party size changes
  const handlePartySizeChange = (value: string) => {
    const size = parseInt(value, 10);
    if (value === '') {
      setPartySize(undefined);
    } else if (!isNaN(size) && size >= 1) {
      setPartySize(size);
    }
  };

  // Handle photo upload
  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      setPhotos((prev) => [...prev, reader.result as string]);
    };
    reader.readAsDataURL(file);
    
    // Reset the input
    e.target.value = '';
  };

  // Handle dish photo upload
  const handleDishPhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      setDishPhoto(reader.result as string);
    };
    reader.readAsDataURL(file);
    
    // Reset the input
    e.target.value = '';
  };

  // Add a new tag
  const addTag = () => {
    if (newTag && !tags.includes(newTag)) {
      setTags((prev) => [...prev, newTag]);
      setNewTag('');
    }
  };

  // Remove a tag
  const removeTag = (tag: string) => {
    setTags((prev) => prev.filter((t) => t !== tag));
  };

  // Add dish tag
  const addDishTag = () => {
    if (newDishTag && !dishTags.includes(newDishTag)) {
      setDishTags((prev) => [...prev, newDishTag]);
      setNewDishTag('');
    }
  };

  // Remove dish tag
  const removeDishTag = (tag: string) => {
    setDishTags((prev) => prev.filter((t) => t !== tag));
  };

  // Add a new dish
  const addDish = () => {
    if (!dishName) {
      toast.error('Please enter a dish name');
      return;
    }

    const newDish: DishRating = {
      id: editingDish?.id || `dish_${Date.now()}`,
      name: dishName,
      rating: dishRating,
      tags: dishTags,
      notes: dishNotes,
      type: dishType,
      price: dishPrice,
      photo: dishPhoto,
      quantity: dishQuantity
    };

    if (editingDish) {
      setDishes((prev) => prev.map((d) => (d.id === editingDish.id ? newDish : d)));
    } else {
      setDishes((prev) => [...prev, newDish]);
    }

    // Reset form
    setEditingDish(null);
    setDishName('');
    setDishPrice(undefined);
    setDishRating(0);
    setDishType('dish');
    setDishQuantity(1);
    setDishPhoto(undefined);
    setDishNotes('');
    setDishTags([]);
    setNewDishTag('');
  };

  // Edit dish
  const startEditingDish = (dish: DishRating) => {
    setEditingDish(dish);
    setDishName(dish.name);
    setDishPrice(dish.price);
    setDishRating(dish.rating);
    setDishType(dish.type);
    setDishQuantity(dish.quantity || 1);
    setDishPhoto(dish.photo);
    setDishNotes(dish.notes || '');
    setDishTags(dish.tags || []);
  };

  // Remove dish
  const removeDish = (id: string) => {
    setDishes((prev) => prev.filter((d) => d.id !== id));
  };

  // Handle form submission
  const handleSubmit = () => {
    // Calculate overall rating
    const overallRating = calculateOverall();

    // Calculate total based on dishes if not set manually
    const finalTotalBill = totalBill || calculateTotalFromDishes();

    // Check required fields
    if (rating.food === 0 && rating.ambiance === 0 && rating.service === 0 && rating.value === 0) {
      toast.error('Please add at least one rating');
      return;
    }

    // Create visit object
    const visit: Partial<Visit> = {
      id: initialVisit?.id || `visit_${Date.now()}`,
      venueId: venue.id,
      timestamp: date.toISOString(),
      rating: {
        ...rating,
        overall: overallRating,
      },
      dishes,
      photos,
      notes,
      tags,
      wouldVisitAgain,
      visitType, 
      partySize,
      totalBill: finalTotalBill || undefined,
    };

    onCheckIn(visit);
    toast.success('Check-in saved!');
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            Check in at {venue.name}
          </DialogTitle>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid grid-cols-3 mb-4">
            <TabsTrigger value="details">Details</TabsTrigger>
            <TabsTrigger value="dishes">Dishes</TabsTrigger>
            <TabsTrigger value="photos">Photos</TabsTrigger>
          </TabsList>

          <TabsContent value="details" className="space-y-4">
            {/* Visit Date */}
            <div className="space-y-2">
              <Label htmlFor="date">Date</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant={"outline"}
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !date && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {date ? format(date, "PPP") : "Select date"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={date}
                    onSelect={(newDate) => newDate && setDate(newDate)}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>

            {/* Visit Type */}
            <div className="space-y-2">
              <Label>Visit Type</Label>
              <RadioGroup 
                value={visitType} 
                onValueChange={(value) => setVisitType(value as 'eat-in' | 'takeaway')}
                className="flex gap-4"
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="eat-in" id="eat-in" />
                  <Label htmlFor="eat-in">Eat-in</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="takeaway" id="takeaway" />
                  <Label htmlFor="takeaway">Takeaway</Label>
                </div>
              </RadioGroup>
            </div>

            {/* Party Size */}
            <div className="space-y-2">
              <Label htmlFor="partySize">Party Size</Label>
              <Input
                id="partySize"
                type="number"
                value={partySize?.toString() || ''}
                onChange={(e) => handlePartySizeChange(e.target.value)}
                min="1"
                className="w-full"
              />
            </div>

            {/* Rating */}
            <div className="space-y-3">
              <Label>Rating</Label>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <Label htmlFor="foodRating" className="text-sm">Food</Label>
                  <StarRatingInput 
                    value={rating.food} 
                    onChange={(value) => setRating({...rating, food: value})} 
                  />
                </div>
                <div className="space-y-1">
                  <Label htmlFor="ambianceRating" className="text-sm">Ambiance</Label>
                  <StarRatingInput 
                    value={rating.ambiance} 
                    onChange={(value) => setRating({...rating, ambiance: value})} 
                  />
                </div>
                <div className="space-y-1">
                  <Label htmlFor="serviceRating" className="text-sm">Service</Label>
                  <StarRatingInput 
                    value={rating.service} 
                    onChange={(value) => setRating({...rating, service: value})} 
                  />
                </div>
                <div className="space-y-1">
                  <Label htmlFor="valueRating" className="text-sm">Value</Label>
                  <StarRatingInput 
                    value={rating.value} 
                    onChange={(value) => setRating({...rating, value: value})} 
                  />
                </div>
              </div>
              <div className="pt-2 flex items-center justify-between">
                <Label className="text-sm font-medium">Overall</Label>
                <div className="font-bold text-lg">{calculateOverall()}</div>
              </div>
            </div>

            {/* Would Visit Again */}
            <div className="space-y-2">
              <Label>Would you visit again?</Label>
              <RadioGroup 
                value={wouldVisitAgain ? 'yes' : 'no'} 
                onValueChange={(value) => setWouldVisitAgain(value === 'yes')}
                className="flex gap-4"
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="yes" id="yes" />
                  <Label htmlFor="yes">Yes</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="no" id="no" />
                  <Label htmlFor="no">No</Label>
                </div>
              </RadioGroup>
            </div>

            {/* Total Bill */}
            <div className="space-y-2">
              <Label htmlFor="totalBill">Total Bill</Label>
              <Input
                id="totalBill"
                type="number"
                value={totalBill?.toString() || ''}
                onChange={(e) => setTotalBill(e.target.value ? parseFloat(e.target.value) : undefined)}
                min="0"
                step="0.01"
                placeholder="Enter total amount"
                className="w-full"
              />
              {dishes.length > 0 && !totalBill && (
                <p className="text-xs text-gray-500">
                  Calculated from dishes: ${calculateTotalFromDishes().toFixed(2)}
                </p>
              )}
            </div>

            {/* Notes */}
            <div className="space-y-2">
              <Label htmlFor="notes">Notes</Label>
              <Textarea
                id="notes"
                placeholder="Add any notes about your visit"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
              />
            </div>

            {/* Tags */}
            <div className="space-y-2">
              <Label htmlFor="tags">Tags</Label>
              <div className="flex flex-wrap gap-1 mb-2">
                {tags.map((tag) => (
                  <div key={tag} className="flex items-center bg-gray-100 rounded-full px-3 py-1">
                    <span className="text-sm">{tag}</span>
                    <button 
                      type="button" 
                      onClick={() => removeTag(tag)}
                      className="ml-1 text-gray-500 hover:text-gray-700"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </div>
                ))}
              </div>
              <div className="flex gap-2">
                <Input
                  id="newTag"
                  placeholder="Add a tag"
                  value={newTag}
                  onChange={(e) => setNewTag(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && addTag()}
                  className="flex-1"
                />
                <Button type="button" variant="outline" size="sm" onClick={addTag}>
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="dishes" className="space-y-4">
            <div className="space-y-4">
              <Label>What did you have?</Label>
              {dishes.length === 0 ? (
                <div className="text-center py-4 text-gray-500">
                  No dishes added yet
                </div>
              ) : (
                <div className="space-y-3">
                  {dishes.map((dish) => (
                    <div key={dish.id} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-medium">{dish.name}</span>
                          {dish.quantity && dish.quantity > 1 && (
                            <span className="text-xs bg-gray-200 px-2 py-0.5 rounded">×{dish.quantity}</span>
                          )}
                          <span className="text-xs bg-gray-200 px-2 py-0.5 rounded">{dish.type}</span>
                        </div>
                        <div className="flex items-center gap-1 mt-1">
                          <StarRatingInput value={dish.rating} readOnly size="xs" />
                          {dish.price && (
                            <span className="text-sm text-gray-600">
                              ${dish.price.toFixed(2)}
                              {dish.quantity && dish.quantity > 1 ? ` (${dish.quantity} × $${(dish.price * dish.quantity).toFixed(2)})` : ''}
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="flex gap-1">
                        <Button 
                          type="button" 
                          variant="ghost" 
                          size="sm"
                          onClick={() => startEditingDish(dish)}
                        >
                          Edit
                        </Button>
                        <Button 
                          type="button" 
                          variant="ghost" 
                          size="sm"
                          onClick={() => removeDish(dish.id)}
                        >
                          <Trash className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              <div className="border-t pt-4">
                <h4 className="font-medium mb-3">
                  {editingDish ? 'Edit Dish' : 'Add New Dish'}
                </h4>
                <div className="grid gap-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="dishName">Name</Label>
                      <Input
                        id="dishName"
                        placeholder="Dish name"
                        value={dishName}
                        onChange={(e) => setDishName(e.target.value)}
                        className="w-full"
                      />
                    </div>
                    <div>
                      <Label htmlFor="dishPrice">Price</Label>
                      <Input
                        id="dishPrice"
                        type="number"
                        placeholder="0.00"
                        value={dishPrice?.toString() || ''}
                        onChange={(e) => setDishPrice(e.target.value ? parseFloat(e.target.value) : undefined)}
                        min="0"
                        step="0.01"
                        className="w-full"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="dishType">Type</Label>
                      <RadioGroup 
                        value={dishType} 
                        onValueChange={(value) => setDishType(value as 'dish' | 'drink')}
                        className="flex gap-4"
                      >
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="dish" id="dish-type" />
                          <Label htmlFor="dish-type">Food</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="drink" id="drink-type" />
                          <Label htmlFor="drink-type">Drink</Label>
                        </div>
                      </RadioGroup>
                    </div>
                    <div>
                      <Label htmlFor="dishQuantity">Quantity</Label>
                      <Input
                        id="dishQuantity"
                        type="number"
                        value={dishQuantity}
                        onChange={(e) => setDishQuantity(parseInt(e.target.value) || 1)}
                        min="1"
                        className="w-full"
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="dishRating">Rating</Label>
                    <StarRatingInput 
                      value={dishRating} 
                      onChange={(value) => setDishRating(value)} 
                    />
                  </div>

                  <div>
                    <Label htmlFor="dishPhoto">Photo</Label>
                    {dishPhoto ? (
                      <div className="relative mt-1 h-32 w-full overflow-hidden rounded-md">
                        <img 
                          src={dishPhoto} 
                          alt={dishName} 
                          className="h-full w-full object-cover" 
                        />
                        <Button
                          type="button"
                          variant="destructive"
                          size="sm"
                          className="absolute top-1 right-1 h-6 w-6 p-0"
                          onClick={() => setDishPhoto(undefined)}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    ) : (
                      <div className="flex items-center justify-center border-2 border-dashed border-gray-300 rounded-md h-32 mt-1">
                        <label className="flex flex-col items-center cursor-pointer">
                          <ImageIcon className="h-8 w-8 text-gray-400" />
                          <span className="mt-2 text-sm text-gray-500">Upload a photo</span>
                          <input
                            type="file"
                            accept="image/*"
                            className="hidden"
                            onChange={handleDishPhotoUpload}
                          />
                        </label>
                      </div>
                    )}
                  </div>

                  <div>
                    <Label htmlFor="dishNotes">Notes</Label>
                    <Textarea
                      id="dishNotes"
                      placeholder="Add notes about this dish"
                      value={dishNotes}
                      onChange={(e) => setDishNotes(e.target.value)}
                    />
                  </div>

                  <div>
                    <Label htmlFor="dishTags">Tags</Label>
                    <div className="flex flex-wrap gap-1 mb-2">
                      {dishTags.map((tag) => (
                        <div key={tag} className="flex items-center bg-gray-100 rounded-full px-3 py-1">
                          <span className="text-sm">{tag}</span>
                          <button 
                            type="button" 
                            onClick={() => removeDishTag(tag)}
                            className="ml-1 text-gray-500 hover:text-gray-700"
                          >
                            <X className="h-3 w-3" />
                          </button>
                        </div>
                      ))}
                    </div>
                    <div className="flex gap-2">
                      <Input
                        id="newDishTag"
                        placeholder="Add a tag (e.g., spicy, favorite)"
                        value={newDishTag}
                        onChange={(e) => setNewDishTag(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && addDishTag()}
                        className="flex-1"
                      />
                      <Button type="button" variant="outline" size="sm" onClick={addDishTag}>
                        <Plus className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>

                  <Button
                    type="button"
                    onClick={addDish}
                    className="mt-2"
                  >
                    {editingDish ? 'Update Dish' : 'Add Dish'}
                  </Button>
                </div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="photos" className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="photos">Visit Photos</Label>
              <div className="grid grid-cols-2 gap-2">
                {photos.map((photo, index) => (
                  <div key={index} className="relative">
                    <img 
                      src={photo} 
                      alt={`Visit photo ${index + 1}`} 
                      className="h-32 w-full object-cover rounded-md" 
                    />
                    <Button
                      type="button"
                      variant="destructive"
                      size="sm"
                      className="absolute top-1 right-1 h-6 w-6 p-0"
                      onClick={() => setPhotos((prev) => prev.filter((_, i) => i !== index))}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
                <div className="flex items-center justify-center border-2 border-dashed border-gray-300 rounded-md h-32">
                  <label className="flex flex-col items-center cursor-pointer">
                    <ImageIcon className="h-8 w-8 text-gray-400" />
                    <span className="mt-2 text-sm text-gray-500">Upload a photo</span>
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={handlePhotoUpload}
                    />
                  </label>
                </div>
              </div>
            </div>
          </TabsContent>
        </Tabs>

        <div className="flex justify-end gap-2 mt-4">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleSubmit}>
            Save Check-in
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default CheckInForm;
