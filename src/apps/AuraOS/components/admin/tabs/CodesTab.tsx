import React, { useState, useEffect } from 'react';
import { generatePromoCode, listPromoCodes, revokePromoCode } from '../../../services/promoCodeService';
import type { PromoCode } from '../../../types';

const statusStyles: Record<PromoCode['status'], string> = {
  active: 'bg-emerald-900/30 text-emerald-400 border-emerald-700/30',
  redeemed: 'bg-amber-900/30 text-amber-400 border-amber-700/30',
  revoked: 'bg-stone-800/50 text-stone-500 border-stone-700/30',
};

export default function CodesTab() {
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

  return (
    <div className="space-y-6">
      {/* Generate */}
      <div className="bg-stone-900/50 border border-stone-800/40 rounded-xl p-5 space-y-4">
        <h3 className="text-stone-300 text-sm font-medium">Generate Promo Code</h3>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <label className="text-xs text-stone-500">Days valid:</label>
            <input
              type="number"
              min={1}
              max={365}
              value={daysValid}
              onChange={(e) => setDaysValid(Number(e.target.value))}
              className="w-16 px-2.5 py-1.5 bg-stone-900 border border-stone-700/50 rounded-lg text-stone-100 text-sm text-center focus:outline-none focus:ring-1 focus:ring-amber-400/40"
            />
          </div>
          <button
            onClick={handleGenerate}
            disabled={generating}
            className="px-5 py-2 bg-amber-600 hover:bg-amber-500 disabled:bg-stone-700 text-stone-950 text-sm font-semibold rounded-xl transition-colors min-h-[44px]"
          >
            {generating ? 'Generating…' : 'Generate'}
          </button>
        </div>
        {newCode && (
          <div className="flex items-center gap-3">
            <code className="flex-1 px-4 py-2.5 bg-stone-950/60 border border-emerald-700/30 rounded-xl text-emerald-300 font-mono text-sm tracking-widest">
              {newCode}
            </code>
            <button
              onClick={() => handleCopy(newCode)}
              className="px-4 py-2.5 bg-stone-800/60 hover:bg-stone-700/60 border border-stone-700/40 text-stone-300 text-xs rounded-xl transition-colors min-h-[44px]"
            >
              {copied ? 'Copied!' : 'Copy'}
            </button>
          </div>
        )}
      </div>

      {/* List */}
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <div className="h-5 w-5 border-2 border-amber-500/40 border-t-amber-400 rounded-full animate-spin" />
        </div>
      ) : codes.length === 0 ? (
        <div className="text-stone-500 py-8 text-center text-sm">No codes yet.</div>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-stone-800/40">
          <table className="w-full text-xs">
            <thead>
              <tr className="text-stone-500 border-b border-stone-800/60 uppercase tracking-wider">
                <th className="text-left py-3 px-4 font-medium">Code</th>
                <th className="text-left py-3 px-4 font-medium">Status</th>
                <th className="text-left py-3 px-4 font-medium">Days</th>
                <th className="text-left py-3 px-4 font-medium">Created</th>
                <th className="text-left py-3 px-4 font-medium">Action</th>
              </tr>
            </thead>
            <tbody>
              {codes.map((c) => (
                <tr key={c.id || c.code} className="border-b border-stone-800/30 hover:bg-stone-900/40 transition-colors">
                  <td className="py-3 px-4 font-mono text-stone-200 tracking-wider">{c.code}</td>
                  <td className="py-3 px-4">
                    <span className={`inline-flex px-2 py-0.5 rounded-md border text-xs ${statusStyles[c.status]}`}>
                      {c.status}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-stone-400">{c.days_valid}d</td>
                  <td className="py-3 px-4 text-stone-500">{new Date(c.created_at).toLocaleDateString()}</td>
                  <td className="py-3 px-4">
                    {c.status === 'active' && c.id && (
                      <button
                        onClick={() => handleRevoke(c.id)}
                        disabled={revoking === c.id}
                        className="text-rose-500/70 hover:text-rose-400 disabled:text-stone-600 text-xs transition-colors"
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
