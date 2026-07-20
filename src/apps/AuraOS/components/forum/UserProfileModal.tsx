/**
 * UserProfileModal - User Profile Display and Editing
 * Shows user info, bio, practice focus, subscription tier, and recent posts
 * Allows editing own profile bio and practice focus
 */

import React, { useState, useEffect } from 'react';
import { ForumAuthor, ForumPost } from '../../types';
import { getUserForumProfile, updateUserForumProfile } from '../../services/forumService';
import { supabase } from '../../services/supabaseClient';

interface UserProfileModalProps {
  userId: string;
  onClose: () => void;
}

const PRACTICE_MODULES = ['Shadow', 'Mind', 'Body', 'Spirit'];

function CloseIcon() {
  return (
    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <line x1="18" y1="6" x2="6" y2="18" />
      <line x1="6" y1="6" x2="18" y2="18" />
    </svg>
  );
}

export default function UserProfileModal({ userId, onClose }: UserProfileModalProps) {
  const [profile, setProfile] = useState<(ForumAuthor & { recentPosts: ForumPost[] }) | null>(null);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [editBio, setEditBio] = useState('');
  const [editPracticeFocus, setEditPracticeFocus] = useState<string[]>([]);
  const [saving, setSaving] = useState(false);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);

  useEffect(() => {
    const fetchProfile = async () => {
      setLoading(true);
      const result = await getUserForumProfile(userId);
      setProfile(result);
      if (result) {
        setEditBio(result.bio || '');
        setEditPracticeFocus(result.practice_focus || []);
      }
      setLoading(false);
    };

    const getCurrentUser = async () => {
      const { data } = await supabase.auth.getUser();
      setCurrentUserId(data.user?.id || null);
    };

    fetchProfile();
    getCurrentUser();
  }, [userId]);

  const handleSaveProfile = async () => {
    if (currentUserId !== userId) return;
    setSaving(true);
    try {
      await updateUserForumProfile(userId, {
        bio: editBio || undefined,
        practice_focus: editPracticeFocus,
      });
      setProfile((prev) =>
        prev
          ? {
              ...prev,
              bio: editBio || null,
              practice_focus: editPracticeFocus,
            }
          : null
      );
      setIsEditing(false);
    } catch (error) {
      console.error('Error saving profile:', error);
    }
    setSaving(false);
  };

  const isOwnProfile = currentUserId === userId;

  if (loading) {
    return (
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
        <div className="bg-stone-900 border border-stone-800 rounded-xl p-8 max-w-md w-full max-h-[90vh] overflow-y-auto">
          <div className="text-center text-stone-400">Loading profile...</div>
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
        <div className="bg-stone-900 border border-stone-800 rounded-xl p-8 max-w-md w-full">
          <div className="text-center text-stone-400">Profile not found</div>
          <button
            onClick={onClose}
            className="mt-4 w-full px-4 py-2 rounded-lg border border-stone-700 text-stone-300 hover:bg-stone-800"
          >
            Close
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50" onClick={onClose}>
      <div
        className="bg-stone-900 border border-stone-800 rounded-xl p-6 max-w-md w-full max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-start justify-between mb-6">
          <h2 className="text-lg font-semibold text-stone-100">Profile</h2>
          <button
            onClick={onClose}
            className="p-1 text-stone-400 hover:text-stone-200 hover:bg-stone-800 rounded transition-colors"
          >
            <CloseIcon />
          </button>
        </div>

        {/* Avatar and Name */}
        <div className="flex items-center gap-4 mb-6">
          <div className="w-16 h-16 rounded-full bg-gradient-to-br from-cyan-600 to-cyan-800 flex items-center justify-center text-2xl font-semibold text-white">
            {profile.display_name
              ? profile.display_name
                  .split(' ')
                  .map((n) => n[0])
                  .join('')
                  .toUpperCase()
                  .slice(0, 2)
              : 'AN'}
          </div>
          <div>
            <h3 className="text-stone-100 font-medium">{profile.display_name || 'Anonymous'}</h3>
            {profile.subscription_tier && (
              <span className="text-xs text-amber-400">
                {profile.subscription_tier.charAt(0).toUpperCase() + profile.subscription_tier.slice(1)} Member
              </span>
            )}
            {profile.created_at && (
              <div className="text-xs text-stone-500">
                Joined {new Date(profile.created_at).toLocaleDateString()}
              </div>
            )}
          </div>
        </div>

        {/* Bio */}
        <div className="mb-6">
          <h4 className="text-xs font-semibold text-stone-400 uppercase mb-2">Bio</h4>
          {isEditing && isOwnProfile ? (
            <textarea
              value={editBio}
              onChange={(e) => setEditBio(e.target.value)}
              maxLength={500}
              rows={3}
              className="w-full px-3 py-2 rounded-lg bg-stone-950/50 border border-stone-700 text-stone-200 placeholder-stone-600 focus:outline-none focus:border-cyan-600"
              placeholder="Write something about yourself..."
            />
          ) : (
            <p className="text-sm text-stone-300">{profile.bio || '—'}</p>
          )}
        </div>

        {/* Practice Focus */}
        <div className="mb-6">
          <h4 className="text-xs font-semibold text-stone-400 uppercase mb-2">Practice Focus</h4>
          {isEditing && isOwnProfile ? (
            <div className="flex flex-wrap gap-2">
              {PRACTICE_MODULES.map((module) => (
                <button
                  key={module}
                  onClick={() => {
                    const lower = module.toLowerCase();
                    setEditPracticeFocus((prev) =>
                      prev.includes(lower) ? prev.filter((m) => m !== lower) : [...prev, lower]
                    );
                  }}
                  className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
                    editPracticeFocus.includes(module.toLowerCase())
                      ? 'bg-purple-900/40 border border-purple-600/50 text-purple-300'
                      : 'border border-stone-700 text-stone-400 hover:text-stone-200'
                  }`}
                >
                  {module}
                </button>
              ))}
            </div>
          ) : (
            <div className="flex flex-wrap gap-2">
              {profile.practice_focus && profile.practice_focus.length > 0 ? (
                profile.practice_focus.map((module) => (
                  <span
                    key={module}
                    className="px-3 py-1.5 rounded-full text-xs font-medium bg-purple-900/40 border border-purple-600/50 text-purple-300"
                  >
                    {module.charAt(0).toUpperCase() + module.slice(1)}
                  </span>
                ))
              ) : (
                <span className="text-sm text-stone-500">—</span>
              )}
            </div>
          )}
        </div>

        {/* Recent Posts */}
        {profile.recentPosts && profile.recentPosts.length > 0 && (
          <div className="mb-6">
            <h4 className="text-xs font-semibold text-stone-400 uppercase mb-2">Recent Posts</h4>
            <div className="space-y-2">
              {profile.recentPosts.slice(0, 5).map((post) => (
                <div
                  key={post.id}
                  className="p-2 rounded-lg bg-stone-800/30 border border-stone-700 text-xs"
                >
                  <div className="text-stone-300 line-clamp-2">{post.content.substring(0, 100)}...</div>
                  <div className="text-stone-500 text-xs mt-1">
                    {new Date(post.created_at).toLocaleDateString()}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-2 justify-end">
          {isOwnProfile && (
            <>
              {!isEditing ? (
                <button
                  onClick={() => setIsEditing(true)}
                  className="px-4 py-2 rounded-lg border border-cyan-600/50 bg-cyan-900/40 text-cyan-300 hover:bg-cyan-900/60 transition-colors"
                >
                  Edit Profile
                </button>
              ) : (
                <>
                  <button
                    onClick={() => setIsEditing(false)}
                    disabled={saving}
                    className="px-4 py-2 rounded-lg border border-stone-700 text-stone-300 hover:bg-stone-800 disabled:opacity-50"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSaveProfile}
                    disabled={saving}
                    className="px-4 py-2 rounded-lg bg-cyan-900/40 border border-cyan-600/50 text-cyan-300 hover:bg-cyan-900/60 disabled:opacity-50"
                  >
                    {saving ? 'Saving...' : 'Save'}
                  </button>
                </>
              )}
            </>
          )}
          {!isEditing && (
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-lg border border-stone-700 text-stone-300 hover:bg-stone-800"
            >
              Close
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
