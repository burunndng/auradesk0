import { Link } from 'react-router-dom'
import { colorHex } from './ColorSwatch'
import type { Sephira } from '../lib/types'

export default function SephiraTable({ items }: { items: Sephira[] }) {
  return (
    <div className="overflow-x-auto rounded-xl border border-edge bg-surface/60">
      <table className="w-full min-w-[760px] border-collapse text-left">
        <thead>
          <tr className="border-b border-edge text-ink-faint">
            <th className="px-4 py-3 font-mono text-[10px] uppercase tracking-[0.22em]">No.</th>
            <th className="px-4 py-3 font-mono text-[10px] uppercase tracking-[0.22em]">Sphere</th>
            <th className="px-4 py-3 font-mono text-[10px] uppercase tracking-[0.22em]">Planet</th>
            <th className="px-4 py-3 font-mono text-[10px] uppercase tracking-[0.22em]">Divine Name</th>
            <th className="px-4 py-3 font-mono text-[10px] uppercase tracking-[0.22em]">Archangel</th>
            <th className="px-4 py-3 font-mono text-[10px] uppercase tracking-[0.22em]">Color</th>
            <th className="px-4 py-3 font-mono text-[10px] uppercase tracking-[0.22em]">Pillar</th>
            <th className="px-4 py-3 font-mono text-[10px] uppercase tracking-[0.22em]">Triad</th>
          </tr>
        </thead>
        <tbody>
          {items.map((s) => (
            <tr
              key={s.number}
              className="border-b border-edge/60 transition hover:bg-raised"
            >
              <td className="px-4 py-3 font-display text-2xl text-gilt">
                {String(s.number).padStart(2, '0')}
              </td>
              <td className="px-4 py-3">
                <Link to={`/sephiroth/${s.number}`} className="link-gilt">
                  <span className="font-display text-lg text-ink">{s.name}</span>
                  <span className="ml-2 font-mono text-[10px] tracking-wider text-ink-faint">
                    {s.hebrew_name}
                  </span>
                </Link>
              </td>
              <td className="px-4 py-3 text-sm text-ink-soft">{s.planet}</td>
              <td className="px-4 py-3 text-sm text-ink-soft">{s.divine_name}</td>
              <td className="px-4 py-3 text-sm text-ink-soft">{s.archangel}</td>
              <td className="px-4 py-3">
                <div className="flex items-center gap-2">
                  <span
                    className="inline-block h-3 w-3 rounded-full border border-edge-strong"
                    style={{ backgroundColor: colorHex(s.color.king) }}
                    aria-hidden
                  />
                  <span className="text-xs capitalize text-ink-soft">
                    {s.color.king}
                  </span>
                </div>
              </td>
              <td className="px-4 py-3 text-sm text-ink-soft">{s.pillar}</td>
              <td className="px-4 py-3 text-sm text-ink-soft">{s.triad}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}