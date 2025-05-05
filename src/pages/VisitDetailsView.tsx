import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Visit, Venue } from '@/types';
import { format } from 'date-fns';
import StarRating from '@/components/StarRating';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Globe, Phone, Clock, MapPin, Share2, Check, X } from 'lucide-react';
import { toast } from 'sonner';
import { mockVenues } from '@/data/mockData';

const VisitDetailsView = () => {
  const { visitId } = useParams<{ visitId: string }>();
  const navigate = useNavigate();
  const [visit, setVisit] = useState<Visit | null>(null);
  const [venue, setVenue] = useState<Venue | null>(null);
  const [loading, setLoading] = useState(true);

  // Load visit and venue data
  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      
      // Load visits from localStorage
      const storedVisits = localStorage.getItem('visits');
      if (storedVisits) {
        const allVisits: Visit[] = JSON.parse(storedVisits);
        const foundVisit = allVisits.find(v => v.id === visitId);
        
        if (foundVisit) {
          setVisit(foundVisit);
          
          // Load venue information
          const storedVenues = localStorage.getItem('venues');
          let venueData = null;
          
          if (storedVenues) {
            const allVenues: Venue[] = JSON.parse(storedVenues);
            venueData = allVenues.find(v => v.id === foundVisit.venueId);
          }
          
          if (!venueData) {
            // Fall back to mock data if venue not found in localStorage
            venueData = mockVenues.find(v => v.id === foundVisit.venueId) || null;
          }
          
          setVenue(venueData);
        }
      }
      
      setLoading(false);
    };
    
    loadData();
  }, [visitId]);

  // Handle sharing
  const handleShare = () => {
    if (!visit || !venue) return;
    
    if (navigator.share) {
      navigator.share({
        title: `My visit to ${venue.name}`,
        text: `I visited ${venue.name} on ${format(new Date(visit.timestamp), 'MMM d, yyyy')} and rated it ${visit.rating.overall}/5`,
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

  // Open map with venue location
  const openInMap = () => {
    if (!venue) return;
    navigate('/', { state: { selectedVenueId: venue.id } });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-132px)]">
        <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-visitvibe-primary border-r-transparent align-[-0.125em] motion-reduce:animate-[spin_1.5s_linear_infinite]"></div>
      </div>
    );
  }

  if (!visit || !venue) {
    return (
      <div className="px-4 pt-6 pb-24">
        <Button variant="ghost" onClick={() => navigate('/visits')} className="mb-4">
          <ArrowLeft className="mr-2 h-4 w-4" /> Back to Visits
        </Button>
        <div className="text-center py-12">
          <h2 className="text-xl font-bold mb-4">Visit Not Found</h2>
          <p className="text-gray-600 mb-6">The visit you're looking for doesn't exist or has been removed.</p>
          <Button onClick={() => navigate('/visits')}>
            Return to Visits
          </Button>
        </div>
      </div>
    );
  }

  const visitDate = new Date(visit.timestamp);

  return (
    <div className="px-4 pt-6 pb-24">
      {/* Back button */}
      <Button variant="ghost" onClick={() => navigate('/visits')} className="mb-4">
        <ArrowLeft className="mr-2 h-4 w-4" /> Back to Visits
      </Button>
      
      {/* Venue info */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold mb-2">{venue.name}</h1>
        <p className="text-gray-600 flex items-center mb-2">
          <MapPin className="h-4 w-4 mr-1" /> {venue.address}
        </p>
        
        <div className="flex flex-wrap gap-2 mb-4">
          {venue.website && (
            <a 
              href={venue.website} 
              target="_blank" 
              rel="noopener noreferrer"
              className="inline-flex items-center px-3 py-1 rounded-full bg-visitvibe-primary/10 text-visitvibe-primary text-sm"
            >
              <Globe className="h-3 w-3 mr-1" /> Website
            </a>
          )}
          {venue.phoneNumber && (
            <a 
              href={`tel:${venue.phoneNumber}`}
              className="inline-flex items-center px-3 py-1 rounded-full bg-visitvibe-primary/10 text-visitvibe-primary text-sm"
            >
              <Phone className="h-3 w-3 mr-1" /> {venue.phoneNumber}
            </a>
          )}
          {venue.hours && (
            <div className="inline-flex items-center px-3 py-1 rounded-full bg-visitvibe-primary/10 text-visitvibe-primary text-sm">
              <Clock className="h-3 w-3 mr-1" /> Hours Available
            </div>
          )}
          <button 
            onClick={openInMap}
            className="inline-flex items-center px-3 py-1 rounded-full bg-visitvibe-primary/10 text-visitvibe-primary text-sm"
          >
            <MapPin className="h-3 w-3 mr-1" /> View on Map
          </button>
        </div>
        
        {/* Venue photo gallery */}
        {venue.photos && venue.photos.length > 0 && (
          <div className="mb-6">
            <div className="aspect-video rounded-lg overflow-hidden">
              <img 
                src={venue.photos[0]} 
                alt={venue.name} 
                className="w-full h-full object-cover"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = 'https://placehold.co/600x400?text=No+Image';
                }}
              />
            </div>
            {venue.photos.length > 1 && (
              <div className="flex gap-2 mt-2 overflow-x-auto pb-2">
                {venue.photos.slice(1).map((photo, index) => (
                  <div key={index} className="w-24 h-24 flex-shrink-0 rounded-md overflow-hidden">
                    <img 
                      src={photo} 
                      alt={`${venue.name} ${index + 2}`}
                      className="w-full h-full object-cover" 
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = 'https://placehold.co/600x400?text=No+Image';
                      }}
                    />
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {venue.category && venue.category.length > 0 && (
          <div className="flex flex-wrap gap-1 mb-4">
            {venue.category.map((cat) => (
              <span key={cat} className="tag-badge">
                {cat.replace(/_/g, ' ')}
              </span>
            ))}
          </div>
        )}
      </div>
      
      {/* Visit details */}
      <div className="mb-6">
        <div className="flex justify-between items-center mb-2">
          <h2 className="text-xl font-semibold">Visit Details</h2>
          <time dateTime={visitDate.toISOString()} className="text-sm text-gray-500">
            {format(visitDate, 'EEEE, MMMM d, yyyy')}
          </time>
        </div>
        <p className="text-sm text-gray-500 mb-4">
          {format(visitDate, 'h:mm a')}
        </p>
        
        {/* Overall rating */}
        <div className="p-4 bg-white rounded-lg shadow-sm mb-4 border">
          <div className="flex justify-between items-center mb-2">
            <span className="text-gray-700 font-medium">Overall Rating</span>
            <StarRating rating={visit.rating.overall} size="lg" />
          </div>
          
          {/* Would visit again */}
          {visit.wouldVisitAgain !== undefined && (
            <div className={`flex items-center gap-2 mt-3 p-2 rounded-md ${
              visit.wouldVisitAgain 
                ? 'bg-green-50 text-green-700' 
                : 'bg-red-50 text-red-700'
            }`}>
              {visit.wouldVisitAgain 
                ? <Check className="w-5 h-5" /> 
                : <X className="w-5 h-5" />
              }
              <span>
                {visit.wouldVisitAgain 
                  ? 'Would visit again' 
                  : 'Would not visit again'
                }
              </span>
            </div>
          )}
        </div>
        
        {/* Detailed ratings */}
        <div className="grid grid-cols-2 gap-4 mb-6">
          <div className="p-4 bg-white rounded-lg shadow-sm border">
            <span className="block text-gray-700 font-medium mb-1">Food</span>
            <StarRating rating={visit.rating.food} size="md" />
          </div>
          <div className="p-4 bg-white rounded-lg shadow-sm border">
            <span className="block text-gray-700 font-medium mb-1">Service</span>
            <StarRating rating={visit.rating.service} size="md" />
          </div>
          <div className="p-4 bg-white rounded-lg shadow-sm border">
            <span className="block text-gray-700 font-medium mb-1">Ambiance</span>
            <StarRating rating={visit.rating.ambiance} size="md" />
          </div>
          <div className="p-4 bg-white rounded-lg shadow-sm border">
            <span className="block text-gray-700 font-medium mb-1">Value</span>
            <StarRating rating={visit.rating.value} size="md" />
          </div>
        </div>
      </div>
      
      {/* Dishes */}
      {visit.dishes.length > 0 && (
        <div className="mb-6">
          <h2 className="text-xl font-semibold mb-4">Dishes</h2>
          <div className="space-y-4">
            {visit.dishes.map(dish => (
              <div key={dish.id} className="bg-white rounded-lg shadow-sm p-4 border">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-medium">{dish.name}</h3>
                    {dish.price && (
                      <p className="text-sm text-gray-600">${dish.price.toFixed(2)}</p>
                    )}
                    <div className="mt-1">
                      <StarRating rating={dish.rating} size="sm" />
                    </div>
                  </div>
                  {dish.photos && dish.photos.length > 0 && (
                    <div className="w-16 h-16 rounded overflow-hidden flex-shrink-0">
                      <img 
                        src={dish.photos[0]} 
                        alt={dish.name} 
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = 'https://placehold.co/200x200?text=No+Image';
                        }}
                      />
                    </div>
                  )}
                </div>
                
                {dish.tags.length > 0 && (
                  <div className="mt-2 flex flex-wrap gap-1">
                    {dish.tags.map(tag => (
                      <span key={tag} className="tag-badge text-xs py-0.5 px-2">
                        {tag}
                      </span>
                    ))}
                  </div>
                )}
                
              </div>
            ))}
          </div>
        </div>
      )}
      
      {/* Notes */}
      {visit.notes && (
        <div className="mb-6">
          <h2 className="text-xl font-semibold mb-2">Notes</h2>
          <div className="bg-white rounded-lg shadow-sm p-4 border">
            <p className="text-gray-700">{visit.notes}</p>
          </div>
        </div>
      )}
      
      {/* Visit photos */}
      {visit.photos.length > 0 && (
        <div className="mb-6">
          <h2 className="text-xl font-semibold mb-4">Photos</h2>
          <div className="grid grid-cols-2 gap-2">
            {visit.photos.map((photo, index) => (
              <div key={index} className="aspect-square rounded-lg overflow-hidden">
                <img 
                  src={photo} 
                  alt={`Visit photo ${index + 1}`} 
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = 'https://placehold.co/400x400?text=No+Image';
                  }}
                />
              </div>
            ))}
          </div>
        </div>
      )}
      
      {/* Tags */}
      {visit.tags.length > 0 && (
        <div className="mb-6">
          <h2 className="text-xl font-semibold mb-2">Tags</h2>
          <div className="flex flex-wrap gap-1">
            {visit.tags.map(tag => (
              <span key={tag} className="tag-badge">
                {tag}
              </span>
            ))}
          </div>
        </div>
      )}
      
      {/* Actions */}
      <div className="flex gap-3">
        <Button 
          onClick={handleShare} 
          variant="outline"
          className="flex-1 flex items-center justify-center gap-2"
        >
          <Share2 className="h-4 w-4" />
          Share Visit
        </Button>
        <Button 
          onClick={() => navigate('/')} 
          className="flex-1 bg-visitvibe-primary hover:bg-visitvibe-primary/90"
        >
          Check In Again
        </Button>
      </div>
    </div>
  );
};

export default VisitDetailsView;
