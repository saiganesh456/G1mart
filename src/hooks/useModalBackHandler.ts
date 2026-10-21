'use client';

import { useEffect } from 'react';

/**
 * Custom hook to handle Android physical/gesture back button for modals & drawers.
 * When the modal opens, it pushes a history state.
 * When the user taps the Android back button, the modal gracefully closes
 * without navigating away from the current storefront screen.
 */
export function useModalBackHandler(isOpen: boolean, onClose: () => void, modalId: string = 'modal') {
  useEffect(() => {
    if (!isOpen) return;

    const stateKey = `g1_${modalId}_open`;
    // Push state so back button pops it instead of exiting the page
    window.history.pushState({ [stateKey]: true }, '');

    const handlePopState = () => {
      onClose();
    };

    window.addEventListener('popstate', handlePopState);

    return () => {
      window.removeEventListener('popstate', handlePopState);
      // If modal was closed programmatically (e.g. by clicking X or backdrop),
      // unwind the history entry if it's still our state
      if (window.history.state && window.history.state[stateKey]) {
        window.history.back();
      }
    };
  }, [isOpen, onClose, modalId]);
}
