import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get('q');

  if (!query || query.trim().length < 2) {
    return NextResponse.json({ success: true, data: [] });
  }

  try {
    const googleApiKey = process.env.GOOGLE_MAPS_API_KEY;

    // 1. Google Places Autocomplete if configured
    if (googleApiKey && !googleApiKey.includes('your-google-maps-api-key')) {
      try {
        const googleUrl = `https://maps.googleapis.com/maps/api/place/autocomplete/json?input=${encodeURIComponent(
          query
        )}&components=country:in&key=${googleApiKey}`;
        const res = await fetch(googleUrl);
        const data = await res.json();

        if (data.status === 'OK' && data.predictions) {
          const suggestions = data.predictions.map((p: any) => ({
            id: p.place_id,
            title: p.structured_formatting?.main_text || p.description,
            subtitle: p.structured_formatting?.secondary_text || '',
            fullAddress: p.description,
          }));
          return NextResponse.json({ success: true, data: suggestions });
        }
      } catch (err) {
        console.warn('[LocationSearch] Google Places fallback to Nominatim:', err);
      }
    }

    // 2. OpenStreetMap / Nominatim search fallback (Free)
    const osmUrl = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(
      query
    )}&format=json&countrycodes=in&limit=6&addressdetails=1`;

    const res = await fetch(osmUrl, {
      headers: {
        'User-Agent': 'G1Mart-GroceryDelivery/1.0',
        'Accept-Language': 'en',
      },
    });

    if (!res.ok) {
      throw new Error(`Nominatim search error: ${res.statusText}`);
    }

    const data = await res.json();
    const suggestions = (data || []).map((item: any) => {
      const addr = item.address || {};
      const title =
        addr.road || addr.suburb || addr.neighbourhood || addr.city || item.name;
      const subtitle = [addr.city || addr.town, addr.state, addr.postcode]
        .filter(Boolean)
        .join(', ');

      return {
        id: String(item.place_id),
        title,
        subtitle: subtitle || item.display_name,
        fullAddress: item.display_name,
        lat: Number(item.lat),
        lng: Number(item.lon),
      };
    });

    return NextResponse.json({ success: true, data: suggestions });
  } catch (error: any) {
    console.error('[LocationSearch] Error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
