# Sacred Geometry Icons Library

A collection of mathematically precise, thematically aligned SVG icons representing alchemical, eastern esoteric, and sacred geometric concepts integrated into the AOS Tool Guide Hub.

## Icon Descriptions

### Set 1: Alchemical & Esoteric Icons

#### 1. **Hermetic Vessel Icon**
- **Concept**: Philosopher's Egg, alchemical container of the soul
- **Symbolism**: The vessel as sacred container, quintessence within
- **Use Cases**: Mind Tools, consciousness exploration, transformation
- **Visual**: Capsule with inner diamond (crystallized spirit)
- **File**: `HermeticVesselIcon.tsx`

```tsx
import { HermeticVesselIcon } from '@/components/visualizations/SacredGeometryIcons';

<HermeticVesselIcon size={64} color="rgb(59, 130, 246)" />
```

#### 2. **Sushumna Icon**
- **Concept**: Central energy channel connecting Root to Crown
- **Symbolism**: The subtle body's primary energy conduit
- **Use Cases**: Spirit Tools, chakra work, energy channels
- **Visual**: Vertical channel with three primary nodes (chakras)
- **File**: `SushumnaIcon.tsx`

```tsx
import { SushumnaIcon } from '@/components/visualizations/SacredGeometryIcons';

<SushumnaIcon size={64} color="rgb(251, 146, 60)" />
```

#### 3. **Resonator Icon**
- **Concept**: Harmonic vibration and standing waves
- **Symbolism**: Everything vibrates; resonance chamber of being
- **Use Cases**: Shadow Tools, inner vibration, frequency work
- **Visual**: Capsule with wave patterns and nodal points
- **File**: `ResonatorIcon.tsx`

```tsx
import { ResonatorIcon } from '@/components/visualizations/SacredGeometryIcons';

<ResonatorIcon size={64} color="rgb(168, 85, 247)" />
```

### Set 2: Sacred Geometry Icons

#### 4. **Tesseract Icon**
- **Concept**: 4D hypercube projection—transcendence beyond 3D perception
- **Symbolism**: Two cubes (outer/inner) connected by 4D edges, impossible geometry
- **Use Cases**: Mind Tools, transcendence, higher perspectives, abstract thought
- **Visual**: Nested cubes with connecting edges, cardinal and grounded vertices
- **File**: `TesseractIcon.tsx`

```tsx
import { TesseractIcon } from '@/components/visualizations/SacredGeometryIcons';

<TesseractIcon size={64} color="rgb(59, 130, 246)" />
```

#### 5. **Celestial Rose Icon**
- **Concept**: 12-fold cosmic order based on Gothic rose window mathematics
- **Symbolism**: Zodiacal cycles, hourly and monthly rhythms, cosmic integration
- **Use Cases**: Body Tools, cycles, wholeness, cosmic order
- **Visual**: 12 rosette circles, hexagram core, concentric rings, 30° radiants
- **File**: `CelestialRoseIcon.tsx`

```tsx
import { CelestialRoseIcon } from '@/components/visualizations/SacredGeometryIcons';

<CelestialRoseIcon size={64} color="rgb(52, 211, 153)" />
```

#### 6. **Third Eye Icon**
- **Concept**: Awakened eye as nested vesica piscis—layers of perception
- **Symbolism**: Inner vision, expanded awareness, direct knowing
- **Use Cases**: Spirit Tools, meditation, intuition, consciousness
- **Visual**: Nested vesica piscis, 8-fold iris radials, emanation rays
- **File**: `ThirdEyeIcon.tsx`

```tsx
import { ThirdEyeIcon } from '@/components/visualizations/SacredGeometryIcons';

<ThirdEyeIcon size={64} color="rgb(251, 146, 60)" />
```

## Color Integration

All icons use `currentColor` for seamless theming. Match them to your module colors:

| Module | Color | Recommended Icon | Hex |
|:---|:---|:---|:---|
| **Mind** | Blue | Tesseract | `#3b82f6` (blue-400) |
| **Shadow** | Purple | Resonator | `#a855f7` (purple-400) |
| **Body** | Emerald | Celestial Rose | `#34d399` (emerald-400) |
| **Spirit** | Amber | Third Eye | `#fb923c` (amber-400) |

## Design Specifications

### Stroke Properties
- **Default Stroke Width**: `1.2px` (scaled with viewBox)
- **Stroke Linecap**: `round`
- **Stroke Linejoin**: `round`
- **Fill**: `none` (outline style)
- **Opacity Layers**: Subtle opacity variations (0.3–0.9) for depth

### ViewBox & Sizing
- **ViewBox**: `0 0 24 24` (compact) or `0 0 100 100` (complex)
- **Responsive**: Use `size` prop to scale (default: 64px)
- **Scalability**: All icons scale cleanly from 24px to 256px+

### Mathematical Precision
- **Tesseract**: Orthographic 4D→2D projection with 16 vertices, 32 edges
- **Celestial Rose**: 12-fold rotational symmetry, 30° intervals, hexagram core
- **Third Eye**: Nested vesica piscis (golden ratio proportions), 8-fold radials
- **Sushumna**: Proportional chakra alignment, harmonic spacing
- **Resonator**: Standing wave mathematics, symmetric nodal points
- **Hermetic Vessel**: Alchemical ratios, sealed containment geometry

## Integration Points

### Tool Guide Hub
The Module Circle components use sacred geometry icons as visual anchors:

```tsx
// components/shared/ModuleCircle.tsx
const moduleIconMap = {
  mind: <TesseractIcon size={48} color="currentColor" />,
  shadow: <ResonatorIcon size={48} color="currentColor" />,
  body: <CelestialRoseIcon size={48} color="currentColor" />,
  spirit: <ThirdEyeIcon size={48} color="currentColor" />
};
```

### Custom Usage
```tsx
import {
  HermeticVesselIcon,
  SushumnaIcon,
  ResonatorIcon,
  TesseractIcon,
  CelestialRoseIcon,
  ThirdEyeIcon
} from '@/components/visualizations/SacredGeometryIcons';

// In any React component
export default function MyComponent() {
  return (
    <div className="text-blue-400">
      <TesseractIcon size={96} />
    </div>
  );
}
```

## Accessibility

- **SVG Semantics**: Proper `xmlns` and `viewBox` attributes
- **Color Independence**: Icons work in dark mode (Alchemical Void theme)
- **Contrast**: 1.2px strokes maintain legibility even at small sizes
- **Theming**: Inherit parent color via `currentColor`

## Performance

- **Lightweight**: No external dependencies, pure SVG
- **Rendering**: Minimal path calculations, optimized stroke rendering
- **Bundle Impact**: ~2-3KB per icon (gzipped)

## Design Philosophy

These icons transcend simple geometric representation:

1. **Mathematical Rigor**: Each icon is constructed from precise geometric principles (4D projection, rotational symmetry, vesica piscis proportions)

2. **Hermetic Correspondence**: They encode deep symbolic meaning:
   - Tesseract = transcendence, multidimensional thinking
   - Celestial Rose = cosmic order, wholeness
   - Third Eye = inner vision, awakening
   - Sushumna = energy ascent, spiritual channel
   - Resonator = harmonic integration, vibration
   - Hermetic Vessel = sacred containment, alchemy

3. **AOS Theme Alignment**: Stroke-based, thin-line aesthetic that complements the Alchemical Void visual identity

4. **Intentional Opacity**: Layered opacity creates depth without visual clutter

## References

- **Tesseract**: 4D geometry, orthographic projection mathematics
- **Celestial Rose**: Gothic rose window architecture, 12-fold mandala symmetry
- **Third Eye**: Vesica piscis (sacred geometry), chakra visualization
- **Sushumna**: Kundalini yoga anatomy, subtle body channels
- **Resonator**: Wave physics, standing wave resonance
- **Hermetic Vessel**: Alchemical symbolism, Philosopher's Egg

## Future Enhancements

- Animated variants (rotating tesseract, pulsing resonator, blooming rose)
- Interactive tool-finding version (click icons to filter by module)
- SVG animation library integration (Framer Motion, D3)
- Additional icons: Merkaba, Flower of Life, Torus, Ouroboros
