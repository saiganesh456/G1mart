/**
 * Safe, modern haptic vibration feedback utility for mobile web & PWA
 */
export function triggerHapticFeedback(pattern: number | number[] = 18) {
  if (typeof window === 'undefined') return;

  if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
    try {
      // Modern subtle haptic tick (15ms - 25ms is standard for native app feel)
      navigator.vibrate(pattern);
    } catch {
      // Gracefully ignore if device or browser permissions disable vibration
    }
  }
}

/**
 * Quick crisp tick for bottom navigation tab switching
 */
export function triggerNavHaptic() {
  triggerHapticFeedback(20);
}

/**
 * Double tick for successful order placement or payment confirmation
 */
export function triggerSuccessHaptic() {
  triggerHapticFeedback([25, 40, 25]);
}
