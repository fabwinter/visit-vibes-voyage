
import { useState, useEffect } from 'react';
import { Visit, Venue } from '@/types';
import { useNavigate } from 'react-router-dom';
import { Edit, Trash, Search, Filter, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import CheckInButton from '@/components/CheckInButton';
import CheckInForm from '@/components/CheckInForm';
import { useIsMobile } from '@/hooks/use-mobile';
import { useVenues } from '@/hooks/useVenues';
import { toast } from 'sonner';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';

const VisitsView = () => {
  const [visits, setVisits] = useState<Visit[]>([]);
  const [venues, setVenues] = useState<Venue[]>([]);
  const [selectedVenue, setSelectedVenue] = useState<Venue | null>(null);
  const [isCheckInOpen, setIsCheckInOpen] = useState(false);
  const [editingVisit, setEditingVisit] = useState<Visit | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [visitToDelete, setVisitToDelete] = useState<string | null>(null);
  
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  const { processCheckIn } = useVenues();
  
  // Load visits and venues from localStorage
  useEffect(() => {
    const storedVisits = localStorage.getItem('visits');
    if (storedVisits) {
      try {
        const parsedVisits = JSON.parse(storedVisits);
        setVisits(parsedVisits);
      } catch (error) {
        console.error("Failed to parse visits", error);
        toast.error("Failed to load visits");
      }
    }
    
    const storedVenues = localStorage.getItem('venues');
    if (storedVenues) {
      try {
        setVenues(JSON.parse(storedVenues));
      } catch (error) {
        console.error("Failed to parse venues", error);
        toast.error("Failed to load venues");
      }
    }
  }, []);
  
  // Filter visits based on search term
  const filteredVisits = visits.filter(visit => {
    if (!searchTerm) return true;
    const searchLower = searchTerm.toLowerCase();
    
    // Find the venue for this visit
    const venue = venues.find(v => v.id === visit.venueId);
    
    // Check if venue name, address, or visit tags match search
    return (
      venue?.name?.toLowerCase().includes(searchLower) ||
      venue?.address?.toLowerCase().includes(searchLower) ||
      visit.tags?.some(tag => tag.toLowerCase().includes(searchLower)) ||
      visit.dishes?.some(dish => 
        dish.name.toLowerCase().includes(searchLower) ||
        dish.tags?.some(tag => tag.toLowerCase().includes(searchLower))
      )
    );
  });
  
  // Sort visits by date (newest first)
  const sortedVisits = [...filteredVisits].sort((a, b) => {
    return new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime();
  });
  
  // Handle check-in form submission
  const handleCheckIn = (visit: Visit) => {
    processCheckIn(visit);
    setIsCheckInOpen(false);
    
    // Update local state
    if (editingVisit) {
      setVisits(prev => prev.map(v => v.id === visit.id ? visit : v));
      setEditingVisit(null);
      toast.success("Check-in updated!");
    } else {
      setVisits(prev => [visit, ...prev]);
      toast.success("Check-in added!");
    }
  };
  
  // View visit details
  const viewVisitDetails = (visitId: string) => {
    navigate(`/visit/${visitId}`);
  };
  
  // Edit visit
  const editVisit = (visit: Visit) => {
    const venue = venues.find(v => v.id === visit.venueId);
    if (venue) {
      setSelectedVenue(venue);
      setEditingVisit(visit);
      setIsCheckInOpen(true);
    } else {
      toast.error("Could not find venue information");
    }
  };
  
  // Confirm delete visit
  const confirmDeleteVisit = (visitId: string) => {
    setVisitToDelete(visitId);
    setDeleteConfirmOpen(true);
  };
  
  // Delete visit
  const deleteVisit = () => {
    if (!visitToDelete) return;
    
    const updatedVisits = visits.filter(visit => visit.id !== visitToDelete);
    setVisits(updatedVisits);
    
    // Update localStorage
    localStorage.setItem('visits', JSON.stringify(updatedVisits));
    
    setDeleteConfirmOpen(false);
    setVisitToDelete(null);
    toast.success("Visit deleted successfully");
  };
  
  // Open check-in form for a new visit
  const openNewCheckIn = () => {
    // This will be implemented once we have a venue search component
    toast.info("Feature coming soon", {
      description: "You'll be able to add check-ins directly from here soon"
    });
  };
  
  // Format date
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    }).format(date);
  };
  
  // Find venue name
  const getVenueName = (venueId: string) => {
    const venue = venues.find(v => v.id === venueId);
    return venue?.name || 'Unknown Venue';
  };
  
  // Group visits by month
  const groupedVisits: Record<string, Visit[]> = {};
  
  sortedVisits.forEach(visit => {
    const date = new Date(visit.timestamp);
    const monthYear = date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
    
    if (!groupedVisits[monthYear]) {
      groupedVisits[monthYear] = [];
    }
    
    groupedVisits[monthYear].push(visit);
  });
  
  return (
    <div className="container px-4 py-6 md:py-8">
      <header className="mb-6">
        <div className="flex justify-between items-center mb-4">
          <h1 className="text-2xl font-bold">Your Visits</h1>
          <Button 
            variant="outline" 
            size="sm"
            onClick={openNewCheckIn}
            className="flex items-center gap-1"
          >
            <Plus className="h-4 w-4" />
            <span>New</span>
          </Button>
        </div>
        
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input 
            className="pl-9 pr-4" 
            placeholder="Search visits..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </header>
      
      {Object.keys(groupedVisits).length > 0 ? (
        <div className="space-y-6">
          {Object.entries(groupedVisits).map(([monthYear, monthVisits]) => (
            <div key={monthYear}>
              <h2 className="text-lg font-semibold mb-3">{monthYear}</h2>
              <div className="space-y-3">
                {monthVisits.map(visit => {
                  const venueName = getVenueName(visit.venueId);
                  
                  return (
                    <div 
                      key={visit.id} 
                      className="bg-white rounded-lg shadow p-4 hover:shadow-md transition-shadow"
                      onClick={() => viewVisitDetails(visit.id)}
                    >
                      <div className="flex justify-between">
                        <div>
                          <h3 className="font-medium text-lg">{venueName}</h3>
                          <p className="text-sm text-gray-500">{formatDate(visit.timestamp)}</p>
                        </div>
                        <div className="flex items-start space-x-1">
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            className="h-8 w-8"
                            onClick={(e) => {
                              e.stopPropagation();
                              editVisit(visit);
                            }}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            className="h-8 w-8 text-red-500"
                            onClick={(e) => {
                              e.stopPropagation();
                              confirmDeleteVisit(visit.id);
                            }}
                          >
                            <Trash className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                      
                      {/* Visit rating */}
                      <div className="flex items-center mt-1">
                        <div className="flex items-center">
                          <div className="bg-yellow-100 text-yellow-700 font-medium px-2 py-1 rounded text-sm">
                            {visit.rating.overall.toFixed(1)}★
                          </div>
                        </div>
                        
                        {/* Dishes count */}
                        <div className="ml-3 text-sm text-gray-500">
                          {visit.dishes?.length || 0} item{visit.dishes?.length !== 1 ? 's' : ''}
                        </div>
                        
                        {/* Would go again */}
                        {visit.wouldVisitAgain !== undefined && (
                          <div className={`ml-3 text-sm px-2 py-0.5 rounded-full ${
                            visit.wouldVisitAgain 
                              ? 'bg-green-100 text-green-700' 
                              : 'bg-red-100 text-red-700'
                          }`}>
                            {visit.wouldVisitAgain ? 'Would go again' : 'Would not return'}
                          </div>
                        )}
                      </div>
                      
                      {/* Tags */}
                      {visit.tags && visit.tags.length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-2">
                          {visit.tags.slice(0, 3).map(tag => (
                            <span 
                              key={tag} 
                              className="bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full text-xs"
                            >
                              {tag}
                            </span>
                          ))}
                          {visit.tags.length > 3 && (
                            <span className="text-xs text-gray-500">
                              +{visit.tags.length - 3}
                            </span>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-10">
          <p className="text-gray-500 mb-4">No visits yet. Start checking in to places you visit!</p>
          <Button onClick={() => navigate('/')}>Discover Places</Button>
        </div>
      )}
      
      {/* Floating button for mobile */}
      {isMobile && (
        <CheckInButton 
          className="fixed right-4 bottom-20 w-12 h-12 shadow-lg"
          onClick={openNewCheckIn}
        />
      )}
      
      {/* Check-in form */}
      {selectedVenue && (
        <CheckInForm
          venue={selectedVenue}
          isOpen={isCheckInOpen}
          onClose={() => {
            setIsCheckInOpen(false);
            setSelectedVenue(null);
            setEditingVisit(null);
          }}
          onCheckIn={handleCheckIn}
          initialVisit={editingVisit || undefined}
        />
      )}
      
      {/* Delete confirmation dialog */}
      <Dialog open={deleteConfirmOpen} onOpenChange={setDeleteConfirmOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Visit</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this visit? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteConfirmOpen(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={deleteVisit}>
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default VisitsView;
