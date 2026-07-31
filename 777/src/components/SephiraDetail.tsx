import { Link } from 'react-router-dom'
import ColorSwatch from './ColorSwatch'
import { sephiroth } from '../data/sephiroth'
import type { Sephira } from '../lib/types'

function Field({
  label,
  numeral,
  children,
}: {
  label: string
  numeral: string
  children: React.ReactNode
}) {
  return (
    <div className="border-t border-edge py-4">
      <p className="eyebrow mb-2">
        <span className="text-gilt">{numeral}.</span> {label}
      </p>
      <div className="text-ink-soft">{children}</div>
    </div>
  )
}

function Tag({ children }: { children: React.ReactNode }) {
  return (
    <span className="inline-block rounded-full border border-edge px-3 py-1 text-xs text-ink-soft">
      {children}
    </span>
  )
}

export default function SephiraDetail({ s }: { s: Sephira }) {
  const prev = s.number > 1 ? sephiroth[s.number - 2] : undefined
  const next = s.number < 10 ? sephiroth[s.number] : undefined
  const pillarSiblings = sephiroth.filter(
    (x) => x.pillar === s.pillar && x.number !== s.number,
  )
  const triadSiblings = sephiroth.filter(
    (x) => x.triad === s.triad && x.number !== s.number,
  )

  return (
    <article className="cartouche rounded-2xl bg-surface/50 p-6 md:p-10">
      <div className="flex flex-wrap items-end justify-between gap-6">
        <div>
          <span className="font-display text-6xl leading-none text-gilt">
            {String(s.number).padStart(2, '0')}
          </span>
          <h1 className="mt-2 font-display text-5xl text-ink">{s.name}</h1>
          <p className="font-mono text-sm tracking-wider text-ink-faint">
            {s.hebrew_name} · {s.translit}
          </p>
        </div>
        <div className="text-right">
          <p className="font-mono text-xs uppercase tracking-wide text-gilt-dim">
            {s.planet}
          </p>
          <div className="mt-3 flex justify-end">
            <ColorSwatch king={s.color.king} queen={s.color.queen} />
          </div>
        </div>
      </div>

      <div className="mt-5 flex flex-wrap gap-2">
        <Tag>Pillar of {s.pillar}</Tag>
        <Link
          to="/triads"
          className="inline-block rounded-full border border-edge px-3 py-1 text-xs text-ink-soft hover:border-gilt/50"
        >
          {s.triad} Triad
        </Link>
      </div>

      <div className="mt-2 grid gap-8 md:grid-cols-[1fr_210px]">
        <div className="min-w-0">
          <Field numeral="I" label="Divine Name">
            <span className="text-ink">{s.divine_name}</span>
          </Field>
          <Field numeral="II" label="Archangel & Angelic Order">
            <span className="text-ink">{s.archangel}</span>
            <span className="mx-2 text-ink-faint">·</span>
            <span className="text-ink-soft">{s.angelic_order}</span>
          </Field>
          <Field numeral="III" label="Titles & Meaning">{s.titles}</Field>
          <Field numeral="IV" label="Symbols">{s.symbols.join(' · ')}</Field>
          <Field numeral="V" label="Tarot">{s.tarot}</Field>
          <Field numeral="VI" label="Deities & Figures">{s.deities_figures.join(' · ')}</Field>
          <Field numeral="VII" label="Virtue / Vice">
            <span className="text-ink-soft">{s.virtue}</span>
            <span className="mx-2 text-ink-faint">/</span>
            <span className="text-oxblood">{s.vice}</span>
          </Field>
          <Field numeral="VIII" label="Why this cluster exists">
            <p className="prose-reading dropcap">{s.why}</p>
          </Field>
          <Field numeral="IX" label="How to use it">
            <p className="prose-reading">{s.how_to_use}</p>
          </Field>
          <Field numeral="X" label="Source">
            <p className="text-sm text-ink-soft">{s.source.primary}</p>
            {s.source.secondary && (
              <p className="text-xs text-ink-faint">{s.source.secondary}</p>
            )}
          </Field>
        </div>

        {s.modern_note && (
          <aside className="md:sticky md:top-24 md:self-start md:pt-4">
            <p className="eyebrow mb-2">
              <span className="text-gilt">XI.</span> Marginalia
            </p>
            <p className="sidenote">{s.modern_note}</p>
          </aside>
        )}
      </div>

      <div className="mt-6 border-t border-edge pt-4">
        <p className="eyebrow mb-2">
          On the Pillar of {s.pillar}
        </p>
        <div className="flex flex-wrap gap-2">
          {pillarSiblings.map((x) => (
            <Link
              key={x.number}
              to={`/sephiroth/${x.number}`}
              className="link-gilt text-sm text-ink-soft hover:text-ink"
            >
              {x.name}
            </Link>
          ))}
        </div>
        <p className="eyebrow mb-2 mt-4">In the {s.triad} Triad</p>
        <div className="flex flex-wrap gap-2">
          {triadSiblings.map((x) => (
            <Link
              key={x.number}
              to={`/sephiroth/${x.number}`}
              className="link-gilt text-sm text-ink-soft hover:text-ink"
            >
              {x.name}
            </Link>
          ))}
        </div>
      </div>

      <nav className="no-print mt-8 flex items-center justify-between border-t border-edge pt-4 font-mono text-xs uppercase tracking-wider">
        {prev ? (
          <Link to={`/sephiroth/${prev.number}`} className="link-gilt text-ink-soft hover:text-ink">
            ← {prev.name}
          </Link>
        ) : (
          <span />
        )}
        {next ? (
          <Link to={`/sephiroth/${next.number}`} className="link-gilt text-ink-soft hover:text-ink">
            {next.name} →
          </Link>
        ) : (
          <span />
        )}
      </nav>
      <p className="mt-2 text-center font-mono text-[10px] tracking-wider text-ink-faint">
        use ← → to step through
      </p>
    </article>
  )
}
