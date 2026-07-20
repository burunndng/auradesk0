/**
 * UserProfileMenu - User Profile Dropdown
 *
 * Displays user email/name and provides quick actions:
 * - View profile
 * - Sign out
 * - Sign in (if not authenticated)
 *
 * Designed for NavSidebar integration
 */

import React, { useState, useRef, useEffect } from 'react';
import { User, LogOut, LogIn, ChevronDown, Settings } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

// Lazy load ProfileModal to prevent blocking
const ProfileModal = React.lazy(() => import('../modals/ProfileModal'));

export default function UserProfileMenu() {
  const { user, isAuthenticated, signOut, setShowAuthModal } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // Debug logging
  useEffect(() => {
    console.log('[UserProfileMenu] Rendered - isAuthenticated:', isAuthenticated, 'user:', user?.email);
  }, [isAuthenticated, user]);

  // Close menu when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => {
        document.removeEventListener('mousedown', handleClickOutside);
      };
    }
  }, [isOpen]);

  const handleSignOut = async () => {
    try {
      await signOut();
      setIsOpen(false);
    } catch (err) {
      console.error('Sign out error:', err);
    }
  };

  const handleSignIn = () => {
    setShowAuthModal(true);
    setIsOpen(false);
  };

  // If not authenticated, show sign-in button (MATCHING NavSidebar button style)
  if (!isAuthenticated) {
    return (
      <button
        onClick={handleSignIn}
        className="w-full flex items-center gap-3 px-3 py-3 rounded-lg text-xs font-medium font-sans text-neutral-400 hover:text-teal-400 hover:bg-teal-900/30 hover:border hover:border-teal-500/40 transition-all duration-500 group shadow-sm hover:shadow-md touch-target"
        style={{ boxShadow: '0 2px 8px rgba(0, 0, 0, 0.15), inset 0 1px 2px rgba(255, 255, 255, 0.03)', backdropFilter: 'blur(8px)' }}
      >
        <LogIn size={16} className="group-hover:scale-110 transition-transform duration-500 flex-shrink-0" />
        <span>Sign In</span>
      </button>
    );
  }

  // Authenticated: Show user menu
  return (
    <div ref={menuRef} className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center gap-3 px-3 py-3 rounded-lg text-xs font-medium font-sans text-neutral-400 hover:text-amber-400 hover:bg-amber-900/30 hover:border hover:border-amber-500/40 transition-all duration-500 group shadow-sm hover:shadow-md touch-target"
        style={{ boxShadow: '0 2px 8px rgba(0, 0, 0, 0.15), inset 0 1px 2px rgba(255, 255, 255, 0.03)', backdropFilter: 'blur(8px)' }}
      >
        <User size={16} className="group-hover:scale-110 transition-transform duration-500 flex-shrink-0" />
        <span className="flex-1 text-left">
          {user?.displayName || user?.email || 'User'}
        </span>
        <ChevronDown
          size={14}
          className={`transition-transform flex-shrink-0 ${isOpen ? 'rotate-180' : ''}`}
        />
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute bottom-full left-0 w-full mb-2 bg-stone-900 border border-stone-700 rounded-md shadow-xl overflow-hidden z-50">
          {/* User Info */}
          <div className="px-3 py-2 border-b border-stone-700">
            <div className="text-xs text-stone-400">Signed in as</div>
            <div className="text-sm text-stone-200 truncate mt-0.5">
              {user?.email}
            </div>
          </div>

          {/* Actions */}
          <div className="py-1">
            <button
              onClick={() => {
                setShowProfileModal(true);
                setIsOpen(false);
              }}
              className="flex items-center gap-2 w-full px-3 py-2 text-sm text-stone-300 hover:text-amber-400 hover:bg-stone-800/50 transition-colors"
            >
              <Settings size={16} />
              <span>Edit Profile</span>
            </button>

            <button
              onClick={handleSignOut}
              className="flex items-center gap-2 w-full px-3 py-2 text-sm text-rose-400 hover:text-rose-300 hover:bg-stone-800/50 transition-colors"
            >
              <LogOut size={16} />
              <span>Sign Out</span>
            </button>
          </div>
        </div>
      )}

      {/* Profile Modal (only render when authenticated) */}
      {isAuthenticated && showProfileModal && (
        <React.Suspense fallback={null}>
          <ProfileModal
            isOpen={showProfileModal}
            onClose={() => setShowProfileModal(false)}
          />
        </React.Suspense>
      )}
    </div>
  );
}
