const NAME_TO_HEX: Record<string, string> = {
  white: '#ffffff',
  'white brilliance': '#f3f1e9',
  grey: '#8c8c8c',
  'soft blue': '#aac4e0',
  black: '#141414',
  crimson: '#7a263a',
  blue: '#2f4d8a',
  'deep violet': '#3b2f63',
  'scarlet red': '#b21f2d',
  red: '#c0392b',
  yellow: '#e3c12b',
  gold: '#c9a227',
  'emerald green': '#1f8a5b',
  green: '#2e9e63',
  orange: '#d98026',
  russet: '#8a5a2b',
  violet: '#5b3a8a',
  indigo: '#2e2a6b',
  citrine: '#c9b458',
  'olive / russet / black': '#6b6334',
  olive: '#6b6334',
}

export function colorHex(name: string): string {
  return NAME_TO_HEX[name.trim().toLowerCase()] ?? '#777777'
}

export default function ColorSwatch({
  king,
  queen,
}: {
  king: string
  queen: string
}) {
  return (
    <div className="flex items-center gap-3">
      <span
        className="inline-block h-9 w-9 rounded-full border border-edge-strong"
        style={{ backgroundColor: colorHex(king) }}
        aria-hidden
      />
      <div className="leading-tight">
        <div className="text-sm text-ink capitalize">{king}</div>
        <div className="text-xs text-ink-faint capitalize">
          queen · {queen}
        </div>
      </div>
    </div>
  )
}
