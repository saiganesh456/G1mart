import { NextRequest, NextResponse } from 'next/server';
import { serverDistanceService } from '@/lib/serverDistanceService';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const lat = parseFloat(body.lat);
    const lng = parseFloat(body.lng);

    if (isNaN(lat) || isNaN(lng)) {
      return NextResponse.json(
        { success: false, error: 'Valid latitude and longitude numbers are required' },
        { status: 400 }
      );
    }

    const result = await serverDistanceService.calculateDistance(lat, lng);
    return NextResponse.json({
      success: true,
      data: result,
    });
  } catch (error: any) {
    console.error('[API/Location/Distance] POST Error:', error);
    return NextResponse.json(
      { success: false, error: error?.message || 'Failed to calculate distance' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const latStr = searchParams.get('lat');
    const lngStr = searchParams.get('lng');

    if (!latStr || !lngStr) {
      return NextResponse.json(
        { success: false, error: 'Missing lat or lng query parameter' },
        { status: 400 }
      );
    }

    const lat = parseFloat(latStr);
    const lng = parseFloat(lngStr);

    if (isNaN(lat) || isNaN(lng)) {
      return NextResponse.json(
        { success: false, error: 'Invalid latitude or longitude numbers' },
        { status: 400 }
      );
    }

    const result = await serverDistanceService.calculateDistance(lat, lng);
    return NextResponse.json({
      success: true,
      data: result,
    });
  } catch (error: any) {
    console.error('[API/Location/Distance] GET Error:', error);
    return NextResponse.json(
      { success: false, error: error?.message || 'Failed to calculate distance' },
      { status: 500 }
    );
  }
}
