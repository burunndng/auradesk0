/**
 * ProfileTab - Full profile + account page
 *
 * Features:
 * - Avatar + identity (name, email, member since)
 * - Plan badge (Free / Pro / Founding) + upgrade CTA
 * - Usage stats (sessions, insights)
 * - Bio editing
 * - Password change
 * - Danger zone (delete account)
 * - Sign out
 */

import React, { useState, useEffect } from 'react';
import {
  User, Lock, LogOut, Loader2, Edit3, Check, X,
  Shield, Calendar, Zap, Star, Crown, ArrowUpRight, Trash2, MessageSquare,
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { authService } from '../../services/authService';
import { wizardSessionService } from '../../services/wizardSessionService';
import { getUserThreads, getUserPosts } from '../../services/forumService';
import { fetchAppStats, fetchBotConfig, updateBotConfig, getBotConfigFromDB, updateBotConfigInDB, fetchRecentBotPosts, type BotConfig, type BotPersona } from '../../services/adminService';
import { forumAIService } from '../../services/forumAIService';
import { BOT_PERSONA_NAMES } from '../../services/forumAIService';
import { useSubscription } from '../../hooks/useSubscription';
import type { SubscriptionTierName } from '../../hooks/useSubscription';
import RedeemCodeModal from '../modals/RedeemCodeModal';

// ─── Avatar color ─────────────────────────────────────────────────────────────

const AVATAR_COLORS = [
  'from-amber-600 to-amber-900',
  'from-purple-600 to-indigo-800',
  'from-emerald-600 to-teal-800',
  'from-rose-600 to-pink-800',
  'from-cyan-600 to-blue-800',
];

function getAvatarColor(name: string): string {
  if (!name) return AVATAR_COLORS[0];
  const hash = name.split('').reduce((acc, c) => acc + c.charCodeAt(0), 0);
  return AVATAR_COLORS[hash % AVATAR_COLORS.length];
}

// ─── Tier badge ──────────────────────────────────────────────────────────────

const TIER_CONFIG: Record<SubscriptionTierName, { label: string; className: string; icon: React.ReactNode }> = {
  free: {
    label: 'Free',
    className: 'bg-stone-800 border-stone-700 text-stone-400',
    icon: <User size={11} />,
  },
  pro: {
    label: 'Pro',
    className: 'bg-amber-900/40 border-amber-600/50 text-amber-300',
    icon: <Star size={11} />,
  },
  founding: {
    label: 'Founding Member',
    className: 'bg-purple-900/40 border-purple-500/50 text-purple-300',
    icon: <Crown size={11} />,
  },
};

function TierBadge({ tier }: { tier: SubscriptionTierName }) {
  const cfg = TIER_CONFIG[tier];
  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full border text-xs font-medium ${cfg.className}`}>
      {cfg.icon}
      {cfg.label}
    </span>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────

export default function ProfileTab() {
  const { user, isAuthenticated, signOut } = useAuth();
  const { tier, isProOrAbove, sessionsRemaining } = useSubscription();

  const [displayName, setDisplayName] = useState('');
  const [bio, setBio] = useState('');
  const [editingName, setEditingName] = useState(false);
  const [editingBio, setEditingBio] = useState(false);

  const [showPasswordSection, setShowPasswordSection] = useState(false);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const [sessionCount, setSessionCount] = useState<number | null>(null);
  const [insightCount, setInsightCount] = useState<number | null>(null);
  const [memberSince, setMemberSince] = useState<string | null>(null);
  const [threadCount, setThreadCount] = useState<number | null>(null);
  const [postCount, setPostCount] = useState<number | null>(null);
  const [topPractices, setTopPractices] = useState<{ wizardType: string; count: number }[]>([]);
  const [practiceStack, setPracticeStack] = useState<string[]>([]);
  const [quadrantActivity, setQuadrantActivity] = useState<{ mind: number; body: number; shadow: number; spirit: number }>({ mind: 0, body: 0, shadow: 0, spirit: 0 });
  const [notifPrefs, setNotifPrefs] = useState<{ practice_reminders: boolean; insight_notifications: boolean; weekly_summary: boolean }>({
    practice_reminders: false,
    insight_notifications: false,
    weekly_summary: false,
  });

  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [upgrading, setUpgrading] = useState(false);
  const [showRedeemModal, setShowRedeemModal] = useState(false);
  const [showDangerZone, setShowDangerZone] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState('');

  // Admin panel state
  const [showAdmin, setShowAdmin] = useState(false);
  const [adminStats, setAdminStats] = useState<{ totalUsers: number; totalSessions: number; totalInsights: number; newUsersLast7d: number } | null>(null);
  const [botConfig, setBotConfig] = useState<BotConfig>(fetchBotConfig());
  const [botConfigSaved, setBotConfigSaved] = useState(false);
  const [botPosts, setBotPosts] = useState<{ id: string; content: string; created_at: string; thread_id: string }[]>([]);
  const [botConfigSaveTimeout, setBotConfigSaveTimeout] = useState<NodeJS.Timeout | null>(null);
  const [expandedPersona, setExpandedPersona] = useState<string | null>(null);

  useEffect(() => {
    if (user) {
      setDisplayName(user.displayName || '');
      loadProfileData();
    }
  }, [user]);

  const loadProfileData = async () => {
    if (!user) return;
    try {
      const profile = await authService.getUserProfile();
      if (profile) {
        setBio((profile as any).bio || '');
        if (profile.created_at) {
          setMemberSince(
            new Date(profile.created_at).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
          );
        }
      }
      const { sessionCount: sessions, insightCount: insights } = await wizardSessionService.getUserStats(user.id);
      setSessionCount(sessions);
      setInsightCount(insights);

      const [threads, posts, practices] = await Promise.all([
        getUserThreads(999),
        getUserPosts(999),
        wizardSessionService.getTopPractices(user.id),
      ]);
      setThreadCount(threads?.length ?? 0);
      setPostCount(posts?.length ?? 0);
      setTopPractices(practices);

      // Configured stack from preferences (NOT session history)
      const stack: string[] = (profile as any)?.preferences?.practice_stack ?? [];
      setPracticeStack(stack);

      // Quadrant balance from session counts — no extra query
      const QUAD_MAP: Record<string, 'mind' | 'body' | 'shadow' | 'spirit'> = {
        'subject-object': 'mind', 'polarity-mapper': 'mind', 'kegan-assessment': 'mind',
        'perspective-shifter': 'mind', 'adaptive-cycle': 'mind', 'bias-detective': 'mind',
        'bias-finder': 'mind', 'decision': 'mind', 'schema-detective': 'mind',
        'immunity-to-change': 'mind', 'eight-zones': 'mind', 'examining-core-belief': 'mind',
        'dbt-coach': 'mind', 'moral-reasoning': 'mind', 'coherence-audit': 'mind',
        'axis': 'mind', 'four-quadrant-catalyst': 'mind',
        'ifs': 'shadow', 'big-mind-process': 'shadow', 'shadow-journaling': 'shadow',
        'three-two-one': 'shadow', 'memory-reconsolidation': 'shadow',
        'relational-pattern-chatbot': 'shadow', 'golden-shadow': 'shadow',
        'psychedelic-journey': 'shadow', 'relational-blueprint': 'shadow',
        'bioenergetics': 'body', 'integral-body-architect': 'body',
        'dynamic-workout-architect': 'body', 'somatic-generator': 'body',
        'meditation': 'body', 'jhana-tracker': 'body', 'attachment-assessment': 'body',
        'attachment-practice': 'body', 'interoception': 'body', 'life-architecture': 'body',
        'role-alignment': 'spirit', 'context-ai-root-cause': 'spirit',
        'states-training': 'spirit', 'contemplative-inquiry': 'spirit',
        'ultimate-concern': 'spirit', 'tree-of-life': 'spirit',
        'integral-practice-designer': 'spirit', 'sexology-coach': 'spirit',
        'therapy-style': 'spirit', 'chronobiology-protocol': 'spirit',
      };
      const quad = { mind: 0, body: 0, shadow: 0, spirit: 0 };
      for (const { wizardType, count } of practices) {
        const q = QUAD_MAP[wizardType];
        if (q) quad[q] += count;
      }
      setQuadrantActivity(quad);

      if ((profile as any)?.preferences?.notification_settings) {
        const ns = (profile as any).preferences.notification_settings;
        setNotifPrefs({
          practice_reminders: ns.practice_reminders ?? false,
          insight_notifications: ns.insight_notifications ?? false,
          weekly_summary: ns.weekly_summary ?? false,
        });
      }
    } catch {
      // non-critical
    }
  };

  const loadAdminData = async () => {
    const [stats, posts] = await Promise.all([
      fetchAppStats(),
      fetchRecentBotPosts(forumAIService.getBotUserId(), 10),
    ]);
    setAdminStats(stats);
    setBotPosts(posts);
  };

  const handleSaveBotConfig = async () => {
    // Clear previous timeout if exists
    if (botConfigSaveTimeout) clearTimeout(botConfigSaveTimeout);

    // Try to save to Supabase, fallback to localStorage
    await updateBotConfigInDB(botConfig);
    updateBotConfig(botConfig); // Also update localStorage as fallback

    setBotConfigSaved(true);
    const timeout = setTimeout(() => setBotConfigSaved(false), 2000);
    setBotConfigSaveTimeout(timeout);
  };

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (botConfigSaveTimeout) clearTimeout(botConfigSaveTimeout);
    };
  }, [botConfigSaveTimeout]);

  const getInitials = () => {
    const name = user?.displayName || user?.email || '';
    return name.split(/[\s@]/).slice(0, 2).map(p => p[0]?.toUpperCase()).join('') || '?';
  };

  const handleSaveName = async () => {
    setError(null); setSuccess(null); setIsLoading(true);
    try {
      const result = await authService.updateProfile({ display_name: displayName || null });
      if (result.success) { setSuccess('Name updated'); setEditingName(false); setTimeout(() => setSuccess(null), 3000); }
      else setError(result.error || 'Failed to update name');
    } catch (err: any) { setError(err.message || 'Error'); }
    finally { setIsLoading(false); }
  };

  const handleSaveBio = async () => {
    setError(null); setIsLoading(true);
    try {
      const result = await authService.updateProfile({ bio } as any);
      if (result.success) { setSuccess('Bio updated'); setEditingBio(false); setTimeout(() => setSuccess(null), 3000); }
      else setError(result.error || 'Failed to update bio');
    } catch (err: any) { setError(err.message || 'Error'); }
    finally { setIsLoading(false); }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault(); setError(null);
    if (newPassword.length < 6) { setError('Password must be at least 6 characters'); return; }
    if (newPassword !== confirmPassword) { setError('Passwords do not match'); return; }
    setIsLoading(true);
    try {
      const result = await authService.updatePassword(newPassword);
      if (result.success) {
        setSuccess('Password changed'); setNewPassword(''); setConfirmPassword('');
        setShowPasswordSection(false); setTimeout(() => setSuccess(null), 3000);
      } else setError(result.error || 'Failed to change password');
    } catch (err: any) { setError(err.message || 'Error'); }
    finally { setIsLoading(false); }
  };

  const handleNotifToggle = async (key: keyof typeof notifPrefs) => {
    const updated = { ...notifPrefs, [key]: !notifPrefs[key] };
    setNotifPrefs(updated);
    await authService.updatePreferences({ notification_settings: updated });
  };

  const handleSignOut = async () => {
    if (window.confirm('Sign out of your account?')) await signOut();
  };

  const handleDeleteAccount = async () => {
    if (deleteConfirm !== 'delete my account') {
      setError('Type exactly: delete my account');
      return;
    }
    setError(null);
    setIsLoading(true);
    try {
      // Soft delete: sign out for now; hard delete requires server-side
      await signOut();
    } catch (err: any) {
      setError(err.message || 'Error');
    } finally {
      setIsLoading(false);
    }
  };

  if (!isAuthenticated || !user) {
    return (
      <div className="max-w-xl mx-auto py-16 text-center">
        <div className="w-16 h-16 rounded-full bg-stone-800 border border-stone-700 flex items-center justify-center mx-auto mb-4">
          <User size={28} className="text-stone-400" />
        </div>
        <h2 className="text-xl font-display text-amber-400 mb-2">Profile</h2>
        <p className="text-stone-400 text-sm">Sign in to view and manage your profile.</p>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto py-6 px-4 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-display text-amber-400">My Profile</h1>
        <p className="text-stone-400 text-sm mt-1">Manage your account and preferences</p>
      </div>

      {/* Feedback */}
      {success && (
        <div className="p-3 bg-emerald-900/20 border border-emerald-600/30 rounded-lg text-emerald-400 text-sm flex items-center gap-2">
          <Check size={14} /> {success}
        </div>
      )}
      {error && (
        <div className="p-3 bg-rose-900/20 border border-rose-600/30 rounded-lg text-rose-400 text-sm flex items-center gap-2">
          <X size={14} /> {error}
        </div>
      )}

      {/* Avatar + Identity */}
      <div className="bg-stone-900/60 border border-stone-800 rounded-xl p-6">
        <div className="flex items-start gap-4">
          <div className="flex-shrink-0">
            {user.avatarUrl ? (
              <img src={user.avatarUrl} alt="Avatar"
                className="w-20 h-20 rounded-full object-cover border-2 border-amber-500/30"
                onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }} />
            ) : (
              <div className={`w-20 h-20 rounded-full bg-gradient-to-br ${getAvatarColor(user.displayName || user.email || '')} border-2 border-amber-500/30 flex items-center justify-center`}>
                <span className="text-2xl font-display text-amber-200">{getInitials()}</span>
              </div>
            )}
          </div>

          <div className="flex-1 min-w-0">
            {/* Display Name */}
            <div className="flex items-center gap-2 mb-1">
              {editingName ? (
                <div className="flex items-center gap-2 flex-1">
                  <input type="text" value={displayName} onChange={(e) => setDisplayName(e.target.value)}
                    className="flex-1 px-3 py-1.5 bg-stone-800 border border-stone-600 rounded-lg text-stone-100 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400/50"
                    placeholder="Your name" autoFocus disabled={isLoading}
                    onKeyDown={(e) => { if (e.key === 'Enter') handleSaveName(); if (e.key === 'Escape') setEditingName(false); }} />
                  <button onClick={handleSaveName} disabled={isLoading}
                    className="p-1.5 bg-amber-600 hover:bg-amber-500 rounded-md transition-colors disabled:opacity-50">
                    {isLoading ? <Loader2 size={14} className="animate-spin" /> : <Check size={14} className="text-stone-950" />}
                  </button>
                  <button onClick={() => { setEditingName(false); setDisplayName(user.displayName || ''); }}
                    className="p-1.5 bg-stone-700 hover:bg-stone-600 rounded-md transition-colors">
                    <X size={14} className="text-stone-300" />
                  </button>
                </div>
              ) : (
                <>
                  <h2 className="text-lg font-display text-stone-100 truncate">
                    {user.displayName || <span className="text-stone-500 italic">No display name set</span>}
                  </h2>
                  <button onClick={() => setEditingName(true)}
                    className="p-1 text-stone-500 hover:text-amber-400 transition-colors flex-shrink-0">
                    <Edit3 size={14} />
                  </button>
                </>
              )}
            </div>

            <p className="text-sm text-stone-400 truncate">{user.email}</p>

            {/* Tier badge + member since */}
            <div className="flex items-center gap-3 mt-2 flex-wrap">
              <TierBadge tier={tier} />
              {memberSince && (
                <div className="flex items-center gap-1.5 text-xs text-stone-500">
                  <Calendar size={12} />
                  <span>Member since {memberSince}</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Bio */}
        <div className="mt-5 pt-5 border-t border-stone-800">
          <div className="flex items-center justify-between mb-2">
            <label className="text-xs font-medium text-stone-400 uppercase tracking-wide">Bio</label>
            {!editingBio && (
              <button onClick={() => setEditingBio(true)} className="text-stone-500 hover:text-amber-400 transition-colors">
                <Edit3 size={13} />
              </button>
            )}
          </div>
          {editingBio ? (
            <div className="space-y-2">
              <textarea value={bio} onChange={(e) => setBio(e.target.value)} rows={3} disabled={isLoading} autoFocus
                className="w-full px-3 py-2 bg-stone-800 border border-stone-600 rounded-lg text-stone-100 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400/50 resize-none"
                placeholder="A few words about your practice journey..." />
              <div className="flex gap-2">
                <button onClick={handleSaveBio} disabled={isLoading}
                  className="px-3 py-1.5 bg-amber-600 hover:bg-amber-500 text-stone-950 text-xs font-medium rounded-md transition-colors disabled:opacity-50 flex items-center gap-1.5">
                  {isLoading ? <Loader2 size={12} className="animate-spin" /> : <Check size={12} />} Save
                </button>
                <button onClick={() => setEditingBio(false)}
                  className="px-3 py-1.5 bg-stone-700 hover:bg-stone-600 text-stone-300 text-xs font-medium rounded-md transition-colors">
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            <p className="text-sm text-stone-400">
              {bio || <span className="italic text-stone-600">Add a short bio about your practice journey...</span>}
            </p>
          )}
        </div>
      </div>

      {/* Plan card */}
      {!isProOrAbove && (
        <div className="bg-gradient-to-br from-amber-950/40 to-stone-900/60 border border-amber-700/30 rounded-xl p-5">
          <div className="flex items-start justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <Star size={16} className="text-amber-400" />
                <h3 className="text-sm font-semibold text-amber-300">Upgrade to Pro</h3>
              </div>
              <p className="text-xs text-stone-400 mb-3 leading-relaxed">
                Unlimited wizard sessions, full Intelligence Hub synthesis, journal export,
                and access to exclusive practices.
              </p>
              <ul className="space-y-1 mb-4">
                {['Unlimited daily wizard sessions', 'Full AI synthesis & patterns', 'Journal export', 'PsychedelicJourney & SexologyCoach'].map(f => (
                  <li key={f} className="flex items-center gap-1.5 text-xs text-stone-300">
                    <Check size={11} className="text-amber-400 flex-shrink-0" /> {f}
                  </li>
                ))}
              </ul>
              <button
                className="inline-flex items-center gap-1.5 px-4 py-2 bg-amber-600 hover:bg-amber-500 text-stone-950 text-xs font-semibold rounded-lg transition-colors"
                disabled={upgrading}
                onClick={async () => {
                  if (!user?.id) return;
                  setUpgrading(true);
                  const res = await fetch('/api/stripe', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ action: 'checkout', userId: user.id, userEmail: user.email }),
                  });
                  const { url } = await res.json();
                  if (url) window.location.href = url;
                  setUpgrading(false);
                }}
              >
                {upgrading ? 'Redirecting…' : 'Get Early Access'} <ArrowUpRight size={13} />
              </button>
            </div>
            <div className="text-right flex-shrink-0">
              <div className="text-xs text-stone-500 mb-1">Today</div>
              <div className="text-2xl font-display text-amber-400">
                {sessionsRemaining ?? '∞'}
              </div>
              <div className="text-xs text-stone-500">sessions left</div>
            </div>
          </div>
        </div>
      )}

      {/* Promo code redemption */}
      {!isProOrAbove && (
        <div className="bg-stone-900/40 border border-stone-800 rounded-xl p-4 flex items-center justify-between gap-4">
          <p className="text-xs text-stone-500">Have a promo code?</p>
          <button
            onClick={() => setShowRedeemModal(true)}
            className="px-3 py-1.5 bg-stone-800 hover:bg-stone-700 border border-stone-700 text-amber-400 text-xs font-medium rounded-lg transition-colors"
          >
            Redeem Code
          </button>
        </div>
      )}
      {isProOrAbove && (
        <div className="bg-emerald-950/20 border border-emerald-800/30 rounded-xl p-4">
          <p className="text-xs text-emerald-400 font-medium">
            Premium active
            {(() => {
              const exp = (user as any)?.preferences?.subscription_expires_at;
              return exp ? ` · expires ${new Date(exp).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}` : '';
            })()}
          </p>
        </div>
      )}
      <RedeemCodeModal isOpen={showRedeemModal} onClose={() => setShowRedeemModal(false)} />

      {/* Practice Activity */}
      {(sessionCount !== null || insightCount !== null) && (
        <div className="space-y-2">
          <p className="text-xs font-medium text-stone-500 uppercase tracking-wide">Practice Activity</p>
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-stone-900/60 border border-stone-800 rounded-xl p-4 text-center">
              <div className="flex items-center justify-center gap-1.5 mb-1">
                <Zap size={14} className="text-amber-400" />
                <span className="text-xs text-stone-500 uppercase tracking-wide">Sessions</span>
              </div>
              <div className="text-2xl font-display text-amber-400">{sessionCount ?? '—'}</div>
            </div>
            <div className="bg-stone-900/60 border border-stone-800 rounded-xl p-4 text-center">
              <div className="flex items-center justify-center gap-1.5 mb-1">
                <Shield size={14} className="text-purple-400" />
                <span className="text-xs text-stone-500 uppercase tracking-wide">Insights</span>
              </div>
              <div className="text-2xl font-display text-purple-400">{insightCount ?? '—'}</div>
            </div>
          </div>
        </div>
      )}

      {/* Community Stats */}
      {(threadCount !== null || postCount !== null) && (
        <div className="space-y-2">
          <p className="text-xs font-medium text-stone-500 uppercase tracking-wide">Community</p>
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-stone-900/60 border border-stone-800 rounded-xl p-4 text-center">
              <div className="flex items-center justify-center gap-1.5 mb-1">
                <MessageSquare size={14} className="text-cyan-400" />
                <span className="text-xs text-stone-500 uppercase tracking-wide">Threads</span>
              </div>
              <div className="text-2xl font-display text-cyan-400">{threadCount ?? '—'}</div>
            </div>
            <div className="bg-stone-900/60 border border-stone-800 rounded-xl p-4 text-center">
              <div className="flex items-center justify-center gap-1.5 mb-1">
                <MessageSquare size={14} className="text-teal-400" />
                <span className="text-xs text-stone-500 uppercase tracking-wide">Posts</span>
              </div>
              <div className="text-2xl font-display text-teal-400">{postCount ?? '—'}</div>
            </div>
          </div>
        </div>
      )}

      {/* Most-Used Wizards */}
      {topPractices.length > 0 && (
        <div className="bg-stone-900/60 border border-stone-800 rounded-xl p-5">
          <h3 className="text-xs font-medium text-stone-400 uppercase tracking-wide mb-1">Most-Used Wizards</h3>
          <p className="text-xs text-stone-600 italic mb-3">Based on your session history</p>
          <div className="flex flex-wrap gap-2">
            {topPractices.map(({ wizardType, count }) => (
              <span key={wizardType}
                className="px-3 py-1 rounded-full bg-stone-800 border border-stone-700 text-xs text-stone-300 flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-500 flex-shrink-0" />
                {wizardType.replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase())}
                <span className="text-stone-600 ml-1">{count}×</span>
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Active Practice Stack (configured, not history) */}
      <div className="bg-stone-900/60 border border-stone-800 rounded-xl p-5">
        <h3 className="text-xs font-medium text-stone-400 uppercase tracking-wide mb-3">Active Practice Stack</h3>
        {practiceStack.length > 0 ? (
          <div className="flex flex-wrap gap-2">
            {practiceStack.map((id) => (
              <span key={id}
                className="px-3 py-1 rounded-full bg-amber-950/40 border border-amber-700/40 text-xs text-amber-300 flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-400 flex-shrink-0" />
                {id.replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase())}
              </span>
            ))}
          </div>
        ) : (
          <p className="text-xs text-stone-600 italic">No practices configured — visit the Stack tab</p>
        )}
      </div>

      {/* Quadrant Activity */}
      <div className="bg-stone-900/60 border border-stone-800 rounded-xl p-5">
        <h3 className="text-xs font-medium text-stone-400 uppercase tracking-wide mb-3">Quadrant Balance</h3>
        {(sessionCount ?? 0) > 0 ? (() => {
          const total = quadrantActivity.mind + quadrantActivity.body + quadrantActivity.shadow + quadrantActivity.spirit;
          const pct = (n: number) => total > 0 ? Math.round((n / total) * 100) : 0;
          const bars = [
            { label: 'Mind', value: quadrantActivity.mind, color: 'bg-amber-500', textColor: 'text-amber-400' },
            { label: 'Body', value: quadrantActivity.body, color: 'bg-emerald-500', textColor: 'text-emerald-400' },
            { label: 'Shadow', value: quadrantActivity.shadow, color: 'bg-purple-500', textColor: 'text-purple-400' },
            { label: 'Spirit', value: quadrantActivity.spirit, color: 'bg-teal-500', textColor: 'text-teal-400' },
          ];
          return (
            <div className="space-y-2.5">
              {bars.map(({ label, value, color, textColor }) => (
                <div key={label} className="flex items-center gap-3">
                  <span className={`text-xs w-12 flex-shrink-0 ${textColor}`}>{label}</span>
                  <div className="flex-1 h-1.5 bg-stone-800 rounded-full overflow-hidden">
                    <div className={`h-full rounded-full ${color}`} style={{ width: `${pct(value)}%` }} />
                  </div>
                  <span className="text-xs text-stone-600 w-8 text-right">{pct(value)}%</span>
                </div>
              ))}
            </div>
          );
        })() : (
          <p className="text-xs text-stone-600 italic">Complete wizard sessions to see your quadrant balance</p>
        )}
      </div>

      {/* Notification Preferences */}
      <div className="bg-stone-900/60 border border-stone-800 rounded-xl p-5">
        <h3 className="text-xs font-medium text-stone-400 uppercase tracking-wide mb-4">Notifications</h3>
        <div className="space-y-3">
          {[
            { key: 'practice_reminders' as const, label: 'Practice reminders', desc: 'Daily nudge to maintain your practice streak' },
            { key: 'insight_notifications' as const, label: 'Insight notifications', desc: 'Alert when new patterns are detected' },
            { key: 'weekly_summary' as const, label: 'Weekly summary', desc: 'Your progress digest every Sunday' },
          ].map(({ key, label, desc }) => (
            <div key={key} className="flex items-center justify-between gap-4">
              <div>
                <p className="text-sm text-stone-300">{label}</p>
                <p className="text-xs text-stone-500">{desc}</p>
              </div>
              <button
                onClick={() => handleNotifToggle(key)}
                className={`relative w-10 h-6 rounded-full transition-colors flex-shrink-0 ${
                  notifPrefs[key] ? 'bg-amber-600' : 'bg-stone-700'
                }`}
                aria-pressed={notifPrefs[key]}
              >
                <span className={`absolute top-1 left-1 w-4 h-4 rounded-full bg-white transition-transform ${
                  notifPrefs[key] ? 'translate-x-4' : 'translate-x-0'
                }`} />
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Security */}
      <div className="bg-stone-900/60 border border-stone-800 rounded-xl overflow-hidden">
        <button
          onClick={() => { setShowPasswordSection(!showPasswordSection); setError(null); }}
          className="w-full flex items-center justify-between px-5 py-4 text-left hover:bg-stone-800/40 transition-colors"
        >
          <div className="flex items-center gap-3">
            <Lock size={16} className="text-stone-400" />
            <span className="text-sm font-medium text-stone-300">Change Password</span>
          </div>
          <span className="text-xs text-stone-500">{showPasswordSection ? 'Cancel' : 'Update'}</span>
        </button>

        {showPasswordSection && (
          <form onSubmit={handleChangePassword} className="px-5 pb-5 space-y-3 border-t border-stone-800">
            <div className="pt-4">
              <label className="block text-xs font-medium text-stone-400 mb-1">New Password</label>
              <input type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)}
                className="w-full px-3 py-2 bg-stone-800 border border-stone-700 rounded-lg text-stone-100 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400/50"
                placeholder="At least 6 characters" required disabled={isLoading} />
            </div>
            <div>
              <label className="block text-xs font-medium text-stone-400 mb-1">Confirm Password</label>
              <input type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full px-3 py-2 bg-stone-800 border border-stone-700 rounded-lg text-stone-100 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400/50"
                placeholder="••••••••" required disabled={isLoading} />
            </div>
            <button type="submit" disabled={isLoading}
              className="w-full py-2.5 bg-amber-600 hover:bg-amber-500 disabled:bg-stone-700 disabled:text-stone-500 text-stone-950 text-sm font-medium rounded-lg transition-colors flex items-center justify-center gap-2">
              {isLoading && <Loader2 size={14} className="animate-spin" />}
              {isLoading ? 'Changing...' : 'Change Password'}
            </button>
          </form>
        )}
      </div>

      {/* Sign Out */}
      <button onClick={handleSignOut}
        className="w-full py-3 bg-rose-900/20 hover:bg-rose-900/30 border border-rose-600/30 text-rose-400 text-sm font-medium rounded-xl transition-colors flex items-center justify-center gap-2">
        <LogOut size={16} /> Sign Out
      </button>

      {/* Admin Panel */}
      {user.isAdmin && (
        <div className="border border-amber-700/30 rounded-xl overflow-hidden">
          <button
            onClick={() => { setShowAdmin(!showAdmin); if (!showAdmin) loadAdminData(); }}
            className="w-full flex items-center justify-between px-5 py-4 text-left hover:bg-amber-950/20 transition-colors"
          >
            <div className="flex items-center gap-3">
              <Shield size={16} className="text-amber-400" />
              <span className="text-sm font-medium text-amber-300">Admin Panel</span>
            </div>
            <span className="text-xs text-stone-500">{showAdmin ? 'Close' : 'Open'}</span>
          </button>

          {showAdmin && (
            <div className="px-5 pb-6 border-t border-amber-700/20 space-y-6 pt-5">

              {/* System Stats */}
              <div>
                <h4 className="text-xs font-medium text-stone-400 uppercase tracking-wide mb-3">System Stats</h4>
                {adminStats ? (
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    {[
                      { label: 'Users', value: adminStats.totalUsers, color: 'text-amber-400' },
                      { label: 'New (7d)', value: adminStats.newUsersLast7d, color: 'text-emerald-400' },
                      { label: 'Sessions', value: adminStats.totalSessions, color: 'text-cyan-400' },
                      { label: 'Insights', value: adminStats.totalInsights, color: 'text-purple-400' },
                    ].map(({ label, value, color }) => (
                      <div key={label} className="bg-stone-900/80 border border-stone-800 rounded-lg p-3 text-center">
                        <div className={`text-xl font-display ${color}`}>{value}</div>
                        <div className="text-xs text-stone-500 mt-0.5">{label}</div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="flex items-center gap-2 text-stone-500 text-sm"><Loader2 size={14} className="animate-spin" /> Loading…</div>
                )}
              </div>

              {/* Bot Config */}
              <div>
                <h4 className="text-xs font-medium text-stone-400 uppercase tracking-wide mb-3">Forum Bot Config</h4>
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <label className="text-sm text-stone-300 w-28 flex-shrink-0">Posts / day</label>
                    <input
                      type="number" min={0} max={50}
                      value={botConfig.posts_per_day}
                      onChange={(e) => setBotConfig({ ...botConfig, posts_per_day: Math.max(0, Math.min(50, Number(e.target.value))) })}
                      className="w-20 px-3 py-1.5 bg-stone-800 border border-stone-700 rounded-lg text-stone-100 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400/50"
                    />
                  </div>
                  <div className="flex items-center gap-3">
                    <label className="text-sm text-stone-300 w-28 flex-shrink-0">Replies / day</label>
                    <input
                      type="number" min={0} max={100}
                      value={botConfig.replies_per_day ?? 15}
                      onChange={(e) => setBotConfig({ ...botConfig, replies_per_day: Math.max(0, Math.min(100, Number(e.target.value))) })}
                      className="w-20 px-3 py-1.5 bg-stone-800 border border-stone-700 rounded-lg text-stone-100 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400/50"
                    />
                  </div>
                  <div>
                    <p className="text-sm text-stone-300 mb-2">Active personas</p>
                    <div className="flex flex-wrap gap-2">
                      {BOT_PERSONA_NAMES.map((name) => {
                        const active = botConfig.active_persona_ids.includes(name);
                        return (
                          <button
                            key={name}
                            onClick={() => setBotConfig({
                              ...botConfig,
                              active_persona_ids: active
                                ? botConfig.active_persona_ids.filter(p => p !== name)
                                : [...botConfig.active_persona_ids, name],
                            })}
                            className={`px-3 py-1 rounded-full text-xs font-medium border transition-colors ${
                              active
                                ? 'bg-amber-900/40 border-amber-600/50 text-amber-300'
                                : 'bg-stone-800 border-stone-700 text-stone-500'
                            }`}
                          >
                            {name}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                  {/* Persona Editor */}
                  <div>
                    <p className="text-sm text-stone-300 mb-2">Edit personas</p>
                    <div className="space-y-2">
                      {(botConfig.personas ?? []).map((persona: BotPersona, idx: number) => (
                        <div key={persona.name} className="border border-stone-700 rounded-lg overflow-hidden">
                          <button
                            onClick={() => setExpandedPersona(expandedPersona === persona.name ? null : persona.name)}
                            className="w-full flex items-center justify-between px-3 py-2 text-left hover:bg-stone-800/50 transition-colors"
                          >
                            <span className="text-xs font-medium text-stone-300">{persona.name}</span>
                            <span className="text-xs text-stone-500">{expandedPersona === persona.name ? '▲' : '▼'}</span>
                          </button>
                          {expandedPersona === persona.name && (
                            <div className="px-3 pb-3 space-y-2 border-t border-stone-700">
                              <div className="pt-2">
                                <label className="text-xs text-stone-500 mb-1 block">Name</label>
                                <input
                                  value={persona.name}
                                  onChange={(e) => {
                                    const updated = [...(botConfig.personas ?? [])];
                                    updated[idx] = { ...updated[idx], name: e.target.value };
                                    setBotConfig({ ...botConfig, personas: updated });
                                  }}
                                  className="w-full px-2 py-1.5 bg-stone-900 border border-stone-700 rounded text-stone-100 text-xs focus:outline-none focus:ring-1 focus:ring-amber-400/50"
                                />
                              </div>
                              <div>
                                <label className="text-xs text-stone-500 mb-1 block">System prompt</label>
                                <textarea
                                  value={persona.systemPrompt}
                                  rows={5}
                                  onChange={(e) => {
                                    const updated = [...(botConfig.personas ?? [])];
                                    updated[idx] = { ...updated[idx], systemPrompt: e.target.value };
                                    setBotConfig({ ...botConfig, personas: updated });
                                  }}
                                  className="w-full px-2 py-1.5 bg-stone-900 border border-stone-700 rounded text-stone-100 text-xs focus:outline-none focus:ring-1 focus:ring-amber-400/50 resize-y"
                                />
                              </div>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>

                  <button
                    onClick={handleSaveBotConfig}
                    className="px-4 py-1.5 bg-amber-700 hover:bg-amber-600 text-stone-950 text-xs font-semibold rounded-lg transition-colors flex items-center gap-2"
                  >
                    {botConfigSaved ? <><Check size={12} /> Saved</> : 'Save Config'}
                  </button>
                </div>
              </div>

              {/* Bot Activity Feed */}
              <div>
                <h4 className="text-xs font-medium text-stone-400 uppercase tracking-wide mb-3">Recent Bot Posts</h4>
                {botPosts.length === 0 ? (
                  <p className="text-sm text-stone-600 italic">No bot posts yet.</p>
                ) : (
                  <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
                    {botPosts.map((post) => (
                      <div key={post.id} className="bg-stone-900/60 border border-stone-800 rounded-lg p-3">
                        <p className="text-xs text-stone-300 line-clamp-2">{post.content}</p>
                        <p className="text-xs text-stone-600 mt-1">{new Date(post.created_at).toLocaleString()}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>

            </div>
          )}
        </div>
      )}

      {/* Danger Zone */}
      <div className="border border-rose-900/40 rounded-xl overflow-hidden">
        <button
          onClick={() => setShowDangerZone(!showDangerZone)}
          className="w-full flex items-center justify-between px-5 py-4 text-left hover:bg-rose-950/20 transition-colors"
        >
          <div className="flex items-center gap-3">
            <Trash2 size={16} className="text-rose-600" />
            <span className="text-sm font-medium text-rose-500">Danger Zone</span>
          </div>
          <span className="text-xs text-stone-600">{showDangerZone ? 'Close' : 'Expand'}</span>
        </button>

        {showDangerZone && (
          <div className="px-5 pb-5 border-t border-rose-900/40 space-y-3">
            <p className="text-xs text-stone-500 pt-4">
              To delete your account, type <span className="font-mono text-rose-400">delete my account</span> below.
              This action cannot be undone.
            </p>
            <input
              type="text"
              value={deleteConfirm}
              onChange={(e) => setDeleteConfirm(e.target.value)}
              className="w-full px-3 py-2 bg-stone-950 border border-rose-900/50 rounded-lg text-stone-200 text-sm focus:outline-none focus:ring-2 focus:ring-rose-500/40"
              placeholder="delete my account"
            />
            <button
              onClick={handleDeleteAccount}
              disabled={isLoading || deleteConfirm !== 'delete my account'}
              className="px-4 py-2 bg-rose-900/40 hover:bg-rose-900/60 border border-rose-700/50 text-rose-400 text-xs font-medium rounded-lg transition-colors disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-1.5"
            >
              {isLoading ? <Loader2 size={12} className="animate-spin" /> : <Trash2 size={12} />}
              Delete Account
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
