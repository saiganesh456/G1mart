import { NextRequest, NextResponse } from 'next/server';
import { searchNelloreLocations } from '@/data/nelloreLocations';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get('q');

  if (!query || query.trim().length < 1) {
    return NextResponse.json({ success: true, data: [] });
  }

  const cleanQuery = query.trim();

  try {
    // 1. Instant local database search (Nellore localities, colonies, landmarks)
    const localMatches = searchNelloreLocations(cleanQuery, 8);
    const localSuggestions = localMatches.map((loc) => ({
      id: `local-${loc.id}`,
      title: loc.name,
      subtitle: [loc.landmark, loc.area, `Nellore - ${loc.pincode}`].filter(Boolean).join(', '),
      fullAddress: `${loc.name}, ${loc.area}, Nellore, Andhra Pradesh - ${loc.pincode}`,
      area: loc.area,
      city: loc.city,
      pincode: loc.pincode,
      lat: loc.lat,
      lng: loc.lng,
      isLocalNellore: true,
    }));

    // If we got local Nellore matches, return them directly for ultra-fast response
    if (localSuggestions.length >= 1) {
      return NextResponse.json({ success: true, data: localSuggestions });
    }

    // 2. Google Places Autocomplete if configured
    const googleApiKey = process.env.GOOGLE_MAPS_API_KEY;
    if (googleApiKey && !googleApiKey.includes('your-google-maps-api-key')) {
      try {
        const googleUrl = `https://maps.googleapis.com/maps/api/place/autocomplete/json?input=${encodeURIComponent(
          cleanQuery
        )}&components=country:in&location=14.4329,79.9680&radius=30000&strictbounds=false&key=${googleApiKey}`;
        const res = await fetch(googleUrl);
        const data = await res.json();

        if (data.status === 'OK' && Array.isArray(data.predictions)) {
          const googleSuggestions = data.predictions.map((p: any) => ({
            id: p.place_id,
            title: p.structured_formatting?.main_text || p.description,
            subtitle: p.structured_formatting?.secondary_text || '',
            fullAddress: p.description,
          }));

          const combined = [...localSuggestions, ...googleSuggestions];
          return NextResponse.json({ success: true, data: combined.slice(0, 8) });
        }
      } catch (err) {
        console.warn('[LocationSearch] Google Places error:', err);
      }
    }

    // 3. OpenStreetMap / Nominatim fallback biased strictly to Nellore Region
    try {
      const searchTerms = cleanQuery.toLowerCase().includes('nellore')
        ? cleanQuery
        : `${cleanQuery}, Nellore, Andhra Pradesh`;

      // Bounding box for Nellore and surrounding mandals within ~35 km
      const osmUrl = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(
        searchTerms
      )}&format=json&countrycodes=in&viewbox=79.6,14.7,80.3,14.2&bounded=0&limit=6&addressdetails=1`;

      const res = await fetch(osmUrl, {
        headers: {
          'User-Agent': 'G1Mart-GroceryDelivery/1.0',
          'Accept-Language': 'en',
        },
      });

      let data = [];
      if (res.ok) {
        data = await res.json();
      }

      // If initial search returned 0 results, retry with relaxed village & compound queries within Nellore viewbox
      if (!Array.isArray(data) || data.length === 0) {
        const relaxedTerms = [
          cleanQuery,
          cleanQuery.replace(/\s+/g, ''),
          cleanQuery.replace(/\bth/gi, 't').replace(/patri/gi, 'parti').replace(/\s+/g, ''),
          cleanQuery.replace(/\bth/gi, 't'),
        ];

        for (const term of relaxedTerms) {
          if (!term || term.toLowerCase() === searchTerms.toLowerCase()) continue;
          try {
            const fallbackUrl = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(
              term
            )}&format=json&countrycodes=in&viewbox=79.6,14.8,80.3,14.1&bounded=0&limit=6&addressdetails=1`;
            const fbRes = await fetch(fallbackUrl, {
              headers: {
                'User-Agent': 'G1Mart-GroceryDelivery/1.0',
                'Accept-Language': 'en',
              },
            });
            if (fbRes.ok) {
              const fbData = await fbRes.json();
              if (Array.isArray(fbData) && fbData.length > 0) {
                data = fbData;
                break;
              }
            }
          } catch {}
        }
      }

      if (Array.isArray(data) && data.length > 0) {
        const isTechCode = (s: string) => /^(MDR|SH|NH|\d+)/i.test((s || '').trim()) || /\bMDR\d*/i.test(s || '');
        const osmSuggestions = (data || []).map((item: any) => {
          const addr = item.address || {};
          // Check for specific POI / place name first
          const poiName = item.name || addr.shop || addr.amenity || addr.building || addr.tourism || addr.leisure;
          let rawTitle =
            poiName && !isTechCode(poiName)
              ? poiName
              : addr.suburb || addr.neighbourhood || addr.village || addr.road || addr.city || 'Nellore Location';

          if (isTechCode(rawTitle)) {
            rawTitle = addr.suburb || addr.neighbourhood || addr.village || addr.city || 'Nellore Location';
          }

          const subtitleParts = [
            rawTitle !== addr.road ? addr.road : null,
            rawTitle !== addr.suburb ? addr.suburb : null,
            rawTitle !== addr.neighbourhood ? addr.neighbourhood : null,
            addr.city || addr.town || addr.village || 'Nellore',
            addr.postcode,
          ].filter(Boolean);

          const subtitle = subtitleParts.filter((val, idx, self) => self.indexOf(val) === idx).join(', ');

          return {
            id: String(item.place_id),
            title: rawTitle,
            subtitle: subtitle || item.display_name,
            fullAddress: item.display_name,
            lat: Number(item.lat),
            lng: Number(item.lon),
          };
        });

        // Deduplicate and combine local + osm
        const seen = new Set<string>();
        const combined = [];
        for (const item of [...localSuggestions, ...osmSuggestions]) {
          const key = (item.title || '').toLowerCase();
          if (!seen.has(key)) {
            seen.add(key);
            combined.push(item);
          }
        }

        return NextResponse.json({ success: true, data: combined.slice(0, 8) });
      }
    } catch (err) {
      console.warn('[LocationSearch] Nominatim error:', err);
    }

    // Default to whatever local matches we found
    return NextResponse.json({ success: true, data: localSuggestions });
  } catch (error: any) {
    console.error('[LocationSearch] Error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
