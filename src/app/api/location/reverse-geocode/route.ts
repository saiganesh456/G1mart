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

    const rawRoad = (addr.road || addr.residential || '').trim();
    const village = (addr.village || addr.hamlet || '').trim();
    const suburb = (addr.suburb || addr.neighbourhood || addr.quarter || '').trim();
    const mandal = (addr.county || addr.subdistrict || addr.district || '').trim();
    const city = (addr.city || addr.town || addr.municipality || 'Nellore').trim();
    const pincode = (addr.postcode || '').trim();
    const state = (addr.state || 'Andhra Pradesh').trim();

    // Check if road is a highway or district road code (e.g. MDR032, SH57, NH16) or unnamed
    const isTechnicalRoadCode =
      !rawRoad ||
      /^(MDR|SH|NH|ODR|VR|AH)[\s\-0-9]*/i.test(rawRoad) ||
      /^[A-Z]{2,4}[0-9]+/i.test(rawRoad) ||
      /^Unnamed/i.test(rawRoad) ||
      /Road\s*[0-9]+$/i.test(rawRoad);

    let street = '';
    let area = '';

    if (isTechnicalRoadCode) {
      // Highway / district road codes (like MDR032) are technical navigation IDs, not delivery doorstep streets.
      // Use village / hamlet / suburb / locality as the primary street address.
      street = village || suburb || mandal || city;
      area = [
        mandal && mandal !== street ? mandal : '',
        city && city !== mandal && city !== street ? city : '',
      ]
        .filter(Boolean)
        .join(', ');
    } else {
      street = rawRoad;
      area = [
        village && village !== rawRoad ? village : '',
        suburb && suburb !== village && suburb !== rawRoad ? suburb : '',
        mandal && mandal !== village ? mandal : '',
      ]
        .filter(Boolean)
        .join(', ');
    }

    if (!street) street = village || suburb || mandal || city;
    if (!area) area = mandal || city;

    const cleanDisplayAddress = [street, area && area !== street ? area : '', city, pincode]
      .filter(Boolean)
      .join(', ');

    const result: ReverseGeocodeResult = {
      formattedAddress: cleanDisplayAddress || osmData.display_name || `${city}, ${state}`,
      street,
      area,
      city,
      pincode,
      state,
      lat: Number(lat),
      lng: Number(lng),
    };

    return NextResponse.json({ success: true, data: result });
  } catch (error: any) {
    console.error('[ReverseGeocode] API Error:', error);
    // Graceful fallback: preserve exact user coordinates so GPS coordinates are never dropped
    return NextResponse.json({
      success: true,
      data: {
        formattedAddress: `Detected GPS Location (${Number(lat || 0).toFixed(4)}, ${Number(lng || 0).toFixed(4)})`,
        street: 'Current GPS Location',
        area: 'Nellore',
        city: 'Nellore',
        pincode: '524003',
        state: 'Andhra Pradesh',
        lat: Number(lat || 0),
        lng: Number(lng || 0),
      },
    });
  }
}
