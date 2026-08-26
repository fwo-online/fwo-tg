import { hapticFeedback } from '@tma.js/sdk-svelte';

export type HapticType =
  | 'light'
  | 'medium'
  | 'heavy'
  | 'rigid'
  | 'soft'
  | 'error'
  | 'success'
  | 'warning';

export function triggerHaptic(type: HapticType = 'light') {
  try {
    if (type === 'error' || type === 'success' || type === 'warning') {
      if (hapticFeedback.notificationOccurred.isAvailable()) {
        hapticFeedback.notificationOccurred(type);
      }
    } else {
      if (hapticFeedback.impactOccurred.isAvailable()) {
        hapticFeedback.impactOccurred(type);
      }
    }
  } catch {
    // Fallback gracefully when running outside of Telegram Mini App
  }
}
