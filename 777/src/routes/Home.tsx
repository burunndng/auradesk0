import { Link } from 'react-router-dom'
import TreeDiagram from '../components/TreeDiagram'

const USAGE = [
  {
    title: 'Look up one cluster',
    body: 'Open a sphere and read its correspondences as a single, self-contained map — number, planet, color, image, figures.',
  },
  {
    title: 'Use it as a creative constraint',
    body: 'Take one sphere as a prompt set for writing or art. The same theme repeats across scale, so the constraint does the composing.',
  },
  {
    title: 'Read it as an archetypal lens',
    body: 'Use each sphere’s virtue, vice, and “why” as a mirror for a part of yourself. It is a vocabulary for inner geography, not a verdict.',
  },
  {
    title: 'Build a coherent working',
    body: 'For ritual practice, pick a sphere and let its cluster hold one theme. Constraint and repetition are what make a table more than decoration.',
  },
]

export default function Home() {
  return (
    <div className="flex flex-col gap-16">
      <section className="grid items-center gap-10 md:grid-cols-2">
        <div className="flex flex-col gap-4">
          <p className="eyebrow">A modern reference · Liber 777 (1909)</p>
<h1 className="font-display text-6xl leading-[1.05] text-ink">
            Correspondence
            <br />
            <span className="text-gilt">table for the 10 Sephiroth</span>
          </h1>
          <p className="prose-reading text-lg">
            A clean, searchable reference to the core correspondence table of
            Aleister Crowley's <em>Liber 777</em>. Ten spheres, side by side —
            planets, divine names, archangels, colors, symbols, and more.
            Read it as a map of symbolic associations, not a ritual engine and
            not scripture.
          </p>
          <Link
            to="/table"
            className="mt-2 inline-flex w-fit items-center gap-2 rounded-lg border border-edge-strong bg-raised px-5 py-3 text-sm text-ink transition hover:border-gilt/60"
          >
            Open the correspondence table →
          </Link>
        </div>
        <div className="mx-auto w-full max-w-[340px]">
          <TreeDiagram className="w-full" />
        </div>
      </section>

      <section className="mx-auto flex max-w-reading flex-col gap-4">
        <h2 className="font-display text-3xl text-ink">Why it’s useful</h2>
        <p className="prose-reading">
          A correspondence table is a <em>compression algorithm for meaning</em>.
          Across two millennia it accumulated semantic thickness — enough that
          generations found it workable to keep. It gives four things intuition
          alone cannot: <strong>constraint</strong>,{' '}
          <strong>repetition across scale</strong>,{' '}
          <strong>cognitive saturation</strong>, and{' '}
          <strong>memory stability</strong> — a lattice you can internalize for
          good.
        </p>
        <p className="prose-reading">
          Because it is a shared, inherited table, it behaves like a{' '}
          <em>Schelling point for the imagination</em>: strangers converge on one
          symbolic field precisely because it is given and ancient, not anyone’s
          private language. Used as <em>backbone</em> rather than a total system,
          it holds a working’s architecture while your own experience carries its
          charge.
        </p>
        <p className="prose-reading text-ink-faint">
          Honest caveat: the lattice is old enough to feel inevitable, but the
          letter–Tarot mappings are largely nineteenth-century constructions, and
          its survival reflects print culture and taste as much as efficacy. A web
          wired this richly is also a superb instrument for apophenia — seeing
          confirmation everywhere. Hold that alongside the usefulness.
        </p>
      </section>

      <section className="mx-auto flex max-w-reading flex-col gap-4">
        <h2 className="font-display text-3xl text-ink">How to use it</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          {USAGE.map((u) => (
            <div
              key={u.title}
              className="rounded-lg border border-edge bg-surface/60 p-4"
            >
              <h3 className="font-display text-xl text-ink">{u.title}</h3>
              <p className="mt-1 text-sm text-ink-soft">{u.body}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="mx-auto flex max-w-reading flex-col gap-4">
        <h2 className="font-display text-3xl text-ink">On this reference</h2>
          <p className="prose-reading">
          <strong>Scope.</strong> Only the ten Sephiroth of the Tree of Life —
          no paths, no full 777 columns. Each sphere carries the standard
          correspondences (planet, divine name, archangel, angelic order,
          color, symbols, the four pip cards of the Tarot) and a short
          psychological and creative gloss. The <Link to="/table" className="link-gilt text-ink-soft hover:text-ink">correspondence table</Link> shows all ten side by side.
        </p>
        <p className="prose-reading">
          <strong>Sources.</strong> The correspondences follow Crowley’s{' '}
          <em>Liber 777</em> (1909) and the standard Golden Dawn schema. The
          framing, modern notes, and layout are a contemporary re-reading —
          Crowley is seed data, not scripture. Where the tradition is shaky
          (letter–Tarot mappings are largely nineteenth-century construction),
          the marginalia say so.
        </p>
        <p className="prose-reading">
          <strong>How to read an entry.</strong> Open a sphere and read straight
          through — name, divine name, archangel, then the correspondences, then
          the why and the how-to-use. The pillar and triad chips at the top of
          each entry cross-link to the other spheres in the same structural
          group.
        </p>
      </section>
    </div>
  )
}
