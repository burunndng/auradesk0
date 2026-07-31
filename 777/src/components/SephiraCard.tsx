import { Link } from 'react-router-dom'
import ColorSwatch from './ColorSwatch'
import type { Sephira } from '../lib/types'

export default function SephiraCard({ s }: { s: Sephira }) {
  return (
    <Link
      to={`/sephiroth/${s.number}`}
      className="group flex flex-col gap-4 rounded-xl border border-edge bg-surface/70 p-6 transition duration-300 hover:border-edge-strong hover:bg-raised"
    >
      <div className="flex items-start justify-between">
        <span className="font-display text-5xl leading-none text-gilt/80 transition group-hover:text-gilt">
          {String(s.number).padStart(2, '0')}
        </span>
        <ColorSwatch king={s.color.king} queen={s.color.queen} />
      </div>
      <div>
        <h3 className="font-display text-3xl text-ink">{s.name}</h3>
        <p className="font-mono text-xs tracking-wider text-ink-faint">
          {s.hebrew_name} · {s.translit}
        </p>
      </div>
      <p className="font-mono text-xs uppercase tracking-wide text-gilt-dim">
        {s.planet}
      </p>
      <p className="line-clamp-2 text-sm text-ink-soft">{s.titles}</p>
    </Link>
  )
}
