import { NextRequest, NextResponse } from 'next/server';
import { serverStoreSettings } from '@/lib/serverStoreSettings';

export async function GET() {
  try {
    const settings = await serverStoreSettings.getStoreSettings();
    const zones = await serverStoreSettings.getDeliveryZones();

    return NextResponse.json({
      success: true,
      settings,
      zones,
    });
  } catch (error: any) {
    console.error('[API/Admin/Settings] GET error:', error);
    return NextResponse.json(
      { success: false, error: error?.message || 'Failed to fetch settings' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { settings, zones } = body;

    let updatedSettings = null;
    let updatedZones = null;

    if (settings) {
      updatedSettings = await serverStoreSettings.updateStoreSettings(settings);
    }

    if (zones && Array.isArray(zones)) {
      updatedZones = await serverStoreSettings.saveDeliveryZones(zones);
    }

    const currentSettings = updatedSettings || (await serverStoreSettings.getStoreSettings());
    const currentZones = updatedZones || (await serverStoreSettings.getDeliveryZones());

    return NextResponse.json({
      success: true,
      message: 'Store settings and delivery zones saved successfully',
      settings: currentSettings,
      zones: currentZones,
    });
  } catch (error: any) {
    console.error('[API/Admin/Settings] POST error:', error);
    return NextResponse.json(
      { success: false, error: error?.message || 'Failed to save settings' },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  return POST(request);
}
