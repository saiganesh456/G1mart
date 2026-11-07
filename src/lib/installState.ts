// Utility for managing G1mart App APK installation and persistent prompt suppression

const GLOBAL_INSTALLED_KEY = 'g1mart_app_installed';
const DISMISSED_KEY = 'g1mart_install_dismissed';

let deferredInstallPrompt: any = null;

if (typeof window !== 'undefined') {
  window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault();
    deferredInstallPrompt = e;
  });
}

export function getDeferredInstallPrompt() {
  return deferredInstallPrompt;
}

export function clearDeferredInstallPrompt() {
  deferredInstallPrompt = null;
}

export function isAppInstalled(userId?: string | null): boolean {
  if (typeof window === 'undefined') return false;

  try {
    const globalState = localStorage.getItem(GLOBAL_INSTALLED_KEY) === 'true';
    if (globalState) return true;

    if (userId) {
      const userState = localStorage.getItem(`${GLOBAL_INSTALLED_KEY}_${userId}`) === 'true';
      if (userState) return true;
    }

    // Check if running in standalone PWA mode
    if (window.matchMedia('(display-mode: standalone)').matches) {
      return true;
    }

    // Check if running in minimal-ui mode
    if (window.matchMedia('(display-mode: minimal-ui)').matches) {
      return true;
    }

    // iOS standalone check
    if ((navigator as any).standalone) {
      return true;
    }

    // Android app WebView / TWA / referrer
    const ua = navigator.userAgent || '';
    if (
      ua.includes('wv') ||
      ua.includes('G1Mart') ||
      ua.includes('g1mart') ||
      (typeof document !== 'undefined' && document.referrer.includes('android-app://'))
    ) {
      return true;
    }
  } catch {}

  return false;
}

export function markAppInstalled(userId?: string | null): void {
  if (typeof window === 'undefined') return;

  try {
    localStorage.setItem(GLOBAL_INSTALLED_KEY, 'true');
    if (userId) {
      localStorage.setItem(`${GLOBAL_INSTALLED_KEY}_${userId}`, 'true');
    }
  } catch {}
}

export function isInstallDismissed(): boolean {
  if (typeof window === 'undefined') return false;

  try {
    return localStorage.getItem(DISMISSED_KEY) === 'true';
  } catch {
    return false;
  }
}

export function markInstallDismissed(): void {
  if (typeof window === 'undefined') return;

  try {
    localStorage.setItem(DISMISSED_KEY, 'true');
  } catch {}
}

export const PLAY_STORE_URL = 'https://play.google.com/store/apps/details?id=in.g1mart.twa';

export async function executeInstallFlow(
  userId?: string | null,
  fallbackUrl: string = PLAY_STORE_URL
): Promise<'pwa' | 'store'> {
  markAppInstalled(userId);

  // 1. If Chrome PWA prompt is available, launch WebAPK native installation
  if (deferredInstallPrompt) {
    try {
      const promptEvent = deferredInstallPrompt;
      clearDeferredInstallPrompt();
      promptEvent.prompt();
      const choiceResult = await promptEvent.userChoice;
      if (choiceResult && choiceResult.outcome === 'accepted') {
        return 'pwa';
      }
    } catch (err) {
      console.warn('[Install] PWA prompt failed, falling back to Play Store:', err);
    }
  }

  // 2. Open Official Google Play Store listing
  if (typeof window !== 'undefined') {
    window.open(fallbackUrl, '_blank', 'noopener,noreferrer');
  }

  return 'store';
}
