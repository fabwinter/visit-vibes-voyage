
import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Textarea } from './ui/textarea';
import StarRating from './StarRating';
import { Label } from './ui/label';
import { Venue, Visit } from '@/types';
import { Camera, ArrowRight, Smile, Utensils, DollarSign, Users, Music } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { v4 as uuidv4 } from 'uuid';
import { toast } from 'sonner';
import { Checkbox } from './ui/checkbox';

interface CheckInFormProps {
  venue: Venue;
  isOpen: boolean;
  onClose: () => void;
  onCheckIn: (visit: Visit) => void;
  initialVisit?: Visit;
}

const CheckInForm = ({ venue, isOpen, onClose, onCheckIn, initialVisit }: CheckInFormProps) => {
  const [activeTab, setActiveTab] = useState("basic");
  const [notes, setNotes] = useState(initialVisit?.notes || "");
  const [dishName, setDishName] = useState("");
  const [dishPrice, setDishPrice] = useState("");
  const [dishRating, setDishRating] = useState(0);
  const [dishPhoto, setDishPhoto] = useState<string | null>(null);
  const [dishNotes, setDishNotes] = useState("");
  const { user } = useAuth();
  const [wouldVisitAgain, setWouldVisitAgain] = useState<boolean>(initialVisit?.wouldVisitAgain || false);
  
  // Ratings
  const [foodRating, setFoodRating] = useState(initialVisit?.rating.food || 0);
  const [serviceRating, setServiceRating] = useState(initialVisit?.rating.service || 0);
  const [ambianceRating, setAmbianceRating] = useState(initialVisit?.rating.ambiance || 0);
  const [valueRating, setValueRating] = useState(initialVisit?.rating.value || 0);
  
  // Tags
  const [selectedTags, setSelectedTags] = useState<string[]>(initialVisit?.tags || []);
  
  const availableTags = [
    { id: "date-night", label: "Date Night", icon: <Smile className="h-4 w-4" /> },
    { id: "family-friendly", label: "Family Friendly", icon: <Users className="h-4 w-4" /> },
    { id: "great-food", label: "Great Food", icon: <Utensils className="h-4 w-4" /> },
    { id: "value", label: "Good Value", icon: <DollarSign className="h-4 w-4" /> },
    { id: "good-vibes", label: "Good Vibes", icon: <Music className="h-4 w-4" /> },
  ];
  
  const toggleTag = (tagId: string) => {
    if (selectedTags.includes(tagId)) {
      setSelectedTags(selectedTags.filter(id => id !== tagId));
    } else {
      setSelectedTags([...selectedTags, tagId]);
    }
  };
  
  // Overall rating calculation
  const calculateOverallRating = () => {
    let sum = 0;
    let count = 0;
    
    if (foodRating > 0) { sum += foodRating; count++; }
    if (serviceRating > 0) { sum += serviceRating; count++; }
    if (ambianceRating > 0) { sum += ambianceRating; count++; }
    if (valueRating > 0) { sum += valueRating; count++; }
    
    return count > 0 ? Math.round((sum / count) * 10) / 10 : 0;
  };
  
  // Handle image upload
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          setDishPhoto(event.target.result.toString());
        }
      };
      reader.readAsDataURL(file);
    }
  };
  
  // Handle check-in submission
  const handleSubmit = () => {
    if (!user) {
      toast.error("You must be signed in to check in");
      return;
    }
    
    // Create dishes array if dish info provided
    const dishes = [];
    if (dishName) {
      dishes.push({
        id: uuidv4(),
        name: dishName,
        price: dishPrice ? parseFloat(dishPrice) : undefined,
        rating: dishRating,
        photos: dishPhoto ? [dishPhoto] : [],
        tags: [],
        type: 'dish'
      });
    }
    
    // Create visit object
    const visit: Visit = {
      id: initialVisit?.id || uuidv4(),
      venueId: venue.id,
      venueName: venue.name,
      venueAddress: venue.address,
      timestamp: initialVisit?.timestamp || new Date().toISOString(),
      notes: notes,
      dishes: initialVisit?.dishes || dishes,
      photos: dishPhoto ? [dishPhoto] : (initialVisit?.photos || []),
      tags: selectedTags,
      wouldVisitAgain,
      rating: {
        food: foodRating,
        service: serviceRating,
        ambiance: ambianceRating,
        value: valueRating,
        overall: calculateOverallRating()
      }
    };
    
    onCheckIn(visit);
  };
  
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl">Check in at {venue.name}</DialogTitle>
        </DialogHeader>
        
        <Tabs defaultValue="basic" value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="basic">Basic</TabsTrigger>
            <TabsTrigger value="rating">Rating</TabsTrigger>
            <TabsTrigger value="dish">Add Dish</TabsTrigger>
          </TabsList>
          
          <TabsContent value="basic" className="space-y-4 pt-4">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="notes">Visit Notes</Label>
                <span className="text-xs text-gray-500">{notes.length}/280</span>
              </div>
              <Textarea 
                id="notes"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="How was your visit?"
                maxLength={280}
                rows={4}
              />
            </div>
            
            <div className="space-y-2">
              <Label>Tags</Label>
              <div className="flex flex-wrap gap-2">
                {availableTags.map(tag => (
                  <Button
                    key={tag.id}
                    type="button"
                    variant={selectedTags.includes(tag.id) ? "default" : "outline"}
                    size="sm"
                    onClick={() => toggleTag(tag.id)}
                    className="flex items-center gap-1"
                  >
                    {tag.icon}
                    <span>{tag.label}</span>
                  </Button>
                ))}
              </div>
            </div>
            
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Checkbox 
                  id="would-visit-again" 
                  checked={wouldVisitAgain} 
                  onCheckedChange={(checked) => setWouldVisitAgain(checked as boolean)}
                />
                <Label htmlFor="would-visit-again">I would visit again</Label>
              </div>
            </div>
            
            <div className="flex justify-between pt-4">
              <Button variant="outline" onClick={onClose}>Cancel</Button>
              <Button onClick={() => setActiveTab("rating")}>
                Next
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
          </TabsContent>
          
          <TabsContent value="rating" className="space-y-4 pt-4">
            <div className="space-y-4">
              <div className="space-y-1">
                <Label htmlFor="food-rating">Food & Drink Quality</Label>
                <StarRating 
                  id="food-rating"
                  value={foodRating}
                  onChange={setFoodRating}
                  size="md"
                />
              </div>
              
              <div className="space-y-1">
                <Label htmlFor="service-rating">Service</Label>
                <StarRating 
                  id="service-rating"
                  value={serviceRating}
                  onChange={setServiceRating}
                  size="md"
                />
              </div>
              
              <div className="space-y-1">
                <Label htmlFor="ambiance-rating">Ambiance & Atmosphere</Label>
                <StarRating 
                  id="ambiance-rating"
                  value={ambianceRating}
                  onChange={setAmbianceRating}
                  size="md"
                />
              </div>
              
              <div className="space-y-1">
                <Label htmlFor="value-rating">Value for Money</Label>
                <StarRating 
                  id="value-rating"
                  value={valueRating}
                  onChange={setValueRating}
                  size="md"
                />
              </div>
              
              <div className="pt-2 border-t">
                <div className="flex justify-between items-center">
                  <Label>Overall Rating</Label>
                  <span className="text-lg font-semibold">
                    {calculateOverallRating() > 0 ? calculateOverallRating() : '-'}
                  </span>
                </div>
              </div>
            </div>
            
            <div className="flex justify-between pt-4">
              <Button variant="outline" onClick={() => setActiveTab("basic")}>Back</Button>
              <Button onClick={() => setActiveTab("dish")}>
                Next
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
          </TabsContent>
          
          <TabsContent value="dish" className="space-y-4 pt-4">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="dish-name">Dish Name</Label>
                <Input
                  id="dish-name"
                  value={dishName}
                  onChange={(e) => setDishName(e.target.value)}
                  placeholder="What did you have?"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="dish-price">Price</Label>
                <Input
                  id="dish-price"
                  type="number"
                  value={dishPrice}
                  onChange={(e) => setDishPrice(e.target.value)}
                  placeholder="0.00"
                  step="0.01"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="dish-rating">Dish Rating</Label>
                <StarRating
                  id="dish-rating"
                  value={dishRating}
                  onChange={setDishRating}
                  size="md"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="dish-photo">Add Photo</Label>
                <div className="flex flex-col items-center p-4 border-2 border-dashed rounded-md">
                  {dishPhoto ? (
                    <div className="relative w-full">
                      <img 
                        src={dishPhoto} 
                        alt="Dish preview" 
                        className="w-full h-auto rounded-md object-cover max-h-48"
                      />
                      <Button
                        type="button"
                        variant="destructive"
                        size="sm"
                        className="absolute top-2 right-2"
                        onClick={() => setDishPhoto(null)}
                      >
                        Remove
                      </Button>
                    </div>
                  ) : (
                    <label htmlFor="dish-photo-input" className="cursor-pointer flex flex-col items-center">
                      <Camera className="h-8 w-8 mb-2 text-gray-400" />
                      <span className="text-sm text-gray-500">Click to add photo</span>
                      <input
                        id="dish-photo-input"
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={handleImageUpload}
                      />
                    </label>
                  )}
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="dish-notes">Dish Notes</Label>
                <Textarea
                  id="dish-notes"
                  value={dishNotes}
                  onChange={(e) => setDishNotes(e.target.value)}
                  placeholder="Thoughts about this dish..."
                  rows={2}
                />
              </div>
            </div>
            
            <div className="flex justify-between pt-4">
              <Button variant="outline" onClick={() => setActiveTab("rating")}>Back</Button>
              <Button onClick={handleSubmit}>Check In</Button>
            </div>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
};

export default CheckInForm;
