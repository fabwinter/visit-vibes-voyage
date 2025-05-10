
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.38.0';
import { corsHeaders } from '../_shared/cors.ts';

// Handle CORS preflight requests
const handleCorsAndOptions = (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }
  return null;
};

// Function to fetch venue details from Foursquare
Deno.serve(async (req: Request) => {
  // Handle CORS
  const corsResponse = handleCorsAndOptions(req);
  if (corsResponse) return corsResponse;

  try {
    // Get the API key from environment variables
    const apiKey = Deno.env.get('FOURSQUARE_API_KEY');
    if (!apiKey) {
      throw new Error('Foursquare API key is not configured');
    }

    // Parse the query parameters from the request
    const url = new URL(req.url);
    const venueId = url.searchParams.get('id');

    // Validate venue ID
    if (!venueId) {
      return new Response(
        JSON.stringify({ error: 'Venue ID is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Build Foursquare API request for venue details
    const foursquareUrl = `https://api.foursquare.com/v3/places/${venueId}`;
    const fields = 'fsq_id,name,geocodes,location,categories,photos,description,tel,website,hours,price,rating';
    
    // Make request to Foursquare API for venue details
    const response = await fetch(`${foursquareUrl}?fields=${fields}`, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'Authorization': apiKey
      }
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`Foursquare API error: ${response.status} - ${errorText}`);
      throw new Error(`Foursquare API returned error: ${response.status}`);
    }

    const place = await response.json();
    
    // Gather photo URLs
    let photos: string[] = [];
    
    // First try to get photos from the details
    if (place.photos && place.photos.length > 0) {
      photos = place.photos.map((photo: any) => 
        `${photo.prefix}original${photo.suffix}`
      );
    }
    
    // If we still don't have photos, try a dedicated photos endpoint
    if (photos.length === 0) {
      try {
        const photosResponse = await fetch(`https://api.foursquare.com/v3/places/${venueId}/photos?limit=5&sort=popular`, {
          method: 'GET',
          headers: {
            'Accept': 'application/json',
            'Authorization': apiKey
          }
        });
        
        if (photosResponse.ok) {
          const photosData = await photosResponse.json();
          if (photosData && photosData.length > 0) {
            photos = photosData.map((photo: any) => 
              `${photo.prefix}original${photo.suffix}`
            );
          }
        }
      } catch (photoError) {
        console.error(`Error fetching photos for venue ${venueId}: ${photoError}`);
        // Continue with existing photos array
      }
    }

    // Transform the venue data
    const venue = {
      id: place.fsq_id,
      name: place.name,
      address: place.location.formatted_address,
      coordinates: {
        lat: place.geocodes.main.latitude,
        lng: place.geocodes.main.longitude
      },
      category: place.categories ? place.categories.map((cat: any) => cat.name) : [],
      photos: photos,
      hours: place.hours?.display,
      priceLevel: place.price?.tier,
      phoneNumber: place.tel,
      website: place.website,
      rating: place.rating
    };

    return new Response(JSON.stringify(venue), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  } catch (error) {
    console.error(`Error in venue-details: ${error.message}`);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
});
