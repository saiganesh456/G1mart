import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export async function GET() {
  try {
    const bannersPath = path.join(process.cwd(), 'data', 'banners.json');
    const data = fs.existsSync(bannersPath)
      ? JSON.parse(fs.readFileSync(bannersPath, 'utf-8'))
      : [];
    return NextResponse.json({ banners: data });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const bannersPath = path.join(process.cwd(), 'data', 'banners.json');
    let data: any[] = fs.existsSync(bannersPath)
      ? JSON.parse(fs.readFileSync(bannersPath, 'utf-8'))
      : [];

    if (body.action === 'toggle') {
      const banner = data.find((b) => b.id === body.id);
      if (banner) {
        banner.active = !banner.active;
        fs.writeFileSync(bannersPath, JSON.stringify(data, null, 2), 'utf-8');
        const srcBannersPath = path.join(process.cwd(), 'src', 'data', 'banners.json');
        if (fs.existsSync(path.dirname(srcBannersPath))) {
          fs.writeFileSync(srcBannersPath, JSON.stringify(data, null, 2), 'utf-8');
        }
        return NextResponse.json({ success: true, banner });
      }
    } else if (body.action === 'save') {
      const existingIdx = data.findIndex((b) => b.id === body.banner.id);
      if (existingIdx >= 0) {
        data[existingIdx] = { ...data[existingIdx], ...body.banner };
      } else {
        data.push(body.banner);
      }
      fs.writeFileSync(bannersPath, JSON.stringify(data, null, 2), 'utf-8');
      const srcBannersPath = path.join(process.cwd(), 'src', 'data', 'banners.json');
      if (fs.existsSync(path.dirname(srcBannersPath))) {
        fs.writeFileSync(srcBannersPath, JSON.stringify(data, null, 2), 'utf-8');
      }
      return NextResponse.json({ success: true, banners: data });
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
