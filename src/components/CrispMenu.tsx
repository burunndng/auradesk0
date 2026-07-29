// Crisp, high-fidelity menu component
// Mobile-optimized with crisp rendering and reduced blur
// Replaces blurry menus with better performance and clarity

import { useState, useRef, useEffect, forwardRef } from 'react';
import { cn } from '@/lib/utils';

interface CrispMenuProps {
  trigger: React.ReactNode;
  children: React.ReactNode;
  className?: string;
  positioning?: 'top-right' | 'bottom-left' | 'bottom-right' | 'top-left';
  mobileFullWidth?: boolean;
}

const CrispMenu = forwardRef<HTMLDivElement, CrispMenuProps>(({
  trigger,
  children,
  className,
  positioning = 'bottom-right',
  mobileFullWidth = false
}, ref) => {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLDivElement>(null);

  // Positioning styles
  const getPositionStyles = () => {
    const base = {
      'top-right': {
        top: '100%',
        right: 0,
        bottom: 'auto',
        left: 'auto',
        transformOrigin: 'top right',
      },
      'bottom-left': {
        bottom: '100%',
        left: 0,
        top: 'auto',
        right: 'auto',
        transformOrigin: 'bottom left',
      },
      'bottom-right': {
        bottom: '100%',
        right: 0,
        top: 'auto',
        left: 'auto',
        transformOrigin: 'bottom right',
      },
      'top-left': {
        top: 0,
        left: 0,
        bottom: 'auto',
        right: 'auto',
        transformOrigin: 'top left',
      },
    };
    return base[positioning];
  };

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node) && 
          triggerRef.current && !triggerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [isOpen]);

  // Close menu on escape key
  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      return () => document.removeEventListener('keydown', handleEscape);
    }
  }, [isOpen]);

  return (
    <div ref={ref} className={cn('relative inline-block', className)}>
      <div ref={triggerRef} onClick={() => setIsOpen(!isOpen)}>
        {trigger}
      </div>
      
      {isOpen && (
        <div
          ref={menuRef}
          className={cn(
            'absolute z-[5000] mt-1 py-1',
            'bg-[var(--bg-surface)]',
            'border border-[var(--border-subtle)]',
            'rounded-xl',
            'shadow-lg',
            'backdrop-blur-sm', // Reduced blur
            'overflow-hidden',
            'min-w-[220px]',
            'transform-gpu',
            'will-change-transform'
          )}
          style={getPositionStyles()}
        >
          {children}
        </div>
      )}
    </div>
  );
});

CrispMenu.displayName = 'CrispMenu';

export default CrispMenu;