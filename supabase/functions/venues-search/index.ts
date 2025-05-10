
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
    const categoryId = url.searchParams.get('categoryId') || '13000,13065'; // Default to food categories

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
      categories: categoryId
    });

    // Add query if provided
    if (query && query.length > 0) {
      searchParams.append('query', query);
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
    
    // Transform the response to match our app's Venue format
    const venues = data.results.map((place: any) => ({
      id: place.fsq_id,
      name: place.name,
      address: place.location.formatted_address,
      coordinates: {
        lat: place.geocodes.main.latitude,
        lng: place.geocodes.main.longitude
      },
      // Extract category names
      category: place.categories ? place.categories.map((cat: any) => cat.name) : [],
      // We'll handle photos in a separate request
      photos: [],
      // Add additional fields if available
      hours: place.hours?.display,
      priceLevel: place.price_level,
      phoneNumber: place.contact?.phone,
      website: place.website
    }));

    return new Response(JSON.stringify({ venues }), {
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
