import { NextRequest, NextResponse } from 'next/server';
import { findNearestNelloreLocality } from '@/data/nelloreLocations';

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
  let lat: any = 0;
  let lng: any = 0;
  try {
    const body = await request.json();
    lat = Number(body.lat);
    lng = Number(body.lng);

    if (!lat || !lng || isNaN(lat) || isNaN(lng)) {
      return NextResponse.json(
        { error: 'Valid Latitude and Longitude are required' },
        { status: 400 }
      );
    }

    const nearestLocality = findNearestNelloreLocality(lat, lng);

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
          let city = 'Nellore';
          let pincode = nearestLocality?.locality.pincode || '524001';
          let state = 'Andhra Pradesh';

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

          if (nearestLocality && nearestLocality.distanceKm <= 1.5) {
            if (!area || area.toLowerCase().includes('urban')) {
              area = nearestLocality.locality.area;
            }
            if (!street) {
              street = nearestLocality.locality.name;
            }
          }

          const result: ReverseGeocodeResult = {
            formattedAddress: first.formatted_address,
            street: street || area || nearestLocality?.locality.name || 'Doorstep Delivery Location',
            area: area || nearestLocality?.locality.area || city,
            city,
            pincode,
            state,
            lat,
            lng,
          };

          return NextResponse.json({ success: true, data: result });
        }
      } catch (err) {
        console.warn('[ReverseGeocode] Google Maps API fallback to OSM:', err);
      }
    }

    // 2. OpenStreetMap / Nominatim fallback
    try {
      const osmUrl = `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json&addressdetails=1`;
      const osmRes = await fetch(osmUrl, {
        headers: {
          'User-Agent': 'G1Mart-GroceryDelivery/1.0',
          'Accept-Language': 'en',
        },
      });

      if (osmRes.ok) {
        const osmData = await osmRes.json();
        const addr = osmData.address || {};

        const rawRoad = (addr.road || addr.residential || '').trim();
        const village = (addr.village || addr.hamlet || '').trim();
        const suburb = (addr.suburb || addr.neighbourhood || addr.quarter || '').trim();
        const mandal = (addr.county || addr.subdistrict || addr.district || '').trim();
        const city = (addr.city || addr.town || addr.municipality || 'Nellore').trim();
        const pincode = (addr.postcode || nearestLocality?.locality.pincode || '524001').trim();
        const state = (addr.state || 'Andhra Pradesh').trim();

        let street = rawRoad || village || suburb;
        let area = suburb || village || mandal;

        // If Nominatim returns technical words like "Nellore Urban", replace with matched Nellore locality
        if (nearestLocality && (!area || area.toLowerCase().includes('urban') || area.toLowerCase() === 'nellore')) {
          area = nearestLocality.locality.area;
          if (!street || street.toLowerCase().includes('urban') || /^(MDR|SH|NH)/i.test(street)) {
            street = nearestLocality.locality.name;
          }
        }

        const cleanStreet = street || nearestLocality?.locality.name || 'Doorstep Location';
        const cleanArea = area || nearestLocality?.locality.area || 'Nellore';
        const cleanAddress = `${cleanStreet}, ${cleanArea}, ${city}, Andhra Pradesh - ${pincode}`;

        const result: ReverseGeocodeResult = {
          formattedAddress: cleanAddress,
          street: cleanStreet,
          area: cleanArea,
          city,
          pincode,
          state,
          lat,
          lng,
        };

        return NextResponse.json({ success: true, data: result });
      }
    } catch (osmErr) {
      console.warn('[ReverseGeocode] Nominatim request error:', osmErr);
    }

    // 3. Robust Nellore Local Database Match Fallback (Zero Network Dependency)
    if (nearestLocality) {
      const loc = nearestLocality.locality;
      return NextResponse.json({
        success: true,
        data: {
          formattedAddress: `${loc.name}, ${loc.area}, Nellore, Andhra Pradesh - ${loc.pincode}`,
          street: loc.name,
          area: loc.area,
          city: 'Nellore',
          pincode: loc.pincode,
          state: 'Andhra Pradesh',
          lat,
          lng,
        },
      });
    }

    // Generic Nellore doorstep fallback
    return NextResponse.json({
      success: true,
      data: {
        formattedAddress: `GPS Location (${lat.toFixed(4)}, ${lng.toFixed(4)}), Nellore`,
        street: 'Doorstep GPS Location',
        area: 'Nellore',
        city: 'Nellore',
        pincode: '524001',
        state: 'Andhra Pradesh',
        lat,
        lng,
      },
    });
  } catch (error: any) {
    console.error('[ReverseGeocode] Fatal API Error:', error);
    return NextResponse.json({
      success: true,
      data: {
        formattedAddress: `Doorstep GPS Location (${lat || 14.4485}, ${lng || 79.9792}), Nellore`,
        street: 'Doorstep GPS Location',
        area: 'Nellore',
        city: 'Nellore',
        pincode: '524001',
        state: 'Andhra Pradesh',
        lat: Number(lat || 14.4485),
        lng: Number(lng || 79.9792),
      },
    });
  }
}
