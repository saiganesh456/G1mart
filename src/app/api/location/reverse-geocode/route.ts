import { NextRequest, NextResponse } from 'next/server';

interface ReverseGeocodeResult {
  formattedAddress: string;
  street: string;
  area: string;
  city: string;
  pincode: string;
  state: string;
  lat: number;
  lng: number;
}

export async function POST(request: NextRequest) {
  try {
    const { lat, lng } = await request.json();

    if (!lat || !lng) {
      return NextResponse.json(
        { error: 'Latitude and Longitude are required' },
        { status: 400 }
      );
    }

    const googleApiKey = process.env.GOOGLE_MAPS_API_KEY;

    // 1. If Google Maps API key is configured, use Google Geocoding API
    if (googleApiKey && !googleApiKey.includes('your-google-maps-api-key')) {
      try {
        const googleUrl = `https://maps.googleapis.com/maps/api/geocode/json?latlng=${lat},${lng}&key=${googleApiKey}`;
        const res = await fetch(googleUrl, { next: { revalidate: 3600 } });
        const data = await res.json();

        if (data.status === 'OK' && data.results && data.results.length > 0) {
          const first = data.results[0];
          let street = '';
          let area = '';
          let city = '';
          let pincode = '';
          let state = '';

          for (const comp of first.address_components) {
            if (comp.types.includes('route') || comp.types.includes('street_number')) {
              street += (street ? ' ' : '') + comp.long_name;
            }
            if (
              comp.types.includes('sublocality') ||
              comp.types.includes('sublocality_level_1') ||
              comp.types.includes('neighborhood')
            ) {
              area = comp.long_name;
            }
            if (comp.types.includes('locality')) {
              city = comp.long_name;
            }
            if (comp.types.includes('administrative_area_level_1')) {
              state = comp.long_name;
            }
            if (comp.types.includes('postal_code')) {
              pincode = comp.long_name;
            }
          }

          const result: ReverseGeocodeResult = {
            formattedAddress: first.formatted_address,
            street: street || area,
            area: area || city,
            city: city || 'Nellore',
            pincode,
            state,
            lat: Number(lat),
            lng: Number(lng),
          };

          return NextResponse.json({ success: true, data: result });
        }
      } catch (err) {
        console.warn('[ReverseGeocode] Google Maps API fallback to OSM:', err);
      }
    }

    // 2. OpenStreetMap / Nominatim fallback (Free, 0 setup required)
    const osmUrl = `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json&addressdetails=1`;
    const osmRes = await fetch(osmUrl, {
      headers: {
        'User-Agent': 'G1Mart-GroceryDelivery/1.0',
        'Accept-Language': 'en',
      },
    });

    if (!osmRes.ok) {
      throw new Error(`Nominatim error: ${osmRes.statusText}`);
    }

    const osmData = await osmRes.json();
    const addr = osmData.address || {};

    const street = addr.road || addr.residential || addr.neighbourhood || '';
    const area = addr.suburb || addr.neighbourhood || addr.quarter || addr.village || street;
    const city = addr.city || addr.town || addr.county || 'Nellore';
    const pincode = addr.postcode || '';
    const state = addr.state || 'Andhra Pradesh';

    const cleanDisplayAddress = [street, area, city, pincode]
      .filter(Boolean)
      .join(', ');

    const result: ReverseGeocodeResult = {
      formattedAddress: cleanDisplayAddress || osmData.display_name || `${city}, ${state}`,
      street,
      area: area || city,
      city,
      pincode,
      state,
      lat: Number(lat),
      lng: Number(lng),
    };

    return NextResponse.json({ success: true, data: result });
  } catch (error: any) {
    console.error('[ReverseGeocode] API Error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to detect location address' },
      { status: 500 }
    );
  }
}
