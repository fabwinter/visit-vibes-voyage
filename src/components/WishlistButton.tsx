
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tags, Plus, X } from 'lucide-react';
import { Venue } from '@/types';
import { useWishlist } from '@/hooks/useWishlist';
import { useAuthContext } from '@/hooks/useAuthContext';
import { toast } from 'sonner';

interface WishlistButtonProps {
  venue: Venue;
  type?: 'icon' | 'full';
  className?: string;
}

const WishlistButton = ({ venue, type = 'full', className = '' }: WishlistButtonProps) => {
  const { isInWishlist, addToWishlist, removeFromWishlist, categories } = useWishlist();
  const { isAuthenticated, setShowAuthModal } = useAuthContext();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [customTags, setCustomTags] = useState<string[]>([]);
  const [newTag, setNewTag] = useState('');
  
  const venueInWishlist = isInWishlist(venue.id);
  
  const handleAddToWishlist = () => {
    if (!isAuthenticated) {
      toast.error("Please sign in to use the wishlist feature");
      setShowAuthModal(true);
      return;
    }

    if (venueInWishlist) {
      removeFromWishlist(venue.id);
    } else {
      setDialogOpen(true);
    }
  };
  
  const handleConfirmAdd = () => {
    addToWishlist(venue, customTags, selectedCategory || undefined);
    setDialogOpen(false);
    resetForm();
  };
  
  const addTag = () => {
    if (newTag.trim() && !customTags.includes(newTag.trim())) {
      setCustomTags([...customTags, newTag.trim()]);
      setNewTag('');
    }
  };
  
  const removeTag = (tag: string) => {
    setCustomTags(customTags.filter(t => t !== tag));
  };
  
  const resetForm = () => {
    setSelectedCategory('');
    setCustomTags([]);
    setNewTag('');
  };
  
  if (type === 'icon') {
    return (
      <>
        <Button
          variant="outline"
          size="icon"
          className={`h-8 w-8 ${className}`}
          onClick={handleAddToWishlist}
        >
          <Tags className={`h-4 w-4 ${venueInWishlist ? 'fill-visitvibe-primary' : ''}`} />
        </Button>
        
        <AddToWishlistDialog
          open={dialogOpen}
          onOpenChange={setDialogOpen}
          categories={categories}
          selectedCategory={selectedCategory}
          setSelectedCategory={setSelectedCategory}
          customTags={customTags}
          newTag={newTag}
          setNewTag={setNewTag}
          onAddTag={addTag}
          onRemoveTag={removeTag}
          onConfirm={handleConfirmAdd}
        />
      </>
    );
  }
  
  return (
    <>
      <Button
        variant={venueInWishlist ? "secondary" : "outline"}
        size="sm"
        className={`${className}`}
        onClick={handleAddToWishlist}
      >
        <Tags className={`h-4 w-4 mr-2 ${venueInWishlist ? 'fill-current' : ''}`} />
        {venueInWishlist ? "Remove from Wishlist" : "Add to Wishlist"}
      </Button>
      
      <AddToWishlistDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        categories={categories}
        selectedCategory={selectedCategory}
        setSelectedCategory={setSelectedCategory}
        customTags={customTags}
        newTag={newTag}
        setNewTag={setNewTag}
        onAddTag={addTag}
        onRemoveTag={removeTag}
        onConfirm={handleConfirmAdd}
      />
    </>
  );
};

interface AddToWishlistDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  categories: string[];
  selectedCategory: string;
  setSelectedCategory: (category: string) => void;
  customTags: string[];
  newTag: string;
  setNewTag: (tag: string) => void;
  onAddTag: () => void;
  onRemoveTag: (tag: string) => void;
  onConfirm: () => void;
}

const AddToWishlistDialog = ({
  open,
  onOpenChange,
  categories,
  selectedCategory,
  setSelectedCategory,
  customTags,
  newTag,
  setNewTag,
  onAddTag,
  onRemoveTag,
  onConfirm
}: AddToWishlistDialogProps) => (
  <Dialog open={open} onOpenChange={onOpenChange}>
    <DialogContent>
      <DialogHeader>
        <DialogTitle>Add to Wishlist</DialogTitle>
      </DialogHeader>
      
      <div className="grid gap-4 py-4">
        {/* Category selector */}
        <div className="flex flex-col gap-2">
          <Label htmlFor="category">Category (optional)</Label>
          <Select value={selectedCategory} onValueChange={setSelectedCategory}>
            <SelectTrigger>
              <SelectValue placeholder="Select a category" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">None</SelectItem>
              {categories.map(category => (
                <SelectItem key={category} value={category}>{category}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        
        {/* Tags */}
        <div className="flex flex-col gap-2">
          <Label htmlFor="tags">Tags (optional)</Label>
          <div className="flex gap-2 flex-wrap mb-2">
            {customTags.map(tag => (
              <span key={tag} className="flex items-center gap-1 bg-gray-100 px-3 py-1 rounded-full text-sm">
                {tag}
                <button onClick={() => onRemoveTag(tag)}>
                  <X className="h-3 w-3" />
                </button>
              </span>
            ))}
          </div>
          <div className="flex gap-2">
            <Input 
              value={newTag} 
              onChange={(e) => setNewTag(e.target.value)}
              placeholder="Add tag" 
              className="flex-1"
              onKeyDown={(e) => e.key === 'Enter' && onAddTag()} 
            />
            <Button variant="outline" onClick={onAddTag} type="button">
              <Plus className="h-4 w-4" />
            </Button>
          </div>
          <p className="text-xs text-gray-500 mt-1">
            Suggestions: Date Night, Family-Friendly, Business, Casual, Special Occasion
          </p>
        </div>
      </div>
      
      <DialogFooter>
        <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
        <Button onClick={onConfirm}>Add to Wishlist</Button>
      </DialogFooter>
    </DialogContent>
  </Dialog>
);

export default WishlistButton;
