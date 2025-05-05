
import { useState, useEffect } from 'react';
import { Venue } from '@/types';
import { useWishlist } from '@/hooks/useWishlist';
import VenueCard from '../components/VenueCard';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tags, Plus, X, Filter, ListFilter } from 'lucide-react';
import VenueFilters from '@/components/VenueFilters';
import { FilterOptions } from '@/components/VenueFilters';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '@/components/ui/dialog';
import { filterVenues, extractCategories, extractTags } from '@/utils/filterUtils';
import { toast } from 'sonner';

const WishlistView = () => {
  const { wishlistVenues, categories, tags, updateWishlistItem, removeFromWishlist } = useWishlist();
  const [filteredVenues, setFilteredVenues] = useState<Venue[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [filters, setFilters] = useState<FilterOptions>({
    rating: 'all',
    category: 'all',
    tags: []
  });
  const [addCategoryOpen, setAddCategoryOpen] = useState(false);
  const [newCategory, setNewCategory] = useState('');
  const [newTag, setNewTag] = useState('');
  const [editingVenueId, setEditingVenueId] = useState<string | null>(null);
  const [editingVenueTags, setEditingVenueTags] = useState<string[]>([]);
  const [editingVenueCategory, setEditingVenueCategory] = useState<string>('');

  // Update filtered venues when wishlist or filters change
  useEffect(() => {
    const filtered = filterWishlistVenues(wishlistVenues, filters);
    setFilteredVenues(filtered);
  }, [wishlistVenues, filters]);

  // Custom filter function for wishlist
  const filterWishlistVenues = (venues: Venue[], options: FilterOptions): Venue[] => {
    return venues.filter(venue => {
      // Filter by category
      if (options.category && options.category !== 'all') {
        if (venue.wishlistCategory !== options.category) return false;
      }

      // Filter by tags
      if (options.tags && options.tags.length > 0) {
        const venueTags = venue.wishlistTags || [];
        // Check if any of the selected tags are in the venue tags
        if (!options.tags.some(tag => venueTags.includes(tag))) return false;
      }

      return true;
    });
  };

  // Handle filter changes
  const handleFilterChange = (newFilters: FilterOptions) => {
    setFilters(newFilters);
  };

  // Open edit dialog for venue
  const openEditDialog = (venue: Venue) => {
    setEditingVenueId(venue.id);
    setEditingVenueTags(venue.wishlistTags || []);
    setEditingVenueCategory(venue.wishlistCategory || '');
  };

  // Save edited venue
  const saveVenueChanges = () => {
    if (editingVenueId) {
      updateWishlistItem(editingVenueId, {
        tags: editingVenueTags,
        category: editingVenueCategory || undefined
      });
      
      setEditingVenueId(null);
      toast.success("Venue updated successfully");
    }
  };

  // Add tag to editing venue
  const addTagToVenue = () => {
    if (!newTag.trim()) return;
    
    if (!editingVenueTags.includes(newTag.trim())) {
      setEditingVenueTags([...editingVenueTags, newTag.trim()]);
    }
    
    setNewTag('');
  };

  // Remove tag from editing venue
  const removeTagFromVenue = (tag: string) => {
    setEditingVenueTags(editingVenueTags.filter(t => t !== tag));
  };

  // Create a new category
  const createNewCategory = () => {
    if (!newCategory.trim()) return;
    
    // Find a venue to update with the new category
    if (editingVenueId) {
      setEditingVenueCategory(newCategory.trim());
    }
    
    setNewCategory('');
    setAddCategoryOpen(false);
  };

  return (
    <div className="px-4 pt-6 pb-24">
      <h1 className="text-2xl font-bold mb-4">Your Wishlist</h1>
      
      {/* Filters */}
      <VenueFilters 
        onFilterChange={handleFilterChange} 
        categories={categories} 
        tags={tags}
      />
      
      {/* Empty state */}
      {wishlistVenues.length === 0 && (
        <div className="flex flex-col items-center justify-center py-10 text-center">
          <Tags className="w-16 h-16 text-gray-400 mb-4" />
          <h2 className="text-xl font-semibold mb-2">Your wishlist is empty</h2>
          <p className="text-gray-500 mb-4">Add venues you'd like to visit in the future</p>
          <Button>Explore Venues</Button>
        </div>
      )}
      
      {/* Filtered venues count */}
      {wishlistVenues.length > 0 && (
        <div className="flex items-center justify-between mb-4">
          <p className="text-sm text-gray-500">
            Showing {filteredVenues.length} of {wishlistVenues.length} venues
          </p>
          
          {/* Sort options would go here */}
        </div>
      )}
      
      {/* Venues grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredVenues.map((venue) => (
          <div key={venue.id} className="relative">
            <VenueCard venue={venue} lastVisit={venue.lastVisit} />
            
            {/* Wishlist actions */}
            <div className="absolute top-2 right-2 flex gap-2">
              <Button 
                variant="outline" 
                size="icon" 
                className="bg-white h-8 w-8"
                onClick={() => openEditDialog(venue)}
              >
                <ListFilter className="h-4 w-4" />
              </Button>
              
              <Button 
                variant="outline" 
                size="icon" 
                className="bg-white h-8 w-8"
                onClick={() => removeFromWishlist(venue.id)}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
            
            {/* Display wishlist info */}
            {(venue.wishlistCategory || (venue.wishlistTags && venue.wishlistTags.length > 0)) && (
              <div className="absolute bottom-2 left-2 right-2 bg-black bg-opacity-60 rounded-md p-2">
                {venue.wishlistCategory && (
                  <span className="inline-block bg-visitvibe-primary text-white text-xs px-2 py-1 rounded-full mr-1 mb-1">
                    {venue.wishlistCategory}
                  </span>
                )}
                {venue.wishlistTags && venue.wishlistTags.map(tag => (
                  <span key={tag} className="inline-block bg-gray-700 text-white text-xs px-2 py-1 rounded-full mr-1 mb-1">
                    {tag}
                  </span>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
      
      {/* Edit venue dialog */}
      <Dialog open={!!editingVenueId} onOpenChange={(open) => !open && setEditingVenueId(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Venue</DialogTitle>
          </DialogHeader>
          
          <div className="grid gap-4 py-4">
            {/* Category selector */}
            <div>
              <Label htmlFor="category">Category</Label>
              <div className="flex gap-2">
                <Select value={editingVenueCategory} onValueChange={setEditingVenueCategory}>
                  <SelectTrigger className="flex-1">
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">None</SelectItem>
                    {categories.map(category => (
                      <SelectItem key={category} value={category}>{category}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Button variant="outline" onClick={() => setAddCategoryOpen(true)} size="icon">
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
            </div>
            
            {/* Tags section */}
            <div>
              <Label htmlFor="tags">Tags</Label>
              <div className="flex gap-2 flex-wrap mb-2">
                {editingVenueTags.map(tag => (
                  <span key={tag} className="flex items-center gap-1 bg-gray-100 px-3 py-1 rounded-full text-sm">
                    {tag}
                    <button onClick={() => removeTagFromVenue(tag)}>
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
                  onKeyDown={(e) => e.key === 'Enter' && addTagToVenue()} 
                />
                <Button variant="outline" onClick={addTagToVenue}>
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditingVenueId(null)}>Cancel</Button>
            <Button onClick={saveVenueChanges}>Save Changes</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Add category dialog */}
      <Dialog open={addCategoryOpen} onOpenChange={setAddCategoryOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create New Category</DialogTitle>
          </DialogHeader>
          
          <div className="grid gap-4 py-4">
            <div>
              <Label htmlFor="categoryName">Category Name</Label>
              <Input 
                id="categoryName" 
                value={newCategory} 
                onChange={(e) => setNewCategory(e.target.value)}
                placeholder="e.g., Date Night, Family Dinner" 
              />
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setAddCategoryOpen(false)}>Cancel</Button>
            <Button onClick={createNewCategory}>Create Category</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default WishlistView;
