import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import { execFile } from 'child_process';
import { promisify } from 'util';

const execFileAsync = promisify(execFile);

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const files = formData.getAll('images') as File[];

    if (!files || files.length === 0) {
      return NextResponse.json({ error: 'No files uploaded' }, { status: 400 });
    }

    const tempDir = path.join(process.cwd(), 'tmp');
    if (!fs.existsSync(tempDir)) fs.mkdirSync(tempDir, { recursive: true });

    const verifiedDir = path.join(process.cwd(), 'public', 'products', 'verified');
    if (!fs.existsSync(verifiedDir)) fs.mkdirSync(verifiedDir, { recursive: true });

    const catalogPath = path.join(process.cwd(), 'data', 'migrated_products.json');
    const catalog = fs.existsSync(catalogPath)
      ? JSON.parse(fs.readFileSync(catalogPath, 'utf-8'))
      : [];

    const scriptPath = path.join(process.cwd(), 'scripts', 'photo_pipeline', 'image_processor.py');
    const results: { fileName: string; productId: string; success: boolean; error?: string }[] = [];

    for (const file of files) {
      const fileName = file.name;
      const stem = path.basename(fileName, path.extname(fileName)).trim();
      // Match against catalog by id or barcode
      const product = catalog.find((p: any) => p.id === stem || (p.barcode && p.barcode === stem));
      if (!product) {
        results.push({ fileName, productId: stem, success: false, error: 'Product ID or barcode not found in catalog' });
        continue;
      }

      const pid = product.id;
      const ext = path.extname(fileName) || '.jpg';
      const tempPath = path.join(tempDir, `${pid}_bulk${ext}`);
      const outWebp = path.join(verifiedDir, `${pid}.webp`);

      try {
        const buffer = Buffer.from(await file.arrayBuffer());
        fs.writeFileSync(tempPath, buffer);

        try {
          await execFileAsync('python', [scriptPath, tempPath, outWebp]);
        } catch {
          fs.copyFileSync(tempPath, outWebp);
        }

        const webpUrl = `/products/verified/${pid}.webp`;
        product.image_url = webpUrl;
        product.image_status = 'verified';
        product.image_source = 'owner_bulk_upload';
        product.image_license = 'Proprietary / G1 Mart';

        results.push({ fileName, productId: pid, success: true });
      } catch (err: any) {
        results.push({ fileName, productId: pid, success: false, error: err.message });
      } finally {
        if (fs.existsSync(tempPath)) {
          try { fs.unlinkSync(tempPath); } catch {}
        }
      }
    }

    // Save catalog updates
    const successCount = results.filter((r) => r.success).length;
    if (successCount > 0) {
      fs.writeFileSync(catalogPath, JSON.stringify(catalog, null, 2), 'utf-8');

      // Regenerate collages
      const collageScript = path.join(process.cwd(), 'scripts', 'photo_pipeline', 'generate_category_collages.py');
      execFile('python', [collageScript], () => {});
    }

    return NextResponse.json({
      success: true,
      processed: results.length,
      successCount,
      results,
    });
  } catch (error: any) {
    console.error('Bulk upload error:', error);
    return NextResponse.json({ error: error.message || 'Bulk upload failed' }, { status: 500 });
  }
}
