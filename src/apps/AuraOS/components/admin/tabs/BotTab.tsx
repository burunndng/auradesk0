import React, { useState, useEffect } from 'react';
import {
  getBotConfigFromDB,
  updateBotConfigInDB,
  fetchRecentBotPosts,
  type BotConfig,
  DEFAULT_PERSONAS,
} from '../../../services/adminService';

const ALL_PERSONAS = DEFAULT_PERSONAS.map(p => p.name);
const BOT_USER_ID = import.meta.env.VITE_BOT_USER_ID || '';

interface BotPost {
  id: string;
  content: string;
  created_at: string;
  thread_id: string;
}

export default function BotTab() {
  const [config, setConfig] = useState<BotConfig | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'ok' | 'err'>('idle');
  const [recentPosts, setRecentPosts] = useState<BotPost[]>([]);
  const [postsLoading, setPostsLoading] = useState(true);

  useEffect(() => {
    getBotConfigFromDB().then((c) => { setConfig(c); setLoading(false); });
    if (BOT_USER_ID) {
      fetchRecentBotPosts(BOT_USER_ID, 10).then((p) => { setRecentPosts(p); setPostsLoading(false); });
    } else {
      setPostsLoading(false);
    }
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

  if (loading || !config) {
    return (
      <div className="flex items-center justify-center py-16">
        <div className="h-6 w-6 border-2 border-amber-500/40 border-t-amber-400 rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Config section */}
      <div className="space-y-6">
        <h3 className="text-stone-300 text-sm font-medium">Bot Configuration</h3>

        {/* Posts per day slider */}
        <div className="space-y-2">
          <label className="flex items-center justify-between text-stone-400 text-sm">
            <span>Posts per day</span>
            <span className="text-amber-400 font-mono font-semibold">{config.posts_per_day}</span>
          </label>
          <input
            type="range"
            min={0}
            max={20}
            value={config.posts_per_day}
            onChange={(e) => setConfig((prev) => prev ? ({ ...prev, posts_per_day: Number(e.target.value) }) : prev)}
            className="w-full accent-amber-500 h-1.5"
          />
          <div className="flex justify-between text-xs text-stone-600">
            <span>0</span><span>20</span>
          </div>
        </div>

        {/* Replies per day slider */}
        <div className="space-y-2">
          <label className="flex items-center justify-between text-stone-400 text-sm">
            <span>Replies per day</span>
            <span className="text-amber-400 font-mono font-semibold">{config.replies_per_day}</span>
          </label>
          <input
            type="range"
            min={0}
            max={20}
            value={config.replies_per_day}
            onChange={(e) => setConfig((prev) => prev ? ({ ...prev, replies_per_day: Number(e.target.value) }) : prev)}
            className="w-full accent-amber-500 h-1.5"
          />
          <div className="flex justify-between text-xs text-stone-600">
            <span>0</span><span>20</span>
          </div>
        </div>

        {/* Active personas */}
        <div className="space-y-3">
          <p className="text-stone-400 text-sm">Active Personas</p>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {ALL_PERSONAS.map((name) => {
              const active = config.active_persona_ids.includes(name);
              return (
                <button
                  key={name}
                  onClick={() => togglePersona(name)}
                  className={`px-3 py-2.5 rounded-xl border text-sm transition-all min-h-[44px] ${
                    active
                      ? 'bg-teal-900/30 border-teal-600/40 text-teal-300'
                      : 'bg-stone-900/40 border-stone-800/40 text-stone-500 hover:text-stone-400'
                  }`}
                >
                  {name}
                </button>
              );
            })}
          </div>
        </div>

        {/* Save */}
        <div className="flex items-center gap-3 pt-2">
          <button
            onClick={save}
            disabled={saving}
            className="px-5 py-2.5 bg-amber-600 hover:bg-amber-500 disabled:opacity-50 text-stone-950 rounded-xl text-sm font-semibold transition-colors min-h-[44px]"
          >
            {saving ? 'Saving…' : 'Save Config'}
          </button>
          {saveStatus === 'ok' && <span className="text-emerald-400 text-sm">Saved ✓</span>}
          {saveStatus === 'err' && <span className="text-rose-400 text-sm">Failed — check admin permissions</span>}
        </div>
      </div>

      {/* Recent bot activity */}
      <div className="space-y-3">
        <h3 className="text-stone-300 text-sm font-medium">Recent Bot Activity</h3>
        {postsLoading ? (
          <div className="flex items-center gap-2 text-stone-500 text-xs py-4">
            <div className="h-3 w-3 border border-stone-600 border-t-stone-400 rounded-full animate-spin" />
            Loading…
          </div>
        ) : !BOT_USER_ID ? (
          <p className="text-stone-500 text-xs py-4">
            Set <code className="text-stone-400">VITE_BOT_USER_ID</code> to see bot activity.
          </p>
        ) : recentPosts.length === 0 ? (
          <p className="text-stone-500 text-xs py-4">No recent bot posts.</p>
        ) : (
          <div className="space-y-2">
            {recentPosts.map((post) => (
              <div key={post.id} className="bg-stone-900/40 border border-stone-800/40 rounded-xl px-4 py-3">
                <p className="text-stone-300 text-sm leading-relaxed line-clamp-2">{post.content}</p>
                <div className="flex items-center gap-2 mt-1.5">
                  <span className="text-stone-600 text-xs">
                    {new Date(post.created_at).toLocaleString()}
                  </span>
                  <span className="text-stone-700 text-xs">·</span>
                  <span className="text-stone-600 text-xs font-mono">thread:{post.thread_id.slice(0, 8)}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
