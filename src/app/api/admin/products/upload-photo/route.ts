import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import { execFile } from 'child_process';
import { promisify } from 'util';

const execFileAsync = promisify(execFile);

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const productId = formData.get('productId') as string;
    const file = formData.get('image') as File;

    if (!productId || !file) {
      return NextResponse.json({ error: 'Missing productId or image file' }, { status: 400 });
    }

    const buffer = Buffer.from(await file.arrayBuffer());

    // Write temp input file
    const tempDir = path.join(process.cwd(), 'tmp');
    if (!fs.existsSync(tempDir)) fs.mkdirSync(tempDir, { recursive: true });
    
    const ext = path.extname(file.name) || '.jpg';
    const tempInputPath = path.join(tempDir, `${productId}_upload${ext}`);
    fs.writeFileSync(tempInputPath, buffer);

    // Destination path
    const verifiedDir = path.join(process.cwd(), 'public', 'products', 'verified');
    if (!fs.existsSync(verifiedDir)) fs.mkdirSync(verifiedDir, { recursive: true });

    const outputWebpPath = path.join(verifiedDir, `${productId}.webp`);

    // Execute Python image_processor
    const scriptPath = path.join(process.cwd(), 'scripts', 'photo_pipeline', 'image_processor.py');
    try {
      await execFileAsync('python', [scriptPath, tempInputPath, outputWebpPath]);
    } catch (procErr: any) {
      console.error('Python processor error:', procErr);
      // Fallback: save directly as image if rembg fails
      fs.copyFileSync(tempInputPath, outputWebpPath);
    } finally {
      try {
        if (fs.existsSync(tempInputPath)) fs.unlinkSync(tempInputPath);
      } catch {}
    }

    const webpUrl = `/products/verified/${productId}.webp`;

    // Update migrated_products.json
    const catalogPath = path.join(process.cwd(), 'data', 'migrated_products.json');
    if (fs.existsSync(catalogPath)) {
      const catalog = JSON.parse(fs.readFileSync(catalogPath, 'utf-8'));
      const product = catalog.find((p: any) => p.id === productId);
      if (product) {
        product.image_url = webpUrl;
        product.image_status = 'verified';
        product.image_source = 'store_camera';
        product.image_license = 'Proprietary / G1 Mart';
        fs.writeFileSync(catalogPath, JSON.stringify(catalog, null, 2), 'utf-8');

        // Automatically regenerate category tile collages in background
        const collageScript = path.join(process.cwd(), 'scripts', 'photo_pipeline', 'generate_category_collages.py');
        execFile('python', [collageScript], (err) => {
          if (err) console.error('Auto-regenerate category collages error:', err);
        });
      }
    }

    return NextResponse.json({
      success: true,
      productId,
      imageUrl: webpUrl,
      imageStatus: 'verified'
    });
  } catch (error: any) {
    console.error('Photo upload error:', error);
    return NextResponse.json({ error: error.message || 'Failed to process photo' }, { status: 500 });
  }
}
