import React, { useState, useEffect, useRef } from 'react';
import AstralCompassIcon from '../visualizations/SacredGeometryIcons/AstralCompassIcon';

const LANGUAGES = [
  { code: '', label: 'English' },
  { code: 'es', label: 'Español' },
  { code: 'fr', label: 'Français' },
  { code: 'de', label: 'Deutsch' },
  { code: 'pt', label: 'Português' },
  { code: 'it', label: 'Italiano' },
  { code: 'ja', label: '日本語' },
  { code: 'zh-CN', label: '中文' },
  { code: 'ar', label: 'العربية' },
];

const LS_KEY = 'aura-language';

function getCurrentLang(): string {
  // Check googtrans cookie
  const match = document.cookie.match(/googtrans=\/en\/([^;]+)/);
  return match ? match[1] : '';
}

function applyLanguage(code: string) {
  if (code === '') {
    // Reset: remove cookie and reload
    document.cookie = 'googtrans=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
    document.cookie = `googtrans=/en/en; path=/`;
    const select = document.querySelector('.goog-te-combo') as HTMLSelectElement | null;
    if (select) {
      select.value = 'en';
      select.dispatchEvent(new Event('change'));
    }
    return;
  }
  document.cookie = `googtrans=/en/${code}; path=/`;
  const select = document.querySelector('.goog-te-combo') as HTMLSelectElement | null;
  if (select) {
    select.value = code;
    select.dispatchEvent(new Event('change'));
  }
}

export default function LanguageSelector() {
  const [open, setOpen] = useState(false);
  const [current, setCurrent] = useState<string>(() => localStorage.getItem(LS_KEY) ?? '');
  const ref = useRef<HTMLDivElement>(null);

  // On mount, restore saved preference
  useEffect(() => {
    const saved = localStorage.getItem(LS_KEY) ?? '';
    if (saved && saved !== getCurrentLang()) {
      applyLanguage(saved);
    }
  }, []);

  // Close on outside click
  useEffect(() => {
    function handle(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener('mousedown', handle);
    return () => document.removeEventListener('mousedown', handle);
  }, []);

  function select(code: string) {
    setCurrent(code);
    localStorage.setItem(LS_KEY, code);
    applyLanguage(code);
    setOpen(false);
  }

  const currentLabel = LANGUAGES.find(l => l.code === current)?.label ?? 'English';

  return (
    <div ref={ref} className="relative w-full">
      <button
        onClick={() => setOpen(v => !v)}
        className="w-full flex items-center gap-3 p-4 rounded-xl text-left transition-all duration-300 hover:brightness-110"
        style={{
          background: 'rgba(173,1,78,0.15)',
          border: '1px solid rgba(173,1,78,0.4)',
        }}
        aria-haspopup="listbox"
        aria-expanded={open}
      >
        <div
          className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0"
          style={{ background: 'linear-gradient(135deg, #AD014E, #7a0137)' }}
        >
          <AstralCompassIcon size={20} color="#F0D77A" />
        </div>
        <div className="flex-1 min-w-0">
          <h4 className="font-medium" style={{ color: '#F0D77A' }}>Language</h4>
          <p className="text-xs" style={{ color: 'rgba(240,215,122,0.6)' }}>{currentLabel}</p>
        </div>
        <span className={`text-xs transition-transform duration-200`} style={{ color: '#F0D77A' }}>
          {open ? '▴' : '▾'}
        </span>
      </button>

      {open && (
        <div
          role="listbox"
          className="absolute top-full left-0 mt-1 w-full rounded-xl z-50"
          style={{
            background: 'rgba(15,5,10,0.98)',
            border: '1px solid rgba(173,1,78,0.4)',
            boxShadow: '0 8px 32px rgba(0,0,0,0.7)',
            backdropFilter: 'blur(16px)',
            maxHeight: 'min(280px, 60dvh)',
            overflowY: 'auto',
          }}
        >
          {LANGUAGES.map(lang => (
            <button
              key={lang.code}
              role="option"
              aria-selected={current === lang.code}
              onClick={() => select(lang.code)}
              className="w-full text-left px-4 py-2.5 text-sm font-sans transition-colors duration-150"
              style={{
                color: current === lang.code ? '#F0D77A' : 'rgba(240,215,122,0.5)',
                background: current === lang.code ? 'rgba(173,1,78,0.2)' : 'transparent',
              }}
              onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = 'rgba(173,1,78,0.15)'; (e.currentTarget as HTMLElement).style.color = '#F0D77A'; }}
              onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = current === lang.code ? 'rgba(173,1,78,0.2)' : 'transparent'; (e.currentTarget as HTMLElement).style.color = current === lang.code ? '#F0D77A' : 'rgba(240,215,122,0.5)'; }}
            >
              {lang.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
