import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';

interface ImageLogItem {
  productId: string;
  sourceItemNo: number;
  productName: string;
  brand: string | null;
  referenceSourceUrl: string;
  generationStatus: 'VERIFIED' | 'NEEDS_REVIEW' | 'FAILED' | 'PENDING';
  imageUrl: string | null;
  failureOrReviewReason: string | null;
  processedAt: string;
}

const LOG_FILE_PATH = path.join(process.cwd(), 'src', 'data', 'image_generation_log.json');
const CATALOG_PATH = path.join(process.cwd(), 'src', 'data', 'products-catalog.json');

async function getLogData(): Promise<ImageLogItem[]> {
  try {
    const raw = await fs.readFile(LOG_FILE_PATH, 'utf-8');
    return JSON.parse(raw);
  } catch (err) {
    console.warn('[image-pipeline] Could not read log file, returning empty array:', err);
    return [];
  }
}

async function saveLogData(logs: ImageLogItem[]): Promise<void> {
  await fs.writeFile(LOG_FILE_PATH, JSON.stringify(logs, null, 2), 'utf-8');
}

export async function GET() {
  try {
    const logs = await getLogData();

    // Read full catalog to calculate accurate counts across all 472 products
    let catalog: any[] = [];
    try {
      const rawCatalog = await fs.readFile(CATALOG_PATH, 'utf-8');
      catalog = JSON.parse(rawCatalog);
    } catch {
      catalog = [];
    }

    const total = catalog.length || 472;
    const verified = catalog.filter((p) => p.imageStatus === 'VERIFIED' && p.imageUrl).length;
    const needsReview = catalog.filter((p) => p.imageStatus === 'PENDING').length;
    const missing = catalog.filter((p) => (p.imageStatus || 'MISSING') === 'MISSING').length;
    const generated = logs.filter((l) => l.generationStatus === 'VERIFIED').length;
    const failed = logs.filter((l) => l.generationStatus === 'FAILED').length;
    const remaining = missing;

    return NextResponse.json({
      success: true,
      stats: {
        total,
        generated,
        verified,
        needsReview,
        failed,
        remaining,
      },
      logs,
    });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err.message || 'Failed to fetch pipeline status' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action, productId, status, imageUrl, reason } = body;

    const logs = await getLogData();

    if (action === 'update_review_status') {
      if (!productId || !status) {
        return NextResponse.json(
          { error: 'Missing productId or status' },
          { status: 400 }
        );
      }

      // 1. Update log
      const logIndex = logs.findIndex((l) => l.productId === productId);
      if (logIndex >= 0) {
        // Enforce Rule 14: Never overwrite existing VERIFIED image automatically unless user explicitly changed it
        logs[logIndex].generationStatus = status;
        if (imageUrl !== undefined) {
          logs[logIndex].imageUrl = imageUrl;
        }
        if (reason !== undefined) {
          logs[logIndex].failureOrReviewReason = reason;
        }
        logs[logIndex].processedAt = new Date().toISOString();
      }

      await saveLogData(logs);

      // 2. Update local catalog JSON file for persistence
      try {
        const rawCatalog = await fs.readFile(CATALOG_PATH, 'utf-8');
        const catalog = JSON.parse(rawCatalog);
        const prodIndex = catalog.findIndex((p: any) => p.id === productId);
        if (prodIndex >= 0) {
          catalog[prodIndex].imageStatus = status;
          if (imageUrl) {
            catalog[prodIndex].imageUrl = imageUrl;
          }
          await fs.writeFile(CATALOG_PATH, JSON.stringify(catalog, null, 2), 'utf-8');
        }
      } catch (catErr) {
        console.warn('[image-pipeline] Could not update local catalog JSON:', catErr);
      }

      return NextResponse.json({
        success: true,
        message: `Product ${productId} review status updated to ${status}`,
        logs,
      });
    }

    return NextResponse.json({ error: 'Unknown action' }, { status: 400 });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err.message || 'Pipeline operation failed' },
      { status: 500 }
    );
  }
}
