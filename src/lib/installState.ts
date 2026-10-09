// Utility for managing G1 Mart App APK installation and persistent prompt suppression

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

export async function executeInstallFlow(
  userId?: string | null,
  apkUrl: string = '/downloads/g1mart.apk'
): Promise<'pwa' | 'apk'> {
  markAppInstalled(userId);

  // Trigger global APK download / installation notification & chime
  if (typeof window !== 'undefined') {
    try {
      window.dispatchEvent(new CustomEvent('g1mart:apk-downloaded'));
    } catch {}
  }

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
      console.warn('[Install] PWA prompt failed, falling back to direct APK download:', err);
    }
  }

  // 2. Direct APK Download (Android Browser fallback or direct requested APK delivery)
  if (typeof window !== 'undefined') {
    const link = document.createElement('a');
    link.href = apkUrl;
    link.setAttribute('download', 'g1mart.apk');
    document.body.appendChild(link);
    link.click();
    setTimeout(() => {
      if (link.parentNode) link.parentNode.removeChild(link);
    }, 500);
  }

  return 'apk';
}
