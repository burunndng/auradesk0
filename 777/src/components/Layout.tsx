import { Link } from 'react-router-dom'
import type { ReactNode } from 'react'

const SOURCES = [
  'Crowley, A. (1909). Liber 777.',
  'Agrippa, H. C. (1533). Three Books of Occult Philosophy.',
  'Kaplan, A. (trans.). (1990). Sefer Yetzirah.',
  'Lévi-Strauss, C. (1962). The Savage Mind.',
  'Durkheim, É. (1912). The Elementary Forms of Religious Life.',
  'Luhrmann, T. M. (1989). Persuasions of the Witch’s Craft.',
  'Whitehouse, H. (2004). Modes of Religiosity.',
]

export default function Layout({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col">
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:fixed focus:left-3 focus:top-3 focus:z-50 focus:rounded-md focus:border focus:border-gilt focus:bg-bg focus:px-3 focus:py-1.5 focus:text-xs focus:text-ink"
      >
        Skip to content
      </a>
      <header className="no-print sticky top-0 z-10 border-b border-edge bg-bg/80 backdrop-blur">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-5 py-4">
          <Link to="/" className="flex items-baseline gap-3" aria-label="777 Sephiroth — home">
            <span className="font-display text-2xl tracking-[0.2em] text-gilt">
              777
            </span>
            <span className="eyebrow">Sephiroth</span>
          </Link>
          <nav aria-label="Primary" className="flex items-center gap-6 text-sm text-ink-soft">
            <Link to="/" className="link-gilt hover:text-ink">
              About
            </Link>
            <Link to="/table" className="link-gilt hover:text-ink">
              Table
            </Link>
            <Link to="/sephiroth" className="link-gilt hover:text-ink">
              Spheres
            </Link>
            <Link to="/triads" className="link-gilt hover:text-ink">
              Triads
            </Link>
          </nav>
        </div>
      </header>

      <main id="main" className="mx-auto w-full max-w-5xl flex-1 px-5 py-12">
        {children}
      </main>

      <footer className="mx-auto w-full max-w-5xl px-5 pb-12 pt-4">
        <div className="hairline" />
        <div className="mt-6 grid gap-6 md:grid-cols-[1fr_1.4fr]">
          <div>
            <p className="eyebrow mb-2">Colophon</p>
            <p className="text-sm leading-relaxed text-ink-faint">
              A clean reference for the ten Sephiroth of Liber 777. Crowley’s
              correspondences are historical source material; the framing,
              modern notes, and layout are a contemporary re-reading — not
              scripture.
            </p>
          </div>
          <div>
            <p className="eyebrow mb-2">Sources</p>
            <ul className="space-y-1 text-xs leading-relaxed text-ink-faint">
              {SOURCES.map((s) => (
                <li key={s}>{s}</li>
              ))}
            </ul>
          </div>
        </div>
      </footer>
    </div>
  )
}
