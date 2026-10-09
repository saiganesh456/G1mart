import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export async function GET() {
  try {
    const bannersPath = path.join(process.cwd(), 'data', 'banners.json');
    if (fs.existsSync(bannersPath)) {
      const data = JSON.parse(fs.readFileSync(bannersPath, 'utf-8'));
      const active = data.filter((b: any) => b.active !== false).sort((a: any, b: any) => (a.sort_order || 0) - (b.sort_order || 0));
      return NextResponse.json({ banners: active });
    }
    return NextResponse.json({ banners: [] });
  } catch (error: any) {
    console.error('Error fetching banners:', error);
    return NextResponse.json({ banners: [] }, { status: 500 });
  }
}
