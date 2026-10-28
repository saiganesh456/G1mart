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
    // Google Play App Signing key certificate (Deployment cert)
    "62:BC:43:3D:87:24:C1:28:C0:78:BC:4E:9E:E3:20:56:82:E1:D5:C2:55:91:C7:B7:9C:38:79:EA:1F:C9:71:80",
    // Google Play App Signing key certificate (Hybrid Classical cert)
    "97:23:6D:05:60:2A:E1:E3:8F:CE:41:11:C5:03:93:FE:A3:87:A0:CF:BF:D8:E8:F3:B1:89:73:17:44:6E:D5:12",
    // Google Play App Signing key certificate (Hybrid PQC cert)
    "42:5C:A8:D4:19:28:C9:03:E0:2E:CA:6A:D7:E4:7A:76:84:CF:0B:33:09:C9:A1:B1:50:D9:A0:80:95:B2:52:83",
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
