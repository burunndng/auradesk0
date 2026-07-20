import React, { useState, useEffect, useCallback } from 'react';
import {
  fetchAllUsers,
  updateUserSubscription,
  fetchAppStats,
  deleteForumPost,
  deleteForumThread,
  getBotConfigFromDB,
  updateBotConfigInDB,
  type BotConfig,
  DEFAULT_PERSONAS,
} from '../../services/adminService';
import { generatePromoCode, listPromoCodes, revokePromoCode } from '../../services/promoCodeService';
import type { AdminUserRow, PromoCode } from '../../types';

interface AdminPanelProps {
  isOpen: boolean;
  onClose: () => void;
}

type TabId = 'users' | 'insights' | 'forum' | 'stats' | 'bot' | 'codes';

const TABS: { id: TabId; label: string }[] = [
  { id: 'users', label: 'Users' },
  { id: 'insights', label: 'Insights' },
  { id: 'forum', label: 'Forum' },
  { id: 'stats', label: 'Stats' },
  { id: 'bot', label: 'Bot' },
  { id: 'codes', label: 'Codes' },
];

const TIER_OPTIONS = ['free', 'pro', 'founding'] as const;

// ── Users Tab ─────────────────────────────────────────────────────────────────

function UsersTab() {
  const [users, setUsers] = useState<AdminUserRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState<string | null>(null);

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

  if (loading) return <div className="text-slate-400 py-8 text-center">Loading users…</div>;

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-slate-700 text-slate-400 text-left">
            <th className="py-2 pr-4">Email</th>
            <th className="py-2 pr-4">Name</th>
            <th className="py-2 pr-4">Tier</th>
            <th className="py-2 pr-4">Admin</th>
            <th className="py-2">Joined</th>
          </tr>
        </thead>
        <tbody>
          {users.map((u) => (
            <tr key={u.id} className="border-b border-slate-800 hover:bg-slate-800/30">
              <td className="py-2 pr-4 text-slate-300 max-w-[180px] truncate">{u.email}</td>
              <td className="py-2 pr-4 text-slate-400">{u.display_name || '—'}</td>
              <td className="py-2 pr-4">
                <select
                  value={u.preferences?.subscription_tier || 'free'}
                  disabled={updating === u.id}
                  onChange={(e) => changeTier(u.id, e.target.value as any)}
                  className="bg-slate-800 border border-slate-700 rounded px-2 py-0.5 text-xs text-slate-200"
                >
                  {TIER_OPTIONS.map((t) => (
                    <option key={t} value={t}>{t}</option>
                  ))}
                </select>
              </td>
              <td className="py-2 pr-4 text-slate-400">{u.is_admin ? '✓' : ''}</td>
              <td className="py-2 text-slate-500 text-xs">
                {new Date(u.created_at).toLocaleDateString()}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      {users.length === 0 && (
        <p className="text-slate-500 text-center py-8">No users found. RLS may need admin policy.</p>
      )}
    </div>
  );
}

// ── Insights Tab ──────────────────────────────────────────────────────────────

function InsightsTab() {
  const [users, setUsers] = useState<AdminUserRow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAllUsers().then((rows) => { setUsers(rows); setLoading(false); });
  }, []);

  if (loading) return <div className="text-slate-400 py-8 text-center">Loading…</div>;

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-slate-700 text-slate-400 text-left">
            <th className="py-2 pr-4">Email</th>
            <th className="py-2 pr-4">Tier</th>
            <th className="py-2">Joined</th>
          </tr>
        </thead>
        <tbody>
          {users.map((u) => (
            <tr key={u.id} className="border-b border-slate-800 hover:bg-slate-800/30">
              <td className="py-2 pr-4 text-slate-300 max-w-[220px] truncate">{u.email}</td>
              <td className="py-2 pr-4">
                <span className={`text-xs px-2 py-0.5 rounded ${
                  u.preferences?.subscription_tier === 'founding' ? 'bg-amber-900/50 text-amber-300' :
                  u.preferences?.subscription_tier === 'pro' ? 'bg-purple-900/50 text-purple-300' :
                  'bg-slate-700 text-slate-400'
                }`}>
                  {u.preferences?.subscription_tier || 'free'}
                </span>
              </td>
              <td className="py-2 text-slate-500 text-xs">
                {new Date(u.created_at).toLocaleDateString()}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

// ── Forum Tab ─────────────────────────────────────────────────────────────────

function ForumTab() {
  const [threads, setThreads] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    import('../../services/forumService').then((mod) => {
      mod.getThreads(undefined, { limit: 50, offset: 0 }).then((res: any) => { setThreads(res?.threads || []); setLoading(false); });
    });
  }, []);

  const handleDeleteThread = async (id: string) => {
    if (!window.confirm('Delete this thread and all its posts?')) return;
    const ok = await deleteForumThread(id);
    if (ok) setThreads((prev) => prev.filter((t) => t.id !== id));
  };

  if (loading) return <div className="text-slate-400 py-8 text-center">Loading…</div>;

  return (
    <div className="space-y-2">
      {threads.map((thread) => (
        <div key={thread.id} className="flex items-center justify-between bg-slate-800/40 rounded px-3 py-2">
          <div className="min-w-0 flex-1">
            <p className="text-slate-200 text-sm truncate">{thread.title}</p>
            <p className="text-slate-500 text-xs">{thread.category} · {thread.reply_count || 0} replies</p>
          </div>
          <button
            onClick={() => handleDeleteThread(thread.id)}
            className="ml-3 text-xs text-red-400 hover:text-red-300 border border-red-900/40 rounded px-2 py-0.5 flex-shrink-0"
          >
            Delete
          </button>
        </div>
      ))}
      {threads.length === 0 && <p className="text-slate-500 text-center py-8">No threads.</p>}
    </div>
  );
}

// ── Stats Tab ─────────────────────────────────────────────────────────────────

function StatsTab() {
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAppStats().then((s) => { setStats(s); setLoading(false); });
  }, []);

  if (loading) return <div className="text-slate-400 py-8 text-center">Loading…</div>;

  const cards = [
    { label: 'Total Users', value: stats.totalUsers },
    { label: 'New (7d)', value: stats.newUsersLast7d },
    { label: 'New (30d)', value: stats.newUsersLast30d },
    { label: 'Wizard Sessions', value: stats.totalSessions },
    { label: 'Insights', value: stats.totalInsights },
  ];

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
      {cards.map((c) => (
        <div key={c.label} className="bg-slate-800/50 rounded-lg p-4 border border-slate-700">
          <p className="text-slate-400 text-xs mb-1">{c.label}</p>
          <p className="text-2xl font-semibold text-slate-100">{c.value}</p>
        </div>
      ))}
    </div>
  );
}

// ── Bot Tab ───────────────────────────────────────────────────────────────────

const ALL_PERSONAS = DEFAULT_PERSONAS.map(p => p.name);

function BotTab() {
  const [config, setConfig] = useState<BotConfig | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'ok' | 'err'>('idle');

  useEffect(() => {
    getBotConfigFromDB().then((c) => { setConfig(c); setLoading(false); });
  }, []);

  const save = async () => {
    if (!config) return;
    setSaving(true);
    setSaveStatus('idle');
    const ok = await updateBotConfigInDB(config);
    setSaving(false);
    setSaveStatus(ok ? 'ok' : 'err');
    setTimeout(() => setSaveStatus('idle'), 3000);
  };

  const togglePersona = (name: string) => {
    if (!config) return;
    setConfig((prev) => prev ? ({
      ...prev,
      active_persona_ids: prev.active_persona_ids.includes(name)
        ? prev.active_persona_ids.filter((p) => p !== name)
        : [...prev.active_persona_ids, name],
    }) : prev);
  };

  if (loading || !config) return <div className="text-slate-400 py-8 text-center">Loading bot config…</div>;

  return (
    <div className="space-y-6">
      <div>
        <label className="text-slate-300 text-sm block mb-2">
          Posts per day: <span className="text-amber-400 font-semibold">{config.posts_per_day}</span>
        </label>
        <input
          type="range"
          min={0}
          max={20}
          value={config.posts_per_day}
          onChange={(e) => setConfig((prev) => prev ? ({ ...prev, posts_per_day: Number(e.target.value) }) : prev)}
          className="w-full accent-amber-500"
        />
        <div className="flex justify-between text-xs text-slate-500 mt-1">
          <span>0</span><span>20</span>
        </div>
      </div>

      <div>
        <label className="text-slate-300 text-sm block mb-2">
          Replies per day: <span className="text-amber-400 font-semibold">{config.replies_per_day}</span>
        </label>
        <input
          type="range"
          min={0}
          max={20}
          value={config.replies_per_day}
          onChange={(e) => setConfig((prev) => prev ? ({ ...prev, replies_per_day: Number(e.target.value) }) : prev)}
          className="w-full accent-amber-500"
        />
        <div className="flex justify-between text-xs text-slate-500 mt-1">
          <span>0</span><span>20</span>
        </div>
      </div>

      <div>
        <p className="text-slate-300 text-sm mb-3">Active personas:</p>
        <div className="grid grid-cols-2 gap-2">
          {ALL_PERSONAS.map((name) => {
            const active = config.active_persona_ids.includes(name);
            return (
              <button
                key={name}
                onClick={() => togglePersona(name)}
                className={`px-3 py-2 rounded border text-sm transition-colors ${
                  active
                    ? 'bg-teal-900/40 border-teal-600/50 text-teal-300'
                    : 'bg-slate-800/40 border-slate-700 text-slate-500'
                }`}
              >
                {name}
              </button>
            );
          })}
        </div>
      </div>

      <div className="flex items-center gap-3">
        <button
          onClick={save}
          disabled={saving}
          className="px-4 py-2 bg-amber-600 hover:bg-amber-500 disabled:opacity-50 text-white rounded text-sm transition-colors"
        >
          {saving ? 'Saving…' : 'Save to Supabase'}
        </button>
        {saveStatus === 'ok' && <span className="text-emerald-400 text-sm">Saved ✓</span>}
        {saveStatus === 'err' && <span className="text-rose-400 text-sm">Save failed — check admin permissions</span>}
      </div>

      <p className="text-slate-600 text-xs">Config persisted in Supabase <code>bot_config</code> table (admin-only write).</p>
    </div>
  );
}

// ── Codes Tab ─────────────────────────────────────────────────────────────────

function CodesTab() {
  const [codes, setCodes] = useState<PromoCode[]>([]);
  const [loading, setLoading] = useState(true);
  const [daysValid, setDaysValid] = useState(30);
  const [generating, setGenerating] = useState(false);
  const [newCode, setNewCode] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [revoking, setRevoking] = useState<string | null>(null);

  useEffect(() => {
    listPromoCodes().then((rows) => { setCodes(rows); setLoading(false); });
  }, []);

  const handleGenerate = async () => {
    setGenerating(true);
    setNewCode(null);
    const code = await generatePromoCode(daysValid);
    if (code) {
      setNewCode(code);
      setCodes((prev) => [{
        id: '',
        code,
        created_by: '',
        redeemed_by: null,
        days_valid: daysValid,
        expires_at: new Date(Date.now() + daysValid * 86400000).toISOString(),
        redeemed_at: null,
        status: 'active',
        created_at: new Date().toISOString(),
      }, ...prev]);
    }
    setGenerating(false);
  };

  const handleCopy = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  const handleRevoke = async (id: string) => {
    if (!id) return;
    setRevoking(id);
    await revokePromoCode(id);
    setCodes((prev) => prev.map((c) => c.id === id ? { ...c, status: 'revoked' } : c));
    setRevoking(null);
  };

  const statusColor = (s: PromoCode['status']) =>
    s === 'active' ? 'text-emerald-400' : s === 'redeemed' ? 'text-amber-400' : 'text-stone-500';

  return (
    <div className="space-y-6">
      {/* Generate */}
      <div className="bg-stone-900/50 border border-stone-700 rounded-xl p-4 space-y-3">
        <p className="text-sm font-medium text-stone-300">Generate Code</p>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <label className="text-xs text-stone-500">Days valid:</label>
            <input
              type="number"
              min={1}
              max={365}
              value={daysValid}
              onChange={(e) => setDaysValid(Number(e.target.value))}
              className="w-16 px-2 py-1 bg-stone-800 border border-stone-700 rounded text-stone-100 text-sm text-center focus:outline-none focus:ring-1 focus:ring-amber-400/40"
            />
          </div>
          <button
            onClick={handleGenerate}
            disabled={generating}
            className="px-4 py-1.5 bg-amber-600 hover:bg-amber-500 disabled:bg-stone-700 text-stone-950 text-sm font-semibold rounded-lg transition-colors"
          >
            {generating ? 'Generating…' : 'Generate'}
          </button>
        </div>
        {newCode && (
          <div className="flex items-center gap-3 mt-2">
            <code className="flex-1 px-3 py-2 bg-stone-800 border border-emerald-700/40 rounded-lg text-emerald-300 font-mono text-sm tracking-widest">
              {newCode}
            </code>
            <button
              onClick={() => handleCopy(newCode)}
              className="px-3 py-2 bg-stone-800 hover:bg-stone-700 border border-stone-700 text-stone-300 text-xs rounded-lg transition-colors"
            >
              {copied ? 'Copied!' : 'Copy'}
            </button>
          </div>
        )}
      </div>

      {/* List */}
      {loading ? (
        <div className="text-slate-400 py-8 text-center text-sm">Loading codes…</div>
      ) : codes.length === 0 ? (
        <div className="text-stone-500 py-8 text-center text-sm">No codes yet.</div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="text-stone-500 border-b border-stone-800">
                <th className="text-left py-2 pr-4 font-medium">Code</th>
                <th className="text-left py-2 pr-4 font-medium">Status</th>
                <th className="text-left py-2 pr-4 font-medium">Days</th>
                <th className="text-left py-2 pr-4 font-medium">Created</th>
                <th className="text-left py-2 font-medium">Action</th>
              </tr>
            </thead>
            <tbody>
              {codes.map((c) => (
                <tr key={c.id || c.code} className="border-b border-stone-800/50">
                  <td className="py-2 pr-4 font-mono text-stone-200 tracking-wider">{c.code}</td>
                  <td className={`py-2 pr-4 font-medium ${statusColor(c.status)}`}>{c.status}</td>
                  <td className="py-2 pr-4 text-stone-400">{c.days_valid}d</td>
                  <td className="py-2 pr-4 text-stone-500">{new Date(c.created_at).toLocaleDateString()}</td>
                  <td className="py-2">
                    {c.status === 'active' && c.id && (
                      <button
                        onClick={() => handleRevoke(c.id)}
                        disabled={revoking === c.id}
                        className="text-rose-500 hover:text-rose-400 disabled:text-stone-600 text-xs transition-colors"
                      >
                        {revoking === c.id ? '…' : 'Revoke'}
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

// ── Main Panel ────────────────────────────────────────────────────────────────

export default function AdminPanel({ isOpen, onClose }: AdminPanelProps) {
  const [activeTab, setActiveTab] = useState<TabId>('users');

  const handleKey = useCallback((e: KeyboardEvent) => {
    if (e.key === 'Escape') onClose();
  }, [onClose]);

  useEffect(() => {
    if (isOpen) {
      document.addEventListener('keydown', handleKey);
      return () => document.removeEventListener('keydown', handleKey);
    }
  }, [isOpen, handleKey]);

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-stone-950/60 z-[60]"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Drawer */}
      <div
        className="fixed top-0 right-0 h-full w-full max-w-2xl bg-slate-900 border-l border-slate-700 z-[70] flex flex-col shadow-2xl"
        role="dialog"
        aria-label="Admin Panel"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-700 flex-shrink-0">
          <div className="flex items-center gap-2">
            <span className="text-red-500 text-xs font-mono bg-red-950/40 border border-red-900/40 px-2 py-0.5 rounded">ADMIN</span>
            <h2 className="text-slate-100 font-semibold">AOS Admin Panel</h2>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-200 text-xl leading-none"
            aria-label="Close"
          >
            ×
          </button>
        </div>

        {/* Tab bar */}
        <div className="flex border-b border-slate-700 flex-shrink-0 overflow-x-auto">
          {TABS.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-4 py-3 text-sm whitespace-nowrap transition-colors ${
                activeTab === tab.id
                  ? 'text-amber-400 border-b-2 border-amber-400'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-5">
          {activeTab === 'users' && <UsersTab />}
          {activeTab === 'insights' && <InsightsTab />}
          {activeTab === 'forum' && <ForumTab />}
          {activeTab === 'stats' && <StatsTab />}
          {activeTab === 'bot' && <BotTab />}
          {activeTab === 'codes' && <CodesTab />}
        </div>
      </div>
    </>
  );
}
