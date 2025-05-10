
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.38.0';
import { corsHeaders } from '../_shared/cors.ts';

// Handle CORS preflight requests
const handleCorsAndOptions = (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }
  return null;
};

// Search for venues using Foursquare's Places API
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
    const query = url.searchParams.get('query') || '';
    const lat = url.searchParams.get('lat');
    const lng = url.searchParams.get('lng');
    const radius = url.searchParams.get('radius') || '2000'; // Default to 2km
    const limit = url.searchParams.get('limit') || '20';
    const categoryId = url.searchParams.get('categoryId') || '13000,13065,13032,13003,13034,13035,13040,13046,13145'; // Default to food categories
    const offset = url.searchParams.get('offset') || '0'; // For pagination

    // Validate location parameters
    if (!lat || !lng) {
      return new Response(
        JSON.stringify({ error: 'Location parameters (lat, lng) are required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Build Foursquare API request
    const foursquareUrl = 'https://api.foursquare.com/v3/places/search';
    const searchParams = new URLSearchParams({
      ll: `${lat},${lng}`,
      radius,
      limit,
      sort: 'DISTANCE',
      categories: categoryId,
      fields: 'fsq_id,name,geocodes,location,categories,photos,description,tel,website,hours,price,rating'
    });

    // Add query if provided
    if (query && query.length > 0) {
      searchParams.append('query', query);
    }

    // Add pagination if provided
    if (offset && parseInt(offset) > 0) {
      searchParams.append('offset', offset);
    }

    // Make request to Foursquare API
    console.log(`Making request to ${foursquareUrl}?${searchParams.toString()}`);
    const response = await fetch(`${foursquareUrl}?${searchParams.toString()}`, {
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

    const data = await response.json();
    
    // Process each venue to include photo URLs
    const venues = await Promise.all(
      data.results.map(async (place: any) => {
        // Gather photo URLs if available
        let photos: string[] = [];
        if (place.photos && place.photos.length > 0) {
          photos = place.photos.map((photo: any) => 
            `${photo.prefix}original${photo.suffix}`
          );
        } 
        
        // If no photos from initial search, try to fetch venue details for photos
        if (photos.length === 0) {
          try {
            // Fetch venue details
            const detailsResponse = await fetch(`https://api.foursquare.com/v3/places/${place.fsq_id}?fields=photos`, {
              method: 'GET',
              headers: {
                'Accept': 'application/json',
                'Authorization': apiKey
              }
            });
            
            if (detailsResponse.ok) {
              const details = await detailsResponse.json();
              if (details.photos && details.photos.length > 0) {
                photos = details.photos.map((photo: any) => 
                  `${photo.prefix}original${photo.suffix}`
                );
              }
            }
          } catch (photoError) {
            console.error(`Error fetching photos for venue ${place.fsq_id}: ${photoError}`);
            // Continue with empty photos array
          }
        }

        // Transform the venue data
        return {
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
      })
    );

    // Calculate next page token for pagination
    const nextPageToken = data.results.length === parseInt(limit) ? 
      (parseInt(offset) + parseInt(limit)).toString() : undefined;

    return new Response(JSON.stringify({ venues, nextPageToken }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  } catch (error) {
    console.error(`Error in venues-search: ${error.message}`);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
});
