import { useEffect } from 'react';

export const useVirtualKeyboard = () => {
  useEffect(() => {
    const handleResize = () => {
      // When keyboard appears, visualHeight shrinks
      const visualHeight = window.visualViewport?.height ?? window.innerHeight;
      const layoutHeight = window.innerHeight;

      // Keyboard is visible if visual < layout (with margin for keyboard size ~300px)
      const keyboardOpen = layoutHeight - visualHeight > 100;

      if (keyboardOpen) {
        // Scroll focused input into view
        const focusedEl = document.activeElement as HTMLElement;
        if (focusedEl?.scrollIntoView) {
          setTimeout(() => focusedEl.scrollIntoView({ behavior: 'smooth', block: 'center' }), 100);
        }
      }
    };

    window.visualViewport?.addEventListener('resize', handleResize);
    return () => window.visualViewport?.removeEventListener('resize', handleResize);
  }, []);
};
