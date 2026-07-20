import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';

interface RedeemCodeModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function RedeemCodeModal({ isOpen, onClose }: RedeemCodeModalProps) {
  const { user, updateProfile } = useAuth();
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const handleClose = () => {
    setCode('');
    setError(null);
    setSuccess(null);
    onClose();
  };

  const handleRedeem = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user?.id || !code.trim()) return;

    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const res = await fetch('/api/redeem-code', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: user.id, code: code.trim() }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || 'Failed to redeem code');
        return;
      }

      const expiresDate = new Date(data.expiresAt).toLocaleDateString('en-US', {
        year: 'numeric', month: 'long', day: 'numeric',
      });

      setSuccess(`Access active until ${expiresDate}`);

      // Refresh user profile so gates open immediately
      await updateProfile({ preferences: {
        subscription_tier: 'pro',
        subscription_status: 'active',
        subscription_expires_at: data.expiresAt,
      }});

      setTimeout(() => handleClose(), 2000);
    } catch {
      setError('Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm">
      <div className="relative w-full max-w-sm mx-4 bg-stone-950 border border-stone-800 rounded-xl shadow-2xl p-6">
        <button
          onClick={handleClose}
          className="absolute top-4 right-4 text-stone-500 hover:text-stone-300 transition-colors text-lg leading-none"
          aria-label="Close"
        >
          ✕
        </button>

        <h2 className="text-lg font-semibold text-amber-300 mb-1">Redeem Access Code</h2>
        <p className="text-xs text-stone-500 mb-5">Enter your code to unlock premium access.</p>

        {success && (
          <div className="mb-4 p-3 bg-emerald-900/20 border border-emerald-600/30 rounded-lg text-emerald-400 text-sm">
            {success}
          </div>
        )}
        {error && (
          <div className="mb-4 p-3 bg-rose-900/20 border border-rose-600/30 rounded-lg text-rose-400 text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleRedeem} className="space-y-4">
          <input
            type="text"
            value={code}
            onChange={(e) => setCode(e.target.value.toUpperCase())}
            placeholder="AOS-XXXX-XXXX"
            className="w-full px-4 py-3 bg-stone-900 border border-stone-700 rounded-lg text-stone-100 font-mono text-sm placeholder-stone-600 focus:outline-none focus:ring-2 focus:ring-amber-400/40 tracking-widest"
            disabled={loading || !!success}
            autoFocus
          />
          <button
            type="submit"
            disabled={loading || !code.trim() || !!success}
            className="w-full py-2.5 bg-amber-600 hover:bg-amber-500 disabled:bg-stone-800 disabled:text-stone-600 text-stone-950 font-semibold text-sm rounded-lg transition-colors"
          >
            {loading ? 'Redeeming…' : 'Redeem'}
          </button>
        </form>
      </div>
    </div>
  );
}
