import { sephiroth } from '../data/sephiroth'

const POS: Record<number, [number, number]> = {
  1: [200, 46],
  2: [96, 122],
  3: [304, 122],
  4: [96, 288],
  5: [304, 288],
  6: [200, 368],
  7: [96, 472],
  8: [304, 472],
  9: [200, 534],
  10: [200, 602],
}

const EDGES: [number, number][] = [
  [1, 2], [1, 3], [2, 3],
  [2, 4], [3, 5], [4, 5],
  [2, 6], [3, 6], [4, 6], [5, 6],
  [4, 7], [5, 8],
  [6, 7], [6, 8], [6, 9],
  [7, 8], [7, 9], [8, 9], [9, 10],
]

const LABEL = 'font-mono uppercase'
const LABEL_STYLE = {
  fontSize: 9,
  letterSpacing: '0.22em',
  fill: 'rgba(200,155,60,0.45)',
} as const

export default function TreeDiagram({ className = '' }: { className?: string }) {
  const r = 17
  return (
    <svg
      viewBox="0 0 400 636"
      className={className}
      role="img"
      aria-label="The Tree of Life showing the ten Sephiroth in their canonical positions"
    >
      <g stroke="rgba(200,155,60,0.16)" strokeWidth="1">
        {EDGES.map(([a, b]) => {
          const [x1, y1] = POS[a]
          const [x2, y2] = POS[b]
          return <line key={`${a}-${b}`} x1={x1} y1={y1} x2={x2} y2={y2} />
        })}
      </g>

      <text className={LABEL} style={LABEL_STYLE} x={200} y={18} textAnchor="middle">
        Equilibrium
      </text>
      <text
        className={LABEL}
        style={{ ...LABEL_STYLE, transform: 'rotate(-90 64 360)' }}
        x={64}
        y={360}
        textAnchor="middle"
      >
        Severity
      </text>
      <text
        className={LABEL}
        style={{ ...LABEL_STYLE, transform: 'rotate(90 336 360)' }}
        x={336}
        y={360}
        textAnchor="middle"
      >
        Mercy
      </text>

      {sephiroth.map((s) => {
        const [x, y] = POS[s.number]
        return (
          <g key={s.number}>
            <circle
              cx={x}
              cy={y}
              r={r}
              fill="#171310"
              stroke="rgba(200,155,60,0.42)"
              strokeWidth="1"
            />
            <text
              x={x}
              y={y - 0.5}
              textAnchor="middle"
              dominantBaseline="middle"
              className="font-mono"
              fontSize="9"
              fill="#c89b3c"
            >
              {String(s.number).padStart(2, '0')}
            </text>
            <text
              x={x}
              y={y + r + 13}
              textAnchor="middle"
              className="font-display"
              fontSize="13"
              fill="#ece3d2"
            >
              {s.name}
            </text>
          </g>
        )
      })}
    </svg>
  )
}
