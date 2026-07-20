import React from 'react';

// Alias map for common abbreviations
const ALIASES: Record<string, string[]> = {
  'ifs': ['internal family systems'],
  '3-2-1': ['three two one'],
  '321': ['three two one'],
  'aqal': ['aqal report'],
  'ibp': ['integral body architect'],
  'dwa': ['dynamic workout'],
  'big mind': ['big mind process'],
};

interface NavItem {
  id: string;
  label: string;
  group?: string;
  icon?: React.ComponentType<any>;
}

interface CommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
  navItems: NavItem[];
  onNavigate: (id: string) => void;
}

const trackRecent = (tabId: string) => {
  try {
    const stored = JSON.parse(localStorage.getItem('aura-nav-recent') || '[]') as string[];
    const updated = [tabId, ...stored.filter(id => id !== tabId)].slice(0, 5);
    localStorage.setItem('aura-nav-recent', JSON.stringify(updated));
  } catch (error) {
    console.error('Failed to track recent item in localStorage:', error);
  }
};

const getRecentItems = (navItems: NavItem[]): NavItem[] => {
  try {
    const ids = JSON.parse(localStorage.getItem('aura-nav-recent') || '[]') as string[];
    return ids.map(id => navItems.find(i => i.id === id)).filter(Boolean) as NavItem[];
  } catch (error) {
    console.error('Failed to get recent items from localStorage:', error);
    return [];
  }
};

export const CommandPalette: React.FC<CommandPaletteProps> = ({ isOpen, onClose, navItems, onNavigate }) => {
  const [query, setQuery] = React.useState('');
  const [highlightedIndex, setHighlightedIndex] = React.useState(0);
  const inputRef = React.useRef<HTMLInputElement>(null);

  React.useEffect(() => {
    if (isOpen) {
      setQuery('');
      setHighlightedIndex(0);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [isOpen]);

  const results = React.useMemo(() => {
    if (!query.trim()) return getRecentItems(navItems);
    const q = query.toLowerCase().trim();
    const aliasMatches = Object.entries(ALIASES)
      .filter(([key]) => key.includes(q) || q.includes(key))
      .flatMap(([, targets]) => targets);
    return navItems.filter(item => {
      const label = item.label.toLowerCase();
      if (label.includes(q)) return true;
      if (aliasMatches.some(t => label.includes(t))) return true;
      return false;
    });
  }, [query, navItems]);

  React.useEffect(() => {
    setHighlightedIndex(0);
  }, [results.length]);

  const handleSelect = (item: NavItem) => {
    trackRecent(item.id);
    onNavigate(item.id);
    onClose();
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setHighlightedIndex(i => Math.min(i + 1, results.length - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setHighlightedIndex(i => Math.max(i - 1, 0));
    } else if (e.key === 'Enter') {
      if (results[highlightedIndex]) handleSelect(results[highlightedIndex]);
    } else if (e.key === 'Escape') {
      onClose();
    }
  };

  if (!isOpen) return null;

  const showingRecents = !query.trim();

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
        onClick={onClose}
      />
      {/* Palette */}
      <div className="fixed top-[20%] left-1/2 -translate-x-1/2 w-full max-w-lg z-50 px-4">
        <div className="bg-stone-900/95 backdrop-blur-xl border border-white/[0.08] rounded-2xl shadow-2xl shadow-black/60 overflow-hidden">
          {/* Search input */}
          <div className="flex items-center gap-3 px-4 py-3 border-b border-white/[0.06]">
            <svg className="w-4 h-4 text-slate-500 flex-shrink-0" viewBox="0 0 16 16" fill="none">
              <circle cx="6.5" cy="6.5" r="4.5" stroke="currentColor" strokeWidth="1.5"/>
              <path d="M10 10l3 3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
            </svg>
            <input
              ref={inputRef}
              role="combobox"
              aria-expanded={results.length > 0}
              aria-autocomplete="list"
              aria-controls="palette-listbox"
              aria-activedescendant={results[highlightedIndex] ? `palette-item-${results[highlightedIndex].id}` : undefined}
              value={query}
              onChange={e => setQuery(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Search navigation..."
              className="flex-1 bg-transparent text-slate-200 placeholder:text-slate-500 text-sm outline-none"
            />
            <kbd className="text-[10px] text-slate-600 border border-slate-700 rounded px-1.5 py-0.5">ESC</kbd>
          </div>

          {/* Results */}
          <div
            id="palette-listbox"
            role="listbox"
            aria-label="Navigation results"
            className="max-h-72 overflow-y-auto py-1.5"
          >
            {showingRecents && results.length > 0 && (
              <div className="px-4 py-1 text-[10px] font-mono uppercase tracking-widest text-slate-600">Recent</div>
            )}
            {results.length === 0 && (
              <div className="px-4 py-6 text-center text-sm text-slate-500">No results for "{query}"</div>
            )}
            {results.map((item, index) => (
              <button
                key={item.id}
                id={`palette-item-${item.id}`}
                role="option"
                aria-selected={index === highlightedIndex}
                onMouseEnter={() => setHighlightedIndex(index)}
                onClick={() => handleSelect(item)}
                className={`w-full flex items-center gap-3 px-4 py-2 text-left transition-colors duration-100 ${
                  index === highlightedIndex ? 'bg-white/[0.06]' : 'hover:bg-white/[0.04]'
                }`}
              >
                <span className="flex-1 text-sm text-slate-200">{item.label}</span>
                {item.group && (
                  <span className="text-[10px] text-slate-600 border border-slate-700 rounded px-1.5 py-0.5">
                    {item.group}
                  </span>
                )}
              </button>
            ))}
          </div>

          {/* Footer hint */}
          <div className="px-4 py-2 border-t border-white/[0.04] flex items-center gap-3 text-[10px] text-slate-600">
            <span><kbd className="border border-slate-700 rounded px-1">↑↓</kbd> navigate</span>
            <span><kbd className="border border-slate-700 rounded px-1">↵</kbd> open</span>
            <span><kbd className="border border-slate-700 rounded px-1">⌘K</kbd> toggle</span>
          </div>
        </div>
      </div>

      {/* Screen reader live region */}
      <div aria-live="polite" className="sr-only">
        {results.length} result{results.length !== 1 ? 's' : ''}
      </div>
    </>
  );
};

export { trackRecent };
export type { NavItem as CommandPaletteNavItem };
