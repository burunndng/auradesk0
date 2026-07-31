import { Link } from 'react-router-dom'
import { sephiroth } from '../data/sephiroth'
import { colorHex } from '../components/ColorSwatch'
import type { Sephira } from '../lib/types'

type RowDef = {
  label: string
  key: (s: Sephira) => React.ReactNode
}

const ROWS: RowDef[] = [
  { label: 'Number', key: (s) => s.number },
  { label: 'Planet / Body', key: (s) => s.planet },
  { label: 'Divine Name', key: (s) => s.divine_name },
  { label: 'Archangel', key: (s) => s.archangel },
  { label: 'Angelic Order', key: (s) => s.angelic_order },
  {
    label: 'Color (King)',
    key: (s) => (
      <div className="flex items-center gap-2">
        <span
          className="inline-block h-3 w-3 shrink-0 rounded-full border border-edge-strong"
          style={{ backgroundColor: colorHex(s.color.king) }}
          aria-hidden
        />
        <span className="capitalize">{s.color.king}</span>
      </div>
    ),
  },
  {
    label: 'Color (Queen)',
    key: (s) => (
      <div className="flex items-center gap-2">
        <span
          className="inline-block h-3 w-3 shrink-0 rounded-full border border-edge-strong"
          style={{ backgroundColor: colorHex(s.color.queen) }}
          aria-hidden
        />
        <span className="capitalize">{s.color.queen}</span>
      </div>
    ),
  },
  { label: 'Tarot', key: (s) => s.tarot },
  { label: 'Symbols', key: (s) => s.symbols.slice(0, 2).join(', ') + (s.symbols.length > 2 ? '…' : '') },
  { label: 'Virtue', key: (s) => s.virtue },
  { label: 'Vice', key: (s) => s.vice },
  { label: 'Pillar', key: (s) => s.pillar },
  { label: 'Triad', key: (s) => s.triad },
]

const CELL = 'px-3 py-3 text-sm text-ink-soft border-b border-edge/60 align-top'
const HEADER_CELL = 'px-3 py-3 border-b border-edge font-display text-lg text-ink whitespace-nowrap'

export default function CorrespondenceTable() {
  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-col gap-3">
        <p className="eyebrow">Liber 777 · Correspondences</p>
        <h1 className="font-display text-5xl text-ink">Correspondence Table</h1>
        <p className="prose-reading">
          All ten spheres, side by side, over the full column set. Read across to
          compare a single correspondence across spheres, or down to see one
          sphere's full cluster.{' '}
          <Link to="/sephiroth" className="link-gilt text-ink-soft hover:text-ink">
            Browse by sphere
          </Link>
          {' '}for the detail views with modern notes and usage guides.
        </p>
      </div>

      <div className="overflow-x-auto rounded-xl border border-edge bg-surface/60">
        <table className="w-full min-w-[900px] border-collapse text-left">
          <thead>
            <tr className="border-b border-edge">
              <th className={HEADER_CELL + ' text-ink-faint font-mono text-[10px] uppercase tracking-[0.22em] sticky left-0 bg-bg z-10'}>
                Attribute
              </th>
              {sephiroth.map((s) => (
                <th key={s.number} className={HEADER_CELL}>
                  <Link to={`/sephiroth/${s.number}`} className="link-gilt">
                    {s.hebrew_name}
                  </Link>
                  <span className="block font-mono text-[10px] tracking-wider text-ink-faint">
                    {s.name}
                  </span>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {ROWS.map((row) => (
              <tr key={row.label} className="transition hover:bg-raised/50">
                <td className={CELL + ' font-mono text-xs uppercase tracking-[0.15em] text-gilt whitespace-nowrap sticky left-0 bg-surface/80 z-10'}>
                  {row.label}
                </td>
                {sephiroth.map((s) => (
                  <td key={s.number} className={CELL}>
                    {row.key(s)}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="mx-auto max-w-reading text-center text-sm text-ink-faint">
        Each row is a correspondence domain. Tap a sphere name at the top to open
        its full entry with modern marginalia and usage notes.
      </div>
    </div>
  )
}