import { Link } from 'react-router-dom'
import { useMemo, useState } from 'react'
import { sephiroth } from '../data/sephiroth'
import SephiraCard from '../components/SephiraCard'
import SephiraTable from '../components/SephiraTable'
import SearchBar from '../components/SearchBar'
import TreeDiagram from '../components/TreeDiagram'

type View = 'cards' | 'table'

export default function SephirothList() {
  const [q, setQ] = useState('')
  const [view, setView] = useState<View>('cards')

  const results = useMemo(() => {
    const t = q.trim().toLowerCase()
    if (!t) return sephiroth
    return sephiroth.filter((s) =>
      [
        s.name,
        s.translit,
        s.hebrew_name,
        s.planet,
        s.titles,
        s.divine_name,
        s.archangel,
        s.angelic_order,
        s.symbols.join(' '),
        s.deities_figures.join(' '),
        s.virtue,
        s.vice,
      ]
        .join(' ')
        .toLowerCase()
        .includes(t),
    )
  }, [q])

  return (
    <div className="flex flex-col gap-10">
      <div className="grid items-start gap-8 md:grid-cols-[1fr_220px]">
        <div className="flex flex-col gap-3">
          <p className="eyebrow">The core spine of Liber 777</p>
          <h1 className="font-display text-5xl text-ink">Ten Spheres</h1>
          <p className="prose-reading">
            From Kether (the crown) to Malkuth (the kingdom). Search, then open a
            sphere for its full cluster. Or{' '}
            <Link to="/table" className="link-gilt text-ink-soft hover:text-ink">
              view the full correspondence table
            </Link>.
          </p>
        </div>
        <TreeDiagram className="hidden w-full md:block" />
      </div>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <SearchBar value={q} onChange={setQ} />
        <div
          role="tablist"
          aria-label="View"
          className="inline-flex shrink-0 rounded-lg border border-edge bg-surface/70 p-1 text-xs"
        >
          {(['cards', 'table'] as const).map((v) => (
            <button
              key={v}
              role="tab"
              aria-selected={view === v}
              onClick={() => setView(v)}
              className={
                'rounded-md px-3 py-1.5 font-mono uppercase tracking-wider transition ' +
                (view === v
                  ? 'bg-raised text-ink'
                  : 'text-ink-faint hover:text-ink')
              }
            >
              {v}
            </button>
          ))}
        </div>
      </div>

      {results.length === 0 ? (
        <p className="text-ink-faint">No spheres match “{q}”.</p>
      ) : view === 'cards' ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {results.map((s) => (
            <SephiraCard key={s.number} s={s} />
          ))}
        </div>
      ) : (
        <SephiraTable items={results} />
      )}
    </div>
  )
}