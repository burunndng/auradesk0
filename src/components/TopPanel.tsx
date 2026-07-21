import { useState, useEffect, useCallback, memo, useRef } from 'react';
import { format } from 'date-fns';
import { Power } from 'lucide-react';
import { useOS } from '@/hooks/useOSStore';

const TopPanel = memo(function TopPanel() {
  const { state, dispatch } = useOS();
  const [time, setTime] = useState(new Date());
  const [sysMenuOpen, setSysMenuOpen] = useState(false);
  const [coherence, setCoherence] = useState(98.1);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const interval = setInterval(() => {
      setTime(new Date());
      setCoherence(98.1 + Math.sin(Date.now() / 4000) * 0.7);
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (!sysMenuOpen) return;
    const handleClick = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setSysMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [sysMenuOpen]);

  const handleActivities = useCallback(() => {
    dispatch({ type: 'TOGGLE_APP_LAUNCHER' });
  }, [dispatch]);

  const t = format(time, 'HH:mm:ss');
  const dateLabel = format(time, 'EEE d MMM').toUpperCase();

  return (
    <div
      className="fixed top-0 left-0 right-0 z-[200] flex items-center justify-between select-none"
      style={{
        height: 30,
        background: 'var(--bg-panel)',
        backdropFilter: 'blur(18px)',
        WebkitBackdropFilter: 'blur(18px)',
        borderBottom: '1px solid var(--border-subtle)',
        color: 'var(--text-primary)',
        padding: '0 16px',
      }}
    >
      {/* Left: brand + activities */}
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2.5">
          <div className="brand-mark" style={{ width: 11, height: 11 }} />
          <span className="font-display font-bold tracking-[0.18em]" style={{ fontSize: 12 }}>
            SERK3T<span style={{ color: 'var(--text-thin)', fontWeight: 500 }}>OS</span>
          </span>
        </div>
        <div className="hairline" style={{ width: 1, height: 14 }} />
        <button
          onClick={handleActivities}
          className="font-mono hover:bg-[var(--bg-hover)] transition-colors"
          style={{ fontSize: 9, letterSpacing: '0.2em', textTransform: 'uppercase', color: 'var(--text-secondary)', padding: '4px 8px', borderRadius: 4 }}
        >
          ◈ Membrane
        </button>
      </div>

      {/* Center: telemetry clock */}
      <div className="absolute left-1/2 -translate-x-1/2 flex items-center gap-5">
        <span className="font-mono" style={{ fontSize: 9, letterSpacing: '0.18em', color: 'var(--text-tertiary)', textTransform: 'uppercase' }}>
          {dateLabel}
        </span>
        <span className="font-mono glow-text-violet" style={{ fontSize: 11, letterSpacing: '0.14em', color: 'var(--text-primary)' }}>
          {t}
        </span>
        <span className="font-mono" style={{ fontSize: 9, letterSpacing: '0.16em', color: 'var(--text-tertiary)' }}>
          COH <b style={{ color: 'var(--accent-primary)' }}>{coherence.toFixed(1)}%</b>
        </span>
      </div>

      {/* Right: status */}
      <div className="flex items-center gap-4">
        <span className="font-mono flex items-center gap-1.5" style={{ fontSize: 9, letterSpacing: '0.16em', color: 'var(--text-secondary)' }}>
          <span className="status-dot" />
          VEIL LINK / STABLE
        </span>
        <div className="hairline" style={{ width: 1, height: 14 }} />
        <div className="relative" ref={menuRef}>
          <button
            onClick={() => setSysMenuOpen(!sysMenuOpen)}
            className="hover:bg-[var(--bg-hover)] transition-colors"
            style={{ padding: 5, borderRadius: 4, color: 'var(--text-secondary)' }}
            title="System"
          >
            <Power size={13} />
          </button>

          {sysMenuOpen && (
            <div
              className="absolute top-full right-0 mt-1 py-1 z-[5000] surface-glass"
              style={{
                borderRadius: 8,
                boxShadow: 'var(--shadow-lg)',
                width: 244,
                animation: 'scaleIn 120ms cubic-bezier(0,0,0.2,1)',
              }}
            >
              <div className="flex items-center gap-2.5 px-3 py-2.5">
                <div
                  className="flex items-center justify-center"
                  style={{
                    width: 30,
                    height: 30,
                    borderRadius: 6,
                    background: 'linear-gradient(135deg, #6245d9, #805cff)',
                    boxShadow: 'var(--glow-violet)',
                  }}
                >
                  <span className="font-display font-bold text-white" style={{ fontSize: 12 }}>
                    {(state.auth.userName[0] || 'U').toUpperCase()}
                  </span>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-display font-semibold truncate" style={{ fontSize: 12, color: 'var(--text-primary)' }}>
                    {state.auth.userName}
                  </div>
                  <div className="font-mono" style={{ fontSize: 8, letterSpacing: '0.16em', color: 'var(--text-tertiary)', textTransform: 'uppercase' }}>
                    OPERATOR / CLEARANCE-9
                  </div>
                </div>
              </div>

              <div className="hairline mx-2" />

              {[
                { label: 'Veil Channel', on: true },
                { label: 'Neural Mesh', on: true },
                { label: 'Ghost Uplink', on: false },
              ].map((item) => (
                <div key={item.label} className="flex items-center gap-2 px-3 py-2 hover:bg-[var(--bg-hover)] cursor-pointer">
                  <span className="font-mono flex-1" style={{ fontSize: 10, letterSpacing: '0.1em', color: 'var(--text-secondary)' }}>
                    {item.label}
                  </span>
                  <div
                    style={{
                      width: 26,
                      height: 14,
                      borderRadius: 999,
                      background: item.on ? 'var(--accent-primary)' : 'rgba(255,255,255,0.1)',
                      position: 'relative',
                      boxShadow: item.on ? '0 0 10px rgba(128,92,255,0.5)' : 'none',
                    }}
                  >
                    <div
                      style={{
                        position: 'absolute',
                        top: 2,
                        width: 10,
                        height: 10,
                        borderRadius: '50%',
                        background: '#fff',
                        left: item.on ? 14 : 2,
                        transition: 'left 150ms ease',
                      }}
                    />
                  </div>
                </div>
              ))}

              <div className="hairline mx-2" />

              <button
                className="w-full flex items-center gap-2 px-3 py-2 text-left hover:bg-[var(--bg-hover)] transition-colors font-mono"
                style={{ fontSize: 10, letterSpacing: '0.1em', color: 'var(--text-secondary)' }}
                onClick={() => { setSysMenuOpen(false); dispatch({ type: 'LOGOUT' }); }}
              >
                ◳ Seal Membrane
              </button>
              <button
                className="w-full flex items-center gap-2 px-3 py-2 text-left hover:bg-[var(--bg-hover)] transition-colors font-mono"
                style={{ fontSize: 10, letterSpacing: '0.1em', color: 'var(--accent-crimson)' }}
                onClick={() => setSysMenuOpen(false)}
              >
                ⏻ Power Down
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
});

export default TopPanel;
