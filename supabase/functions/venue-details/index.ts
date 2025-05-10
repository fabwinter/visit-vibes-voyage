
import { corsHeaders } from '../_shared/cors.ts';

// Handle CORS preflight requests
const handleCorsAndOptions = (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }
  return null;
};

// Get venue details using Foursquare's Places API
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

    // Parse the venue ID from the request
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
    const fields = 'fsq_id,name,geocodes,location,description,tel,website,hours,rating,photos,categories,tastes,stats,price';

    // Make request to Foursquare API for venue details
    console.log(`Making request to ${foursquareUrl}?fields=${fields}`);
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
    
    // Get venue photos in a separate request if needed
    let photoUrls: string[] = [];
    if (place.photos && place.photos.length > 0) {
      // Take up to 5 photos
      const photosToFetch = place.photos.slice(0, 5);
      photoUrls = photosToFetch.map((photo: any) => {
        return `${photo.prefix}original${photo.suffix}`;
      });
    }

    // Transform the response to match our app's Venue format
    const venue = {
      id: place.fsq_id,
      name: place.name,
      address: place.location.formatted_address,
      coordinates: {
        lat: place.geocodes.main.latitude,
        lng: place.geocodes.main.longitude
      },
      photos: photoUrls,
      hours: place.hours?.display,
      priceLevel: place.price ? place.price.tier : undefined,
      category: place.categories ? place.categories.map((cat: any) => cat.name) : [],
      phoneNumber: place.tel,
      website: place.website,
      googleRating: place.rating
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
