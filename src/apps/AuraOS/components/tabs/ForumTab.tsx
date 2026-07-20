/**
 * ForumTab - Community Discussion Forum
 * Premium "Alchemical Void" aesthetic matching the design system
 * Categories: Practice Sharing, Insights, Questions, Community
 */

import React, { lazy, Suspense, useCallback, useEffect, useRef, useState } from 'react';
const ForumConstellation = lazy(() => import('../forum/ForumConstellation'));
import { ActiveTab, ForumThread, ForumCategory } from '../../types';
import { getThreads, getForumStats, searchThreads, getTrendingThreads, setPinThread, archiveThread } from '../../services/forumService';
import { forumAIService } from '../../services/forumAIService';
import { useAuth } from '../../contexts/AuthContext';
import {
  NetworkNodesIcon,
  SeedOfLifeIcon,
  EndlessKnotIcon,
  FlowerOfLifeIcon,
  HexagramIcon,
} from '../shared/SacredNavIcons';
import { MessageCircle, TrendingUp, Plus, Eye, Clock, Search, X, MoreVertical, Pin, Archive, Bell, Flag } from 'lucide-react';
import ForumThreadWizard from '../wizards/ForumThreadWizard';
import ThreadView from '../forum/ThreadView';
import ModerationQueue from '../forum/ModerationQueue';
import { getNotifications, markRead, getUnreadCount, ForumNotificationWithMeta } from '../../services/forumNotificationService';

interface ForumTabProps {
  setActiveTab: (tab: ActiveTab) => void;
}

const categoryConfig: Record<
  ForumCategory,
  {
    icon: React.ReactNode;
    label: string;
    description: string;
    colorClass: string;
    glowColor: string;
    borderHover: string;
  }
> = {
  'practice-sharing': {
    icon: <SeedOfLifeIcon size={16} />,
    label: 'Practice Sharing',
    description: 'Share your practice experiences and learn from others',
    colorClass: 'text-emerald-400',
    glowColor: 'shadow-emerald-500/20',
    borderHover: 'hover:border-emerald-500/40',
  },
  insights: {
    icon: <NetworkNodesIcon size={16} />,
    label: 'Insights',
    description: 'Deep reflections and breakthrough moments',
    colorClass: 'text-teal-400',
    glowColor: 'shadow-cyan-500/20',
    borderHover: 'hover:border-cyan-500/40',
  },
  questions: {
    icon: <EndlessKnotIcon size={16} />,
    label: 'Questions',
    description: 'Ask questions and get guidance from the community',
    colorClass: 'text-amber-400',
    glowColor: 'shadow-amber-500/20',
    borderHover: 'hover:border-amber-500/40',
  },
  community: {
    icon: <FlowerOfLifeIcon size={16} />,
    label: 'Community',
    description: 'Connect, collaborate, and build relationships',
    colorClass: 'text-rose-400',
    glowColor: 'shadow-rose-500/20',
    borderHover: 'hover:border-rose-500/40',
  },
};

export default function ForumTab({ setActiveTab }: ForumTabProps) {
  const { isAuthenticated, user } = useAuth();
  const isAdmin = user?.isAdmin === true;
  const [selectedCategory, setSelectedCategory] = useState<ForumCategory | 'all'>('all');
  const [threads, setThreads] = useState<ForumThread[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<{
    totalThreads: number;
    totalPosts: number;
    categories: Record<string, number>;
  } | null>(null);
  const [showCreateWizard, setShowCreateWizard] = useState(false);
  const [selectedThreadId, setSelectedThreadId] = useState<string | null>(null);

  // Search state
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<ForumThread[] | null>(null);
  const [searching, setSearching] = useState(false);
  const searchTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Sort state
  const [sortMode, setSortMode] = useState<'recent' | 'trending'>('recent');

  // Pagination state
  const [totalThreads, setTotalThreads] = useState(0);
  const [offset, setOffset] = useState(0);
  const [loadingMore, setLoadingMore] = useState(false);
  const PAGE_SIZE = 20;

  // Admin menu state
  const [adminMenuThreadId, setAdminMenuThreadId] = useState<string | null>(null);

  // Moderation view (admin)
  const [showModeration, setShowModeration] = useState(false);

  // Notifications
  const [notifOpen, setNotifOpen] = useState(false);
  const [notifications, setNotifications] = useState<ForumNotificationWithMeta[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);

  // Load threads
  const loadThreads = useCallback(async (resetOffset = true) => {
    const currentOffset = resetOffset ? 0 : offset;
    if (resetOffset) {
      setLoading(true);
      setOffset(0);
    } else {
      setLoadingMore(true);
    }

    if (sortMode === 'trending') {
      const cat = selectedCategory === 'all' ? undefined : selectedCategory;
      const result = await getTrendingThreads(cat, 7);
      if (result) {
        setThreads(result);
        setTotalThreads(result.length);
      }
      setLoading(false);
      setLoadingMore(false);
      return;
    }

    const result = await getThreads(
      selectedCategory === 'all' ? undefined : selectedCategory,
      { limit: PAGE_SIZE, offset: currentOffset }
    );
    if (result) {
      if (resetOffset) {
        setThreads(result.threads);
      } else {
        setThreads((prev) => [...prev, ...result.threads]);
      }
      setTotalThreads(result.total);
    }
    setLoading(false);
    setLoadingMore(false);
  }, [selectedCategory, sortMode, offset]);

  useEffect(() => {
    setSearchResults(null);
    setSearchQuery('');
    loadThreads(true);
  }, [selectedCategory, sortMode]);

  // Load more handler
  const handleLoadMore = () => {
    const newOffset = offset + PAGE_SIZE;
    setOffset(newOffset);
    // We need to load with the new offset directly
    (async () => {
      setLoadingMore(true);
      const result = await getThreads(
        selectedCategory === 'all' ? undefined : selectedCategory,
        { limit: PAGE_SIZE, offset: newOffset }
      );
      if (result) {
        setThreads((prev) => [...prev, ...result.threads]);
        setTotalThreads(result.total);
      }
      setLoadingMore(false);
    })();
  };

  // Load stats
  useEffect(() => {
    const loadStats = async () => {
      const statsData = await getForumStats();
      if (statsData) {
        setStats(statsData);
      }
    };
    loadStats();
  }, []);

  // Bot proactive scan
  useEffect(() => {
    const runBotScan = async () => {
      if (!isAuthenticated) return;
      // Reset cooldown when user authenticates so admin sign-in triggers scan immediately
      forumAIService.resetScanCooldown();
      const result = await getThreads(undefined, { limit: 50, offset: 0 });
      if (!result) return;
      await forumAIService.proactiveScan(result.threads);
    };
    const timer = setTimeout(runBotScan, 3000);
    return () => clearTimeout(timer);
  }, [isAuthenticated]);

  // Notification polling
  useEffect(() => {
    if (!isAuthenticated || !user) return;
    const userId = user?.id;
    if (!userId) return;

    const fetchNotifs = async () => {
      const count = await getUnreadCount(userId);
      setUnreadCount(count);
    };
    fetchNotifs();
    const interval = setInterval(fetchNotifs, 60000);
    return () => clearInterval(interval);
  }, [isAuthenticated, user]);

  const handleOpenNotifications = async () => {
    const userId = user?.id;
    if (!userId) return;
    if (notifOpen) {
      setNotifOpen(false);
      return;
    }
    const notifs = await getNotifications(userId, 10);
    setNotifications(notifs);
    setNotifOpen(true);
  };

  const handleMarkAllRead = async () => {
    const unreadIds = notifications.filter((n) => !n.read).map((n) => n.id);
    if (unreadIds.length > 0) {
      await markRead(unreadIds);
      setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
      setUnreadCount(0);
    }
  };

  // Check if a thread has unread activity
  const isThreadUnread = (thread: ForumThread): boolean => {
    try {
      const lastRead = localStorage.getItem('aura-forum-last-read-' + thread.id);
      if (!lastRead) return true; // Never read = unread
      const updatedAt = thread.updated_at || thread.created_at;
      return new Date(updatedAt) > new Date(lastRead);
    } catch {
      return false;
    }
  };

  // Debounced search
  const handleSearchChange = (value: string) => {
    setSearchQuery(value);
    if (searchTimerRef.current) clearTimeout(searchTimerRef.current);
    if (value.trim().length < 3) {
      setSearchResults(null);
      return;
    }
    searchTimerRef.current = setTimeout(async () => {
      setSearching(true);
      const cat = selectedCategory === 'all' ? undefined : selectedCategory;
      const results = await searchThreads(value.trim(), cat);
      setSearchResults(results || []);
      setSearching(false);
    }, 400);
  };

  const clearSearch = () => {
    setSearchQuery('');
    setSearchResults(null);
  };

  // Admin actions
  const handlePinToggle = async (threadId: string, currentPinned: boolean) => {
    setAdminMenuThreadId(null);
    const success = await setPinThread(threadId, !currentPinned);
    if (success) {
      setThreads((prev) =>
        prev.map((t) => (t.id === threadId ? { ...t, is_pinned: !currentPinned } : t))
      );
    }
  };

  const handleArchive = async (threadId: string) => {
    setAdminMenuThreadId(null);
    const success = await archiveThread(threadId);
    if (success) {
      setThreads((prev) => prev.filter((t) => t.id !== threadId));
      setTotalThreads((c) => c - 1);
    }
  };

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString();
  };

  const displayedThreads = searchResults !== null ? searchResults : threads;

  return (
    <div className="bg-stone-950 min-h-[100dvh]">
      {/* Ambient gradient overlay */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,_var(--tw-gradient-stops))] from-cyan-900/5 via-black/0 to-black/0 pointer-events-none" />

      {/* Forum Banner — D3 Constellation (lazy-loaded to keep D3 out of main chunk) */}
      <div className="flex justify-center items-center w-full py-2 sm:py-4">
        <Suspense fallback={<div className="h-32" />}>
          <ForumConstellation />
        </Suspense>
      </div>

      <div className="relative max-w-6xl mx-auto px-4 py-8 lg:py-12 pb-64">
        {/* Header */}
        <div className="mb-12">
          <div className="inline-flex items-center gap-2 mb-4">
            <span className="w-2 h-2 rounded-full bg-teal-500 shadow-lg shadow-cyan-500/50" />
            <span className="text-xs font-bold text-slate-300 uppercase tracking-[0.2em]">
              Community Forum
            </span>
          </div>

          <h1 className="text-4xl md:text-5xl font-serif font-light text-transparent bg-clip-text bg-gradient-to-br from-stone-100 via-stone-300 to-stone-400 mb-4">
            Integral Practice Circle
          </h1>

          <p className="text-stone-500 text-lg max-w-3xl leading-relaxed mb-6">
            Connect with fellow practitioners, share insights from your practice, ask questions,
            and learn from the collective wisdom of the community.
          </p>

          {/* Stats Bar + Actions */}
          <div className="flex items-center justify-between">
            {stats && (
              <div className="flex items-center gap-6 text-sm text-stone-500">
                <div className="flex items-center gap-2">
                  <MessageCircle size={16} className="text-teal-500" />
                  <span>
                    {stats.totalThreads} {stats.totalThreads === 1 ? 'thread' : 'threads'}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <TrendingUp size={16} className="text-emerald-500" />
                  <span>
                    {stats.totalPosts} {stats.totalPosts === 1 ? 'reply' : 'replies'}
                  </span>
                </div>
              </div>
            )}

            <div className="flex items-center gap-2">
              {/* Notification Bell */}
              {isAuthenticated && (
                <div className="relative">
                  <button
                    onClick={handleOpenNotifications}
                    className="relative p-2 rounded-lg text-stone-400 hover:text-amber-400 hover:bg-stone-800/50 transition-colors"
                    title="Notifications"
                  >
                    <Bell size={18} />
                    {unreadCount > 0 && (
                      <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] flex items-center justify-center rounded-full bg-amber-500 text-stone-950 text-[10px] font-bold px-1">
                        {unreadCount > 99 ? '99+' : unreadCount}
                      </span>
                    )}
                  </button>

                  {/* Notification Dropdown */}
                  {notifOpen && (
                    <div className="absolute right-0 mt-2 w-80 max-h-96 overflow-y-auto rounded-xl bg-stone-900 border border-stone-700 shadow-2xl z-50">
                      <div className="flex items-center justify-between p-3 border-b border-stone-800">
                        <span className="text-sm font-medium text-stone-200">Notifications</span>
                        {notifications.some((n) => !n.read) && (
                          <button
                            onClick={handleMarkAllRead}
                            className="text-xs text-teal-400 hover:text-teal-300 transition-colors"
                          >
                            Mark all read
                          </button>
                        )}
                      </div>
                      {notifications.length === 0 ? (
                        <div className="p-4 text-center text-stone-600 text-sm">No notifications</div>
                      ) : (
                        notifications.map((n) => (
                          <button
                            key={n.id}
                            onClick={() => {
                              setNotifOpen(false);
                              if (n.thread_id) setSelectedThreadId(n.thread_id);
                            }}
                            className={`w-full text-left p-3 border-b border-stone-800/50 hover:bg-stone-800/50 transition-colors ${
                              !n.read ? 'bg-amber-900/10' : ''
                            }`}
                          >
                            <div className="flex items-start gap-2">
                              {!n.read && <span className="mt-1.5 w-2 h-2 rounded-full bg-amber-400 flex-shrink-0" />}
                              <div className="flex-1 min-w-0">
                                <p className="text-xs text-stone-300">
                                  <span className="font-medium text-stone-200">{n.actor_name || 'Someone'}</span>
                                  {n.type === 'mention' ? ' mentioned you in ' : ' replied to '}
                                  <span className="text-teal-400">{n.thread_title || 'a thread'}</span>
                                </p>
                                <p className="text-[10px] text-stone-600 mt-0.5">
                                  {new Date(n.created_at).toLocaleDateString()}
                                </p>
                              </div>
                            </div>
                          </button>
                        ))
                      )}
                    </div>
                  )}
                </div>
              )}

              {/* Admin Moderation Toggle */}
              {isAdmin && (
                <button
                  onClick={() => setShowModeration(!showModeration)}
                  className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                    showModeration
                      ? 'bg-amber-500/20 text-amber-300 border border-amber-700/40'
                      : 'text-stone-500 hover:text-amber-400 hover:bg-stone-800/50'
                  }`}
                >
                  <Flag size={14} />
                  Moderation
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Moderation Queue (admin only) */}
        {isAdmin && showModeration && (
          <div className="mb-8 p-6 rounded-xl bg-stone-900/30 border border-stone-800">
            <ModerationQueue onNavigateToThread={(id) => { setShowModeration(false); setSelectedThreadId(id); }} />
          </div>
        )}

        {/* Category Filter + Sort Toggle */}
        <div className="mb-6">
          <div className="flex flex-wrap items-center gap-3">
            {/* All Category */}
            <button
              onClick={() => setSelectedCategory('all')}
              className={`
                px-4 py-2 rounded-lg text-sm font-medium
                transition-all duration-300
                ${selectedCategory === 'all'
                  ? 'bg-teal-500/20 text-teal-300 border border-cyan-500/40 shadow-lg shadow-cyan-500/20'
                  : 'bg-stone-900/50 text-stone-400 border border-stone-800 hover:bg-stone-900 hover:border-stone-700'
                }
              `}
            >
              <div className="flex items-center gap-2">
                <HexagramIcon size={14} />
                <span>All Discussions</span>
                {stats && <span className="text-xs opacity-70">({stats.totalThreads})</span>}
              </div>
            </button>

            {/* Category Buttons */}
            {(Object.keys(categoryConfig) as ForumCategory[]).map((category) => {
              const config = categoryConfig[category];
              const count = stats?.categories[category] || 0;
              return (
                <button
                  key={category}
                  onClick={() => setSelectedCategory(category)}
                  className={`
                    px-4 py-2 rounded-lg text-sm font-medium
                    transition-all duration-300
                    ${selectedCategory === category
                      ? `bg-${config.colorClass.split('-')[1]}-500/20 ${config.colorClass} border ${config.borderHover.replace('hover:', '')} ${config.glowColor} shadow-lg`
                      : 'bg-stone-900/50 text-stone-400 border border-stone-800 hover:bg-stone-900 hover:border-stone-700'
                    }
                  `}
                >
                  <div className="flex items-center gap-2">
                    {config.icon}
                    <span>{config.label}</span>
                    <span className="text-xs opacity-70">({count})</span>
                  </div>
                </button>
              );
            })}

            {/* Sort Toggle */}
            <div className="ml-auto flex rounded-lg border border-stone-800 overflow-hidden">
              <button
                onClick={() => setSortMode('recent')}
                className={`px-3 py-1.5 text-xs font-medium transition-colors ${
                  sortMode === 'recent'
                    ? 'bg-teal-500/20 text-teal-300'
                    : 'bg-stone-900/50 text-stone-500 hover:text-stone-300'
                }`}
              >
                <div className="flex items-center gap-1.5">
                  <Clock size={12} />
                  Recent
                </div>
              </button>
              <button
                onClick={() => setSortMode('trending')}
                className={`px-3 py-1.5 text-xs font-medium transition-colors ${
                  sortMode === 'trending'
                    ? 'bg-amber-500/20 text-amber-300'
                    : 'bg-stone-900/50 text-stone-500 hover:text-stone-300'
                }`}
              >
                <div className="flex items-center gap-1.5">
                  <TrendingUp size={12} />
                  Trending
                </div>
              </button>
            </div>
          </div>
        </div>

        {/* Search Bar */}
        <div className="mb-8">
          <div className="relative">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-500" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => handleSearchChange(e.target.value)}
              placeholder="Search discussions (min 3 characters)..."
              className="w-full pl-10 pr-10 py-2.5 rounded-lg bg-stone-900/50 border border-stone-800 text-stone-200 placeholder-stone-600 text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500/30 focus:border-stone-700 transition-all"
            />
            {searchQuery && (
              <button
                onClick={clearSearch}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-500 hover:text-stone-300 transition-colors"
              >
                <X size={16} />
              </button>
            )}
          </div>
          {searching && (
            <p className="mt-2 text-xs text-stone-500">Searching...</p>
          )}
          {searchResults !== null && !searching && (
            <p className="mt-2 text-xs text-stone-400">
              {searchResults.length} result{searchResults.length !== 1 ? 's' : ''} for &ldquo;{searchQuery}&rdquo;
            </p>
          )}
        </div>

        {/* New Thread Button */}
        {isAuthenticated && (
          <div className="mb-8">
            <button
              onClick={() => setShowCreateWizard(true)}
              className="
                group relative px-6 py-3 rounded-lg text-sm font-medium
                bg-gradient-to-br from-cyan-600 to-cyan-700
                text-white border border-cyan-500/40
                hover:from-cyan-500 hover:to-cyan-600
                hover:shadow-lg hover:shadow-cyan-500/30
                transition-all duration-300
                active:scale-[0.98]
              "
            >
              <div className="flex items-center gap-2">
                <Plus size={18} />
                <span>Start New Discussion</span>
              </div>
            </button>
          </div>
        )}

        {/* Auth Prompt for Non-Authenticated Users */}
        {!isAuthenticated && (
          <div className="mb-8 p-6 rounded-xl bg-stone-900/50 border border-stone-800">
            <p className="text-stone-400 text-sm">
              <span className="text-teal-400 font-medium">Sign in</span> to start discussions and
              contribute to the community.
            </p>
          </div>
        )}

        {/* Thread List */}
        <div className="space-y-3">
          {loading ? (
            <div className="text-center py-12 text-stone-500">Loading discussions...</div>
          ) : displayedThreads.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-stone-500 mb-2">
                {searchResults !== null ? 'No threads match your search.' : 'No discussions yet in this category.'}
              </p>
              {searchResults === null && (
                <p className="text-stone-600 text-sm">Be the first to start a conversation!</p>
              )}
            </div>
          ) : (
            <>
              {displayedThreads.map((thread) => {
                const categoryInfo = categoryConfig[thread.category];
                return (
                  <div key={thread.id} className="relative">
                    <button
                      onClick={() => setSelectedThreadId(thread.id)}
                      className="
                        group relative w-full p-5 rounded-xl text-left
                        bg-stone-900/50 border border-stone-800/80
                        transition-all duration-300 ease-out
                        hover:bg-stone-900/80 hover:border-stone-700
                        hover:shadow-lg hover:shadow-stone-900/50
                        active:scale-[0.99]
                      "
                    >
                      <div className="flex items-start gap-4">
                        {/* Category Icon */}
                        <div
                          className={`
                            flex-shrink-0 w-10 h-10 rounded-lg
                            bg-stone-950/80 border border-stone-800
                            flex items-center justify-center
                            group-hover:border-stone-700
                            transition-all duration-300
                            ${categoryInfo.glowColor}
                          `}
                        >
                          <span className={categoryInfo.colorClass}>{categoryInfo.icon}</span>
                        </div>

                        <div className="flex-1 min-w-0">
                          {/* Thread Title */}
                          <h3 className="text-base font-medium text-stone-200 group-hover:text-stone-50 transition-colors duration-200 mb-1 flex items-center gap-2">
                            {isThreadUnread(thread) && (
                              <span className="w-2 h-2 rounded-full bg-amber-400 flex-shrink-0" title="New activity" />
                            )}
                            {thread.is_pinned && (
                              <span className="text-teal-500 flex-shrink-0" title="Pinned">
                                📌
                              </span>
                            )}
                            <span>{thread.title}</span>
                          </h3>

                          {/* Thread Description */}
                          {thread.description && (
                            <p className="text-sm text-stone-500 group-hover:text-stone-400 transition-colors duration-200 line-clamp-2 mb-3">
                              {thread.description}
                            </p>
                          )}

                          {/* Metadata */}
                          <div className="flex flex-col gap-2">
                            <div className="flex items-center gap-4 text-xs text-stone-600">
                              <span className={`font-medium ${categoryInfo.colorClass}`}>
                                {categoryInfo.label}
                              </span>
                              <div className="flex items-center gap-1">
                                <MessageCircle size={12} />
                                <span>{thread.reply_count}</span>
                              </div>
                              <div className="flex items-center gap-1">
                                <Eye size={12} />
                                <span>{thread.view_count}</span>
                              </div>
                              <div className="flex items-center gap-1">
                                <Clock size={12} />
                                <span>{formatTimeAgo(thread.created_at)}</span>
                              </div>
                            </div>
                            {/* Author Name */}
                            <div className="text-xs text-stone-500">
                              by <span className="text-stone-400 font-medium">
                                {thread.author?.display_name || thread.author?.email?.split('@')[0] || 'Unknown'}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Hover glow effect */}
                      <div className="absolute inset-0 rounded-xl opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity duration-300 bg-gradient-to-br from-transparent via-transparent to-stone-800/20" />
                    </button>

                    {/* Admin Menu */}
                    {isAdmin && (
                      <div className="absolute top-3 right-3 z-10">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setAdminMenuThreadId(adminMenuThreadId === thread.id ? null : thread.id);
                          }}
                          className="p-1.5 rounded-md text-stone-600 hover:text-stone-300 hover:bg-stone-800 transition-colors"
                        >
                          <MoreVertical size={16} />
                        </button>
                        {adminMenuThreadId === thread.id && (
                          <div className="absolute right-0 mt-1 w-40 rounded-lg bg-stone-800 border border-stone-700 shadow-xl py-1 z-20">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handlePinToggle(thread.id, thread.is_pinned);
                              }}
                              className="w-full flex items-center gap-2 px-3 py-2 text-xs text-stone-300 hover:bg-stone-700 transition-colors"
                            >
                              <Pin size={12} />
                              {thread.is_pinned ? 'Unpin' : 'Pin'}
                            </button>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleArchive(thread.id);
                              }}
                              className="w-full flex items-center gap-2 px-3 py-2 text-xs text-rose-400 hover:bg-stone-700 transition-colors"
                            >
                              <Archive size={12} />
                              Archive
                            </button>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}

              {/* Load More / Pagination Info */}
              {searchResults === null && sortMode === 'recent' && threads.length < totalThreads && (
                <div className="text-center pt-6">
                  <p className="text-xs text-stone-600 mb-3">
                    Showing {threads.length} of {totalThreads} threads
                  </p>
                  <button
                    onClick={handleLoadMore}
                    disabled={loadingMore}
                    className="px-6 py-2.5 rounded-lg text-sm font-medium bg-stone-900/80 text-stone-300 border border-stone-700 hover:bg-stone-800 hover:border-stone-600 disabled:opacity-50 transition-all"
                  >
                    {loadingMore ? 'Loading...' : 'Load More'}
                  </button>
                </div>
              )}
            </>
          )}
        </div>

        {/* Footer ornament */}
        <div className="mt-16 flex items-center justify-center gap-4">
          <div className="h-px flex-1 bg-gradient-to-r from-transparent to-stone-800" />
          <div className="flex items-center gap-2 text-stone-700">
            <NetworkNodesIcon size={12} />
            <span className="text-[10px] uppercase tracking-[0.2em]">Practice Together</span>
            <span className="text-stone-800">·</span>
            <span className="text-[10px] uppercase tracking-[0.2em]">Grow Together</span>
            <FlowerOfLifeIcon size={12} />
          </div>
          <div className="h-px flex-1 bg-gradient-to-l from-transparent to-stone-800" />
        </div>
      </div>

      {/* Create Thread Wizard */}
      {showCreateWizard && (
        <ForumThreadWizard
          onClose={() => setShowCreateWizard(false)}
          onSuccess={(threadId) => {
            setShowCreateWizard(false);
            setSelectedThreadId(threadId);
            // Reload threads to show new thread
            const loadThreads = async () => {
              const result = await getThreads(
                selectedCategory === 'all' ? undefined : selectedCategory,
                { limit: 20, offset: 0 }
              );
              if (result) {
                setThreads(result.threads);
              }
            };
            loadThreads();
          }}
        />
      )}

      {/* Thread View */}
      {selectedThreadId && (
        <ThreadView
          threadId={selectedThreadId}
          onClose={() => setSelectedThreadId(null)}
        />
      )}
    </div>
  );
}
