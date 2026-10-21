import { NextResponse } from 'next/server';

/**
 * Google Play Store Digital Asset Links API Route
 *
 * Essential for Trusted Web Activity (TWA) verification.
 * Android checks this cryptographic declaration to verify that the domain owner
 * authorizes the mobile app, thereby hiding the Chrome address bar.
 *
 * Verification URL:
 * https://digitalassetlinks.googleapis.com/v1/statements:list?source.web.site=https://g1mart.in&relation=delegate_permission/common.handle_all_urls
 */
export async function GET() {
  const envFingerprints = process.env.PLAY_STORE_SHA256_FINGERPRINTS
    ? process.env.PLAY_STORE_SHA256_FINGERPRINTS.split(',').map((f) => f.trim())
    : [];

  const defaultFingerprints = [
    // Replace with the SHA-256 fingerprint generated from your release keystore (.jks)
    // or Google Play App Signing certificate fingerprint in Google Play Console
    "4A:2B:9C:8D:1E:F3:A2:7B:8C:9D:0E:1F:2A:3B:4C:5D:6E:7F:80:91:A2:B3:C4:D5:E6:F7:08:19:2A:3B:4C:5D",
    ...envFingerprints,
  ];

  const assetLinks = [
    {
      relation: ["delegate_permission/common.handle_all_urls"],
      target: {
        namespace: "android_app",
        package_name: "in.g1mart.store",
        sha256_cert_fingerprints: defaultFingerprints,
      },
    },
    {
      relation: ["delegate_permission/common.handle_all_urls"],
      target: {
        namespace: "android_app",
        package_name: "com.g1mart.app",
        sha256_cert_fingerprints: defaultFingerprints,
      },
    },
  ];

  return NextResponse.json(assetLinks, {
    status: 200,
    headers: {
      'Content-Type': 'application/json',
      'Cache-Control': 'public, max-age=86400, s-maxage=86400',
    },
  });
}
