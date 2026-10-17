export const dynamic = 'force-dynamic';
import { NextResponse } from 'next/server';
import { serverStoreSettings } from '@/lib/serverStoreSettings';

export async function GET() {
  try {
    const settings = await serverStoreSettings.getStoreSettings();
    const zones = await serverStoreSettings.getDeliveryZones();
    const activeZones = zones.filter((z) => (z.active !== undefined ? z.active : z.isActive ?? true));

    return NextResponse.json({
      success: true,
      store: {
        store_lat: settings.store_lat,
        store_lng: settings.store_lng,
        store_address: settings.store_address,
        max_radius_km: settings.max_radius_km,
        prep_time_min: settings.prep_time_min,
        cod_fee: settings.cod_fee,
      },
      zones: activeZones,
    });
  } catch (error: any) {
    console.error('[API/Store/Settings] GET error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to load store settings' },
      { status: 500 }
    );
  }
}
