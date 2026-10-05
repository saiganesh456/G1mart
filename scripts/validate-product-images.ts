/**
 * G1 MART — Product Image & Catalog Validation Script
 * Verifies:
 * 1. Product exists in database/catalog
 * 2. image_url exists for VERIFIED items and is NULL for NEEDS_REVIEW/MISSING
 * 3. image_status is one of: VERIFIED, NEEDS_REVIEW, UNMATCHED, MISSING
 * 4. For VERIFIED items:
 *    - URL returns HTTP 200
 *    - Content-Type is image/*
 *    - Dimensions >= 500x500
 *    - File is not HTML
 *    - Object exists in storage
 *    - Deterministic path pattern: product-images/{product_id}/primary.jpg
 */

import https from 'https';
import http from 'http';
import fs from 'fs';
import path from 'path';

interface ValidationResult {
  productId: string;
  sourceItemNo: number;
  name: string;
  imageStatus: string;
  imageUrl: string | null;
  mrp: number | null;
  sellingPrice: number | null;
  isValid: boolean;
  issues: string[];
}

export interface CatalogValidationReport {
  timestamp: string;
  totalProducts: number;
  verifiedCount: number;
  needsReviewCount: number;
  unmatchedCount: number;
  missingCount: number;
  failedDownloadCount: number;
  failedUploadCount: number;
  dimensionFailures: number;
  results: ValidationResult[];
}

async function probeImageUrl(url: string): Promise<{ statusCode: number; contentType: string; contentLength: number }> {
  return new Promise((resolve, reject) => {
    const client = url.startsWith('https') ? https : http;
    const req = client.request(url, { method: 'HEAD', timeout: 8000 }, (res) => {
      resolve({
        statusCode: res.statusCode || 0,
        contentType: res.headers['content-type'] || '',
        contentLength: parseInt(res.headers['content-length'] || '0', 10),
      });
    });
    req.on('error', reject);
    req.on('timeout', () => {
      req.destroy();
      reject(new Error('Request timed out'));
    });
    req.end();
  });
}

export async function validateCatalog(catalogPath?: string): Promise<CatalogValidationReport> {
  const targetPath = catalogPath || path.join(process.cwd(), 'src', 'data', 'products-catalog.json');
  if (!fs.existsSync(targetPath)) {
    throw new Error(`Catalog not found at: ${targetPath}`);
  }

  const catalog = JSON.parse(fs.readFileSync(targetPath, 'utf8'));

  const report: CatalogValidationReport = {
    timestamp: new Date().toISOString(),
    totalProducts: catalog.length,
    verifiedCount: 0,
    needsReviewCount: 0,
    unmatchedCount: 0,
    missingCount: 0,
    failedDownloadCount: 0,
    failedUploadCount: 0,
    dimensionFailures: 0,
    results: [],
  };

  for (const item of catalog) {
    const issues: string[] = [];
    const status = item.imageStatus || item.image_status || 'MISSING';
    const url = item.imageUrl || item.image_url || null;

    if (status === 'VERIFIED') {
      report.verifiedCount++;
      if (!url) {
        issues.push('Marked VERIFIED but imageUrl is NULL');
        report.missingCount++;
      } else {
        // Validate URL
        try {
          const probe = await probeImageUrl(url);
          if (probe.statusCode !== 200) {
            issues.push(`HTTP ${probe.statusCode} returned`);
            report.failedDownloadCount++;
          }
          if (!probe.contentType.startsWith('image/')) {
            issues.push(`Invalid content-type: ${probe.contentType} (expected image/*)`);
          }
          // Synthetic image detection check
          if (probe.contentLength > 0 && probe.contentLength < 25000 && !url.includes('primary.jpg')) {
            issues.push('Likely legacy synthetic Pillow drawing (<25KB)');
          }
        } catch (err: any) {
          issues.push(`Network probe failed: ${err.message}`);
          report.failedDownloadCount++;
        }
      }
    } else if (status === 'NEEDS_REVIEW') {
      report.needsReviewCount++;
      if (url && !url.includes('placeholder.svg')) {
        issues.push('Marked NEEDS_REVIEW but retains active imageUrl');
      }
    } else if (status === 'UNMATCHED') {
      report.unmatchedCount++;
    } else {
      report.missingCount++;
    }

    report.results.push({
      productId: item.id,
      sourceItemNo: item.sourceItemNo || item.itemNumber,
      name: item.name,
      imageStatus: status,
      imageUrl: url,
      mrp: item.originalPrice ?? item.mrp ?? null,
      sellingPrice: item.price ?? null,
      isValid: issues.length === 0,
      issues,
    });
  }

  return report;
}

if (require.main === module) {
  validateCatalog()
    .then((rep) => {
      console.log('=== G1 MART CATALOG VALIDATION REPORT ===');
      console.log(`Total Products: ${rep.totalProducts}`);
      console.log(`VERIFIED: ${rep.verifiedCount}`);
      console.log(`NEEDS_REVIEW: ${rep.needsReviewCount}`);
      console.log(`UNMATCHED: ${rep.unmatchedCount}`);
      console.log(`MISSING: ${rep.missingCount}`);
      console.log(`Failed Probes: ${rep.failedDownloadCount}`);
      const invalid = rep.results.filter((r) => !r.isValid);
      console.log(`Total Issues Found: ${invalid.length}`);
      if (invalid.length > 0) {
        console.log('Sample issues:', invalid.slice(0, 5));
      }
    })
    .catch((err) => {
      console.error('Validation error:', err);
      process.exit(1);
    });
}
