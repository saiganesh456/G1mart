import { NextResponse } from 'next/server';

export const dynamic = 'force-static';
export const revalidate = 86400;

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
    // Google Play App Signing key certificate (Play Integrity / Closed Testing & Production)
    "62:BC:43:3D:87:24:C1:28:C0:78:BC:4E:9E:E3:20:56:82:E1:D5:C2:55:91:C7:B7:9C:38:79:EA:1F:C9:71:80",
    // Local / PWABuilder upload signing key certificate
    "7C:77:EB:9D:0F:EE:E5:17:B9:C6:32:9D:AB:73:BB:53:77:6C:C8:48:65:9A:07:F1:3C:B6:3F:68:4E:13:81:47",
    ...envFingerprints,
  ];

  const assetLinks = [
    {
      relation: ["delegate_permission/common.handle_all_urls"],
      target: {
        namespace: "android_app",
        package_name: "in.g1mart.twa",
        sha256_cert_fingerprints: defaultFingerprints,
      },
    },
    {
      relation: ["delegate_permission/common.handle_all_urls"],
      target: {
        namespace: "android_app",
        package_name: "in.g1mart.store",
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
