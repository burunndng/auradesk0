import { Link } from 'react-router-dom'
import { sephiroth } from '../data/sephiroth'
import ColorSwatch from '../components/ColorSwatch'
import type { Sephira } from '../lib/types'

const TRIADS: {
  name: string
  slug: string
  worlds: string
  description: string
  members: [Sephira, Sephira, Sephira] | [Sephira, Sephira, Sephira, Sephira]
}[] = [
  {
    name: 'Supernal',
    slug: 'Supernal',
    worlds: 'Atziluth — Emanation',
    description:
      'The first triangle: pure will, dynamic force, and the form that receives them. This triad is the undifferentiated source — Kether seeds, Chokmah drives, Binah bounds. Everything below is a refraction.',
    members: [
      sephiroth.find((s) => s.number === 1)!,
      sephiroth.find((s) => s.number === 2)!,
      sephiroth.find((s) => s.number === 3)!,
    ],
  },
  {
    name: 'Ethical',
    slug: 'Ethical',
    worlds: 'Briah — Creation',
    description:
      'The moral and structural triangle: expansion, restraint, and the harmony between them. Chesed extends mercy, Geburah cuts with severity, Tiphareth reconciles the two at the tree’s centre.',
    members: [
      sephiroth.find((s) => s.number === 4)!,
      sephiroth.find((s) => s.number === 5)!,
      sephiroth.find((s) => s.number === 6)!,
    ],
  },
  {
    name: 'Astral',
    slug: 'Astral',
    worlds: 'Yetzirah & Assiah — Formation · Action',
    description:
      'The lower quaternary: feeling, mind, the subtle reservoir, and the material harvest. Netzach drives emotion, Hod articulates, Yesod stores the image, Malkuth makes it fact.',
    members: [
      sephiroth.find((s) => s.number === 7)!,
      sephiroth.find((s) => s.number === 8)!,
      sephiroth.find((s) => s.number === 9)!,
      sephiroth.find((s) => s.number === 10)!,
    ],
  },
]

function SphereMiniCard({ s }: { s: Sephira }) {
  return (
    <Link
      to={`/sephiroth/${s.number}`}
      className="cartouche flex flex-col gap-2 rounded-xl bg-surface/50 p-5 transition hover:bg-raised"
    >
      <div className="flex items-center justify-between">
        <span className="font-display text-4xl leading-none text-gilt">
          {String(s.number).padStart(2, '0')}
        </span>
        <ColorSwatch king={s.color.king} queen={s.color.queen} />
      </div>
      <div>
        <p className="font-display text-2xl text-ink">{s.name}</p>
        <p className="font-mono text-xs tracking-wider text-ink-faint">
          {s.hebrew_name} · {s.translit}
        </p>
      </div>
      <p className="font-mono text-xs uppercase tracking-wide text-gilt-dim">
        {s.planet}
      </p>
      <p className="text-sm text-ink-faint">Pillar of {s.pillar}</p>
    </Link>
  )
}

export default function Triads() {
  return (
    <div className="flex flex-col gap-12">
      <div className="flex flex-col gap-3">
        <p className="eyebrow">Structural groups on the Tree of Life</p>
        <h1 className="font-display text-5xl text-ink">The Three Triads</h1>
        <p className="prose-reading max-w-[50ch]">
          The ten spheres are organised into three regions — the Supernal,
          Ethical, and Astral groups — each with a distinct character and a
          shared role on the tree.
        </p>
      </div>

      {TRIADS.map((t) => (
        <section key={t.slug}>
          <div className="mb-4 flex items-baseline gap-3">
            <h2 className="font-display text-3xl text-ink">{t.name}</h2>
            <span className="font-mono text-[11px] uppercase tracking-[0.2em] text-ink-faint">
              {t.worlds}
            </span>
          </div>
          <p className="prose-reading mb-6">{t.description}</p>
          <div
            className={
              t.members.length === 4
                ? 'grid gap-4 sm:grid-cols-2 lg:grid-cols-4'
                : 'grid gap-4 sm:grid-cols-3'
            }
          >
            {t.members.map((s) => (
              <SphereMiniCard key={s.number} s={s} />
            ))}
          </div>
        </section>
      ))}

      <div className="mx-auto max-w-reading rounded-xl border border-edge p-6 text-center">
        <p className="eyebrow mb-2">Pillars across the triads</p>
        <p className="prose-reading text-sm">
          Each triad sits across the three pillars. The Pillar of Mercy
          (Chokmah, Chesed, Netzach) flows downward on the right; the Pillar of
          Severity (Binah, Geburah, Hod) on the left; the Pillar of Equilibrium
          (Kether, Tiphareth, Yesod, Malkuth) holds the centre and the foot.
        </p>
      </div>
    </div>
  )
}
