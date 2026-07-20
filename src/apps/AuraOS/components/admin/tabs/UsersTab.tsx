import React, { useState, useEffect } from 'react';
import { fetchAllUsers, updateUserSubscription, fetchUserSessionCount } from '../../../services/adminService';
import type { AdminUserRow } from '../../../types';

const TIER_OPTIONS = ['free', 'pro', 'founding'] as const;

const tierBadge = (tier: string) => {
  const styles: Record<string, string> = {
    founding: 'bg-amber-900/40 text-amber-300 border border-amber-700/30',
    pro: 'bg-purple-900/40 text-purple-300 border border-purple-700/30',
    free: 'bg-stone-800/60 text-stone-400 border border-stone-700/30',
  };
  return styles[tier] || styles.free;
};

interface UserDetail {
  sessions: number;
  insights: number;
}

export default function UsersTab() {
  const [users, setUsers] = useState<AdminUserRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedUser, setExpandedUser] = useState<string | null>(null);
  const [userDetails, setUserDetails] = useState<Record<string, UserDetail>>({});
  const [detailLoading, setDetailLoading] = useState<string | null>(null);

  useEffect(() => {
    fetchAllUsers().then((rows) => { setUsers(rows); setLoading(false); });
  }, []);

  const changeTier = async (userId: string, tier: 'free' | 'pro' | 'founding') => {
    setUpdating(userId);
    await updateUserSubscription(userId, tier);
    setUsers((prev) =>
      prev.map((u) =>
        u.id === userId
          ? { ...u, preferences: { ...u.preferences, subscription_tier: tier } }
          : u
      )
    );
    setUpdating(null);
  };

  const toggleExpand = async (userId: string) => {
    if (expandedUser === userId) {
      setExpandedUser(null);
      return;
    }
    setExpandedUser(userId);
    if (!userDetails[userId]) {
      setDetailLoading(userId);
      const detail = await fetchUserSessionCount(userId);
      setUserDetails((prev) => ({ ...prev, [userId]: detail }));
      setDetailLoading(null);
    }
  };

  const filtered = users.filter((u) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      (u.email?.toLowerCase().includes(q)) ||
      (u.display_name?.toLowerCase().includes(q)) ||
      (u.preferences?.subscription_tier?.toLowerCase().includes(q))
    );
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center py-16">
        <div className="h-6 w-6 border-2 border-amber-500/40 border-t-amber-400 rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Search */}
      <div className="relative">
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search by email, name, or tier…"
          className="w-full bg-stone-900/60 border border-stone-700/50 rounded-xl px-4 py-3 text-sm text-stone-200 placeholder:text-stone-500 focus:outline-none focus:ring-1 focus:ring-amber-500/40 focus:border-amber-500/30 transition-colors"
        />
        {searchQuery && (
          <button
            onClick={() => setSearchQuery('')}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-500 hover:text-stone-300 text-sm"
          >
            ✕
          </button>
        )}
      </div>

      {/* Count */}
      <p className="text-stone-500 text-xs">
        {filtered.length} user{filtered.length !== 1 ? 's' : ''}{searchQuery ? ' matching' : ' total'}
      </p>

      {/* Table */}
      <div className="overflow-x-auto rounded-xl border border-stone-800/60">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-stone-800 text-stone-500 text-left text-xs uppercase tracking-wider">
              <th className="py-3 px-4">Email</th>
              <th className="py-3 px-4">Name</th>
              <th className="py-3 px-4">Tier</th>
              <th className="py-3 px-4">Admin</th>
              <th className="py-3 px-4">Joined</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((u) => (
              <React.Fragment key={u.id}>
                <tr
                  onClick={() => toggleExpand(u.id)}
                  className={`border-b border-stone-800/40 cursor-pointer transition-colors ${
                    expandedUser === u.id
                      ? 'bg-stone-800/40'
                      : 'hover:bg-stone-900/60'
                  }`}
                >
                  <td className="py-3 px-4 text-stone-300 max-w-[200px] truncate font-mono text-xs">
                    {u.email || '—'}
                  </td>
                  <td className="py-3 px-4 text-stone-400">{u.display_name || '—'}</td>
                  <td className="py-3 px-4">
                    <select
                      value={u.preferences?.subscription_tier || 'free'}
                      disabled={updating === u.id}
                      onChange={(e) => { e.stopPropagation(); changeTier(u.id, e.target.value as any); }}
                      onClick={(e) => e.stopPropagation()}
                      className="bg-stone-900 border border-stone-700/50 rounded-lg px-2.5 py-1 text-xs text-stone-200 focus:outline-none focus:ring-1 focus:ring-amber-500/30 cursor-pointer"
                    >
                      {TIER_OPTIONS.map((t) => (
                        <option key={t} value={t}>{t}</option>
                      ))}
                    </select>
                  </td>
                  <td className="py-3 px-4">
                    {u.is_admin && (
                      <span className="text-xs bg-amber-900/30 text-amber-400 border border-amber-700/30 px-2 py-0.5 rounded-md">
                        admin
                      </span>
                    )}
                  </td>
                  <td className="py-3 px-4 text-stone-500 text-xs">
                    {new Date(u.created_at).toLocaleDateString()}
                  </td>
                </tr>
                {/* Expanded detail */}
                {expandedUser === u.id && (
                  <tr className="bg-stone-900/30">
                    <td colSpan={5} className="px-4 py-3">
                      {detailLoading === u.id ? (
                        <div className="flex items-center gap-2 text-stone-500 text-xs">
                          <div className="h-3 w-3 border border-stone-600 border-t-stone-400 rounded-full animate-spin" />
                          Loading activity…
                        </div>
                      ) : userDetails[u.id] ? (
                        <div className="flex gap-6 text-xs">
                          <div>
                            <span className="text-stone-500">Sessions: </span>
                            <span className="text-stone-200 font-medium">{userDetails[u.id].sessions}</span>
                          </div>
                          <div>
                            <span className="text-stone-500">Insights: </span>
                            <span className="text-stone-200 font-medium">{userDetails[u.id].insights}</span>
                          </div>
                          <div>
                            <span className="text-stone-500">Tier: </span>
                            <span className={`inline-flex px-2 py-0.5 rounded-md text-xs ${tierBadge(u.preferences?.subscription_tier || 'free')}`}>
                              {u.preferences?.subscription_tier || 'free'}
                            </span>
                          </div>
                          <div>
                            <span className="text-stone-500">ID: </span>
                            <span className="text-stone-400 font-mono">{u.id.slice(0, 8)}…</span>
                          </div>
                        </div>
                      ) : null}
                    </td>
                  </tr>
                )}
              </React.Fragment>
            ))}
          </tbody>
        </table>
      </div>

      {filtered.length === 0 && (
        <p className="text-stone-500 text-center py-8 text-sm">
          {searchQuery ? 'No users matching your search.' : 'No users found. RLS may need admin policy.'}
        </p>
      )}
    </div>
  );
}
