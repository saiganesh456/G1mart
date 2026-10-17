import zipfile
import os

apk_path = 'public/downloads/g1mart.apk'
os.makedirs(os.path.dirname(apk_path), exist_ok=True)
icon_path = 'public/icons/icon-512x512.png'

manifest_xml = '''<?xml version="1.0" encoding="utf-8"?>
<manifest xmlns:android="http://schemas.android.com/apk/res/android"
    package="com.jeevanmart.app"
    android:versionCode="102"
    android:versionName="1.2.0">
    <uses-permission android:name="android.permission.INTERNET" />
    <application
        android:allowBackup="true"
        android:icon="@mipmap/ic_launcher"
        android:label="Jeevan Mart"
        android:roundIcon="@mipmap/ic_launcher_round"
        android:supportsRtl="true">
        <activity
            android:name=".MainActivity"
            android:exported="true">
            <intent-filter>
                <action android:name="android.intent.action.MAIN" />
                <category android:name="android.intent.category.LAUNCHER" />
            </intent-filter>
        </activity>
    </application>
</manifest>'''

with zipfile.ZipFile(apk_path, 'w', zipfile.ZIP_DEFLATED) as z:
    z.writestr('META-INF/MANIFEST.MF', 'Manifest-Version: 1.0\nCreated-By: Jeevan Mart 1.2.0\n')
    z.writestr('AndroidManifest.xml', manifest_xml)
    if os.path.exists(icon_path):
        z.write(icon_path, 'res/mipmap-xxxhdpi/ic_launcher.png')
        z.write(icon_path, 'res/mipmap-xxxhdpi/ic_launcher_round.png')
        z.write(icon_path, 'res/drawable/ic_launcher.png')
    z.writestr('assets/app_config.json', '{"app_name": "Jeevan Mart", "version": "1.2.0"}')

print(f'APK written: {os.path.getsize(apk_path)} bytes')
