import { NextResponse, type NextRequest } from 'next/server';
import { serverStaffStore } from '@/lib/serverStaffStore';

export async function GET() {
  try {
    const data = serverStaffStore.getStaff();
    return NextResponse.json({
      success: true,
      admins: data.admins,
      riders: data.riders,
    });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err.message || 'Failed to fetch staff directory' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { type, email, name, phone, vehicleNumber, admins, riders } = body;

    // Support client synchronization
    if (type === 'sync') {
      serverStaffStore.syncClientStaff(admins, riders);
      return NextResponse.json({
        success: true,
        message: 'Staff directory synchronized successfully',
        staffDirectory: serverStaffStore.getStaff(),
      });
    }

    if (!email) {
      return NextResponse.json(
        { success: false, error: 'Email address is required' },
        { status: 400 }
      );
    }

    if (type === 'admin') {
      const result = await serverStaffStore.addAdmin(email, name);
      if (!result.success) {
        return NextResponse.json({ success: false, error: result.error }, { status: 400 });
      }
      return NextResponse.json({
        success: true,
        message: `Admin privileges granted to ${email}`,
        staff: result.staff,
        staffDirectory: serverStaffStore.getStaff(),
      });
    }

    if (type === 'rider') {
      const result = await serverStaffStore.addRider({
        email,
        name: name || 'Delivery Partner',
        phone,
        vehicleNumber,
      });
      if (!result.success) {
        return NextResponse.json({ success: false, error: result.error }, { status: 400 });
      }
      return NextResponse.json({
        success: true,
        message: `Rider privileges granted to ${email}`,
        staff: result.staff,
        staffDirectory: serverStaffStore.getStaff(),
      });
    }

    return NextResponse.json(
      { success: false, error: 'Invalid staff type. Must be "admin", "rider", or "sync".' },
      { status: 400 }
    );
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err.message || 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const body = await request.json();
    const { type, email } = body;

    if (!email) {
      return NextResponse.json(
        { success: false, error: 'Email address is required' },
        { status: 400 }
      );
    }

    if (type === 'admin') {
      const result = await serverStaffStore.removeAdmin(email);
      if (!result.success) {
        return NextResponse.json({ success: false, error: result.error }, { status: 400 });
      }
      return NextResponse.json({
        success: true,
        message: `Admin access revoked for ${email}`,
        staffDirectory: serverStaffStore.getStaff(),
      });
    }

    if (type === 'rider') {
      const result = await serverStaffStore.removeRider(email);
      if (!result.success) {
        return NextResponse.json({ success: false, error: result.error }, { status: 400 });
      }
      return NextResponse.json({
        success: true,
        message: `Rider access revoked for ${email}`,
        staffDirectory: serverStaffStore.getStaff(),
      });
    }

    return NextResponse.json(
      { success: false, error: 'Invalid type parameter' },
      { status: 400 }
    );
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err.message || 'Failed to remove staff member' },
      { status: 500 }
    );
  }
}
