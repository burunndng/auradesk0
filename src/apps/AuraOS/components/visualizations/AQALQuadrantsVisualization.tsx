"use client"

import { useState, useRef, useCallback, useEffect, useMemo } from "react"
import { Canvas, useFrame, useThree } from "@react-three/fiber"
import { OrbitControls } from "@react-three/drei"
import { EffectComposer, Bloom, Vignette, ChromaticAberration } from "@react-three/postprocessing"
import { BlendFunction } from "postprocessing"
import * as THREE from "three"
import { X, RotateCcw, Maximize2 } from "lucide-react"
import { useResponsive } from "../../hooks/useResponsive"

// ============================================================================
// AQAL Quadrants Data
// ============================================================================

const AQAL_QUADRANTS = [
  {
    name: "I",
    fullName: "Interior-Individual",
    subtitle: "Subjective",
    colorHex: 0x60a5fa,
    color: new THREE.Color(0x60a5fa),
    description: "Your inner thoughts, feelings, consciousness, and subjective experience.",
    examples: ["Meditation", "Self-reflection", "Emotions", "Beliefs", "Intentions"],
    thetaStart: Math.PI / 2,
    thetaLength: Math.PI / 2,
  },
  {
    name: "IT",
    fullName: "Exterior-Individual",
    subtitle: "Objective",
    colorHex: 0xfbbf24,
    color: new THREE.Color(0xfbbf24),
    description: "Observable behaviors, physical body, brain states, and measurable actions.",
    examples: ["Exercise", "Behavior", "Brain activity", "Physical health", "Skills"],
    thetaStart: 0,
    thetaLength: Math.PI / 2,
  },
  {
    name: "WE",
    fullName: "Interior-Collective",
    subtitle: "Intersubjective",
    colorHex: 0x34d399,
    color: new THREE.Color(0x34d399),
    description: "Shared values, culture, relationships, and collective consciousness.",
    examples: ["Community", "Relationships", "Shared meaning", "Culture", "Ethics"],
    thetaStart: Math.PI,
    thetaLength: Math.PI / 2,
  },
  {
    name: "ITS",
    fullName: "Exterior-Collective",
    subtitle: "Interobjective",
    colorHex: 0xf87171,
    color: new THREE.Color(0xf87171),
    description: "Systems, structures, environment, and collective behaviors.",
    examples: ["Social systems", "Technology", "Environment", "Infrastructure", "Ecology"],
    thetaStart: -Math.PI / 2,
    thetaLength: Math.PI / 2,
  },
]

// ============================================================================
// Custom Shader
// ============================================================================

const quadrantVertexShader = `
  varying vec3 vNormal;
  varying vec3 vPosition;
  varying vec2 vUv;
  void main() {
    vNormal = normalize(normalMatrix * normal);
    vPosition = position;
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`

const quadrantFragmentShader = `
  uniform vec3 uColor;
  uniform float uTime;
  uniform float uHovered;
  uniform float uOpacity;
  varying vec3 vNormal;
  varying vec3 vPosition;
  varying vec2 vUv;
  void main() {
    vec3 viewDirection = normalize(cameraPosition - vPosition);
    float fresnel = pow(1.0 - abs(dot(viewDirection, vNormal)), 3.0);
    float pulse = sin(uTime * 2.0) * 0.15 + 0.85;
    float flow = sin(vUv.x * 10.0 + uTime * 3.0) * sin(vUv.y * 10.0 - uTime * 2.0) * 0.1;
    vec3 glowColor = uColor * (1.0 + fresnel * 2.0 + flow);
    float alpha = (0.3 + fresnel * 0.5 + uHovered * 0.3) * pulse * uOpacity;
    gl_FragColor = vec4(glowColor, alpha);
  }
`

// ============================================================================
// Scene Sub-components
// ============================================================================

const QUADRANT_RADIUS = 12
const QUADRANT_HEIGHT = 3

type QuadrantDef = typeof AQAL_QUADRANTS[number]

interface QuadrantSegmentProps {
  quadrant: QuadrantDef
  onSelect: () => void
  onHoverChange: (name: string | null) => void
}

function QuadrantSegment({ quadrant, onSelect, onHoverChange }: QuadrantSegmentProps) {
  const matRef = useRef<THREE.ShaderMaterial>(null)
  const hoveredRef = useRef(false)

  const uniforms = useMemo(() => ({
    uColor: { value: quadrant.color.clone() },
    uTime: { value: 0 },
    uHovered: { value: 0 },
    uOpacity: { value: 1.0 },
  }), [quadrant.color])

  useFrame((_, delta) => {
    if (!matRef.current) return
    matRef.current.uniforms.uTime.value += delta
    const target = hoveredRef.current ? 1 : 0
    matRef.current.uniforms.uHovered.value +=
      (target - matRef.current.uniforms.uHovered.value) * 0.1
  })

  return (
    <group>
      {/* Main segment */}
      <mesh
        rotation={[Math.PI / 2, 0, 0]}
        onPointerOver={(e) => { e.stopPropagation(); hoveredRef.current = true; onHoverChange(quadrant.name) }}
        onPointerOut={() => { hoveredRef.current = false; onHoverChange(null) }}
        onClick={(e) => { e.stopPropagation(); onSelect() }}
      >
        <cylinderGeometry args={[QUADRANT_RADIUS, QUADRANT_RADIUS, QUADRANT_HEIGHT, 32, 1, false, quadrant.thetaStart, quadrant.thetaLength]} />
        <shaderMaterial
          ref={matRef}
          uniforms={uniforms}
          vertexShader={quadrantVertexShader}
          fragmentShader={quadrantFragmentShader}
          transparent
          side={THREE.DoubleSide}
          depthWrite={false}
        />
      </mesh>

      {/* Top edge glow */}
      <mesh
        rotation={[Math.PI / 2, 0, quadrant.thetaStart]}
        position={[0, QUADRANT_HEIGHT / 2 + 0.1, 0]}
      >
        <torusGeometry args={[QUADRANT_RADIUS, 0.05, 8, 64, quadrant.thetaLength]} />
        <meshBasicMaterial color={quadrant.colorHex} transparent opacity={0.8} />
      </mesh>

      {/* Bottom edge glow */}
      <mesh
        rotation={[Math.PI / 2, 0, quadrant.thetaStart]}
        position={[0, -QUADRANT_HEIGHT / 2 - 0.1, 0]}
      >
        <torusGeometry args={[QUADRANT_RADIUS, 0.05, 8, 64, quadrant.thetaLength]} />
        <meshBasicMaterial color={quadrant.colorHex} transparent opacity={0.8} />
      </mesh>
    </group>
  )
}

function StarField() {
  const starsRef = useRef<THREE.Points>(null)
  const COUNT = 12000

  const geometry = useMemo(() => {
    const geo = new THREE.BufferGeometry()
    const positions = new Float32Array(COUNT * 3)
    const colors = new Float32Array(COUNT * 3)

    for (let i = 0; i < COUNT; i++) {
      const radius = 80 + Math.random() * 400
      const theta = Math.random() * Math.PI * 2
      const phi = Math.acos(2 * Math.random() - 1)
      positions[i * 3]     = radius * Math.sin(phi) * Math.cos(theta)
      positions[i * 3 + 1] = radius * Math.sin(phi) * Math.sin(theta)
      positions[i * 3 + 2] = radius * Math.cos(phi)

      const c = new THREE.Color().setHSL(Math.random() * 0.1 + 0.55, 0.3, 0.7 + Math.random() * 0.3)
      colors[i * 3] = c.r; colors[i * 3 + 1] = c.g; colors[i * 3 + 2] = c.b
    }

    geo.setAttribute("position", new THREE.BufferAttribute(positions, 3))
    geo.setAttribute("color", new THREE.BufferAttribute(colors, 3))
    return geo
  }, [])

  useFrame(() => {
    if (!starsRef.current) return
    starsRef.current.rotation.y += 0.00008
    starsRef.current.rotation.x += 0.00003
  })

  return (
    <points ref={starsRef} geometry={geometry}>
      <pointsMaterial size={1.2} vertexColors transparent opacity={0.9} sizeAttenuation />
    </points>
  )
}

function CentralSphere() {
  const coreRef = useRef<THREE.Mesh>(null)
  const glowRef = useRef<THREE.Mesh>(null)
  const ringsRef = useRef<THREE.Mesh[]>([])
  const timeRef = useRef(0)

  useFrame((_, delta) => {
    timeRef.current += delta
    if (coreRef.current) {
      coreRef.current.rotation.y += 0.005
      coreRef.current.rotation.x = Math.sin(timeRef.current * 0.5) * 0.1
    }
    if (glowRef.current) {
      glowRef.current.scale.setScalar(1 + Math.sin(timeRef.current * 2) * 0.05)
    }
    ringsRef.current.forEach((ring, i) => {
      ring.rotation.x += 0.002 * (i + 1)
      ring.rotation.y += 0.003 * (i + 1)
    })
  })

  return (
    <group>
      <mesh ref={coreRef}>
        <icosahedronGeometry args={[1.5, 3]} />
        <meshBasicMaterial color={0xffffff} transparent opacity={0.9} />
      </mesh>
      <mesh ref={glowRef}>
        <icosahedronGeometry args={[2, 3]} />
        <meshBasicMaterial color={0x88ccff} transparent opacity={0.3} side={THREE.BackSide} />
      </mesh>
      {[
        { rx: Math.PI / 2, ry: 0, rz: 0 },
        { rx: 0, ry: Math.PI / 2, rz: 0 },
        { rx: Math.PI / 4, ry: 0, rz: Math.PI / 4 },
      ].map((rot, i) => (
        <mesh
          key={i}
          ref={(el) => { if (el) ringsRef.current[i] = el }}
          rotation={[rot.rx, rot.ry, rot.rz]}
        >
          <torusGeometry args={[3, 0.08, 16, 100]} />
          <meshBasicMaterial color={0xffffff} transparent opacity={0.6} />
        </mesh>
      ))}
    </group>
  )
}

function EnergyParticles({ isMobile }: { isMobile: boolean }) {
  const pointsRef = useRef<THREE.Points>(null)
  const COUNT = isMobile ? 1000 : 2000
  const timeRef = useRef(0)
  // Pre-computed per-particle orbital state — avoids atan2 + sqrt every frame
  const anglesRef = useRef<Float32Array>(new Float32Array(0))
  const radiiRef  = useRef<Float32Array>(new Float32Array(0))

  const geometry = useMemo(() => {
    const geo = new THREE.BufferGeometry()
    const positions = new Float32Array(COUNT * 3)
    const colors    = new Float32Array(COUNT * 3)
    const angles    = new Float32Array(COUNT)
    const radii     = new Float32Array(COUNT)

    for (let i = 0; i < COUNT; i++) {
      const angle  = Math.random() * Math.PI * 2
      const radius = 8 + Math.random() * 4
      angles[i] = angle
      radii[i]  = radius
      positions[i * 3]     = Math.cos(angle) * radius
      positions[i * 3 + 1] = (Math.random() - 0.5) * 6
      positions[i * 3 + 2] = Math.sin(angle) * radius

      const qi = Math.floor((angle + Math.PI) / (Math.PI / 2)) % 4
      const c = AQAL_QUADRANTS[qi].color
      colors[i * 3] = c.r; colors[i * 3 + 1] = c.g; colors[i * 3 + 2] = c.b
    }

    anglesRef.current = angles
    radiiRef.current  = radii
    geo.setAttribute("position", new THREE.BufferAttribute(positions, 3))
    geo.setAttribute("color",    new THREE.BufferAttribute(colors, 3))
    return geo
  }, [COUNT])

  useFrame((_, delta) => {
    if (!pointsRef.current) return
    timeRef.current += delta
    const positions = pointsRef.current.geometry.attributes.position.array as Float32Array
    const angles    = anglesRef.current
    const radii     = radiiRef.current
    const t         = timeRef.current

    for (let i = 0; i < COUNT; i++) {
      angles[i] += 0.003
      const a = angles[i]
      const r = radii[i]
      positions[i * 3]     = Math.cos(a) * r
      positions[i * 3 + 2] = Math.sin(a) * r
      positions[i * 3 + 1] += Math.sin(t * 2 + i) * 0.01
      if (positions[i * 3 + 1] > 3)  positions[i * 3 + 1] = -3
      if (positions[i * 3 + 1] < -3) positions[i * 3 + 1] = 3
    }

    pointsRef.current.geometry.attributes.position.needsUpdate = true
  })

  return (
    <points ref={pointsRef} geometry={geometry}>
      <pointsMaterial
        size={0.15}
        vertexColors
        transparent
        opacity={0.8}
        blending={THREE.AdditiveBlending}
        depthWrite={false}
      />
    </points>
  )
}

function ConnectionLines() {
  const lineObjects = useMemo(() => {
    const connections: [number, number][] = [[0, 1], [1, 3], [3, 2], [2, 0]]
    const mat = new THREE.LineBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.15 })

    return connections.map(([fi, ti]) => {
      const fromAngle = AQAL_QUADRANTS[fi].thetaStart + Math.PI / 4
      const toAngle   = AQAL_QUADRANTS[ti].thetaStart + Math.PI / 4
      const curve = new THREE.QuadraticBezierCurve3(
        new THREE.Vector3(Math.cos(fromAngle) * 10, 0, Math.sin(fromAngle) * 10),
        new THREE.Vector3(0, 2, 0),
        new THREE.Vector3(Math.cos(toAngle) * 10, 0, Math.sin(toAngle) * 10),
      )
      return new THREE.Line(new THREE.BufferGeometry().setFromPoints(curve.getPoints(50)), mat.clone())
    })
  }, [])

  return <>{lineObjects.map((obj, i) => <primitive key={i} object={obj} />)}</>
}

function AxisLines() {
  const objects = useMemo(() => {
    const mat = new THREE.LineBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.25 })
    const R = QUADRANT_RADIUS * 1.3
    return [
      new THREE.Line(new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(-R, 0, 0), new THREE.Vector3(R, 0, 0)]), mat),
      new THREE.Line(new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(0, 0, -R), new THREE.Vector3(0, 0, R)]), mat.clone()),
    ]
  }, [])

  return <>{objects.map((obj, i) => <primitive key={i} object={obj} />)}</>
}

// ============================================================================
// Main Scene (inside Canvas)
// ============================================================================

interface AQALSceneProps {
  onQuadrantClick: (q: QuadrantDef) => void
  onHoverChange: (name: string | null) => void
  cameraResetRef: React.MutableRefObject<() => void>
  autoRotate: boolean
  isMobile: boolean
}

function AQALScene({ onQuadrantClick, onHoverChange, cameraResetRef, autoRotate, isMobile }: AQALSceneProps) {
  const { camera } = useThree()
  const controlsRef = useRef<import('three-stdlib').OrbitControls>(null)
  const mainGroupRef = useRef<THREE.Group>(null)
  const timeRef = useRef(0)

  // Register reset callback for external DOM button
  useEffect(() => {
    cameraResetRef.current = () => {
      camera.position.set(0, 12, 25)
      if (controlsRef.current) {
        controlsRef.current.target.set(0, 0, 0)
        controlsRef.current.update()
      }
    }
  }, [camera, cameraResetRef])

  useFrame((_, delta) => {
    timeRef.current += delta
    if (mainGroupRef.current) {
      mainGroupRef.current.rotation.y = Math.sin(timeRef.current * 0.1) * 0.03
    }
  })

  return (
    <>
      <fogExp2 attach="fog" args={[0x040810, 0.012]} />

      <ambientLight color={0x404060} intensity={0.5} />
      <pointLight color={0xffffff} intensity={2} distance={30} position={[0, 5, 0]} />
      {AQAL_QUADRANTS.map((q) => {
        const angle = q.thetaStart + q.thetaLength / 2
        return (
          <pointLight
            key={q.name}
            color={q.colorHex}
            intensity={1.5}
            distance={25}
            position={[Math.cos(angle) * QUADRANT_RADIUS * 0.7, 4, Math.sin(angle) * QUADRANT_RADIUS * 0.7]}
          />
        )
      })}

      <StarField />
      <CentralSphere />

      <group ref={mainGroupRef}>
        {AQAL_QUADRANTS.map((q) => (
          <QuadrantSegment
            key={q.name}
            quadrant={q}
            onSelect={() => onQuadrantClick(q)}
            onHoverChange={onHoverChange}
          />
        ))}
        <ConnectionLines />
        <AxisLines />
      </group>

      <EnergyParticles isMobile={isMobile} />

      <OrbitControls
        ref={controlsRef}
        enableDamping
        dampingFactor={0.05}
        minDistance={15}
        maxDistance={60}
        maxPolarAngle={Math.PI * 0.85}
        autoRotate={autoRotate}
        autoRotateSpeed={0.3}
      />
    </>
  )
}

// ============================================================================
// Info Modal
// ============================================================================

interface QuadrantModalProps {
  quadrant: QuadrantDef | null
  onClose: () => void
}

function QuadrantModal({ quadrant, onClose }: QuadrantModalProps) {
  if (!quadrant) return null
  const hexColor = `#${quadrant.colorHex.toString(16).padStart(6, "0")}`

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="absolute inset-0 bg-stone-950/80 backdrop-blur-md" />
      <div
        className="relative bg-stone-950/90 border-2 rounded-2xl p-8 max-w-lg w-full transform transition-all"
        style={{ borderColor: hexColor, boxShadow: `0 0 80px ${hexColor}40, inset 0 0 40px ${hexColor}10` }}
        onClick={(e) => e.stopPropagation()}
      >
        <button onClick={onClose} className="absolute top-4 right-4 text-white/50 hover:text-white transition-colors">
          <X className="w-6 h-6" />
        </button>
        <div className="flex items-center gap-2 mb-4">
          <div
            className="px-4 py-1.5 rounded-full text-xs font-bold tracking-widest uppercase"
            style={{ backgroundColor: `${hexColor}25`, color: hexColor, border: `1px solid ${hexColor}50`, boxShadow: `0 0 20px ${hexColor}30` }}
          >
            {quadrant.subtitle}
          </div>
        </div>
        <h2 className="text-6xl font-thin tracking-wider mb-2" style={{ color: hexColor, textShadow: `0 0 30px ${hexColor}` }}>
          {quadrant.name}
        </h2>
        <p className="text-white/50 text-sm tracking-[0.25em] uppercase mb-8">{quadrant.fullName}</p>
        <p className="text-white/90 text-lg font-light leading-relaxed mb-8">{quadrant.description}</p>
        <div>
          <h3 className="text-white/40 text-xs tracking-widest uppercase mb-4">Key Aspects</h3>
          <div className="flex flex-wrap gap-2">
            {quadrant.examples.map((ex, i) => (
              <span key={i} className="px-4 py-2 rounded-lg text-sm font-medium"
                style={{ backgroundColor: `${hexColor}15`, color: hexColor, border: `1px solid ${hexColor}30` }}>
                {ex}
              </span>
            ))}
          </div>
        </div>
        <div className="absolute inset-0 rounded-2xl pointer-events-none"
          style={{ background: `radial-gradient(circle at 30% 20%, ${hexColor}20 0%, transparent 50%)` }} />
      </div>
    </div>
  )
}

// ============================================================================
// Public Component
// ============================================================================

interface AQALQuadrantsVisualizationProps {
  onClose?: () => void
}

export const AQALQuadrantsVisualization: React.FC<AQALQuadrantsVisualizationProps> = ({ onClose }) => {
  const [selectedQuadrant, setSelectedQuadrant] = useState<QuadrantDef | null>(null)
  const [hoveredName, setHoveredName] = useState<string | null>(null)
  const [showHint, setShowHint] = useState(true)
  const [autoRotate, setAutoRotate] = useState(true)
  const [isFullscreen, setIsFullscreen] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)
  const cameraResetRef = useRef<() => void>(() => {})
  const { isMobile } = useResponsive()

  useEffect(() => {
    const t = setTimeout(() => setShowHint(false), 6000)
    return () => clearTimeout(t)
  }, [])

  const handleQuadrantClick = useCallback((q: QuadrantDef) => {
    setSelectedQuadrant(q)
    setAutoRotate(false)
  }, [])

  const handleModalClose = useCallback(() => {
    setSelectedQuadrant(null)
    setAutoRotate(true)
  }, [])

  const toggleFullscreen = useCallback(() => {
    if (!containerRef.current) return
    if (!isFullscreen) {
      containerRef.current.requestFullscreen?.()
    } else {
      document.exitFullscreen?.()
    }
    setIsFullscreen((v) => !v)
  }, [isFullscreen])

  const hoveredQuadrantDef = hoveredName ? AQAL_QUADRANTS.find((q) => q.name === hoveredName) : null

  return (
    <div
      ref={containerRef}
      className="relative w-full h-full overflow-hidden"
      style={{ background: "radial-gradient(ellipse at 50% 50%, #0c1929 0%, #060a12 40%, #020305 100%)" }}
    >
      {/* Ambient nebula layers */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: "radial-gradient(circle at 25% 30%, rgba(96,165,250,0.05) 0%, transparent 40%), radial-gradient(circle at 75% 70%, rgba(139,92,246,0.04) 0%, transparent 35%), radial-gradient(circle at 50% 100%, rgba(52,211,153,0.03) 0%, transparent 45%)",
          mixBlendMode: "screen",
        }}
      />

      {/* R3F Canvas */}
      <Canvas
        camera={{ position: [0, 12, 25], fov: 55, near: 0.1, far: 1000 }}
        gl={{ antialias: true, alpha: true, powerPreference: "high-performance", toneMapping: THREE.ACESFilmicToneMapping, toneMappingExposure: 1.4 }}
        style={{ width: "100%", height: "100%" }}
        onPointerMissed={() => setHoveredName(null)}
      >
        <AQALScene
          onQuadrantClick={handleQuadrantClick}
          onHoverChange={setHoveredName}
          cameraResetRef={cameraResetRef}
          autoRotate={autoRotate}
          isMobile={isMobile}
        />
        <EffectComposer>
          <Bloom mipmapBlur luminanceThreshold={0.2} intensity={0.5} />
          <ChromaticAberration blendFunction={BlendFunction.NORMAL} offset={[0.002, 0.002]} radialModulation={false} modulationOffset={0} />
          <Vignette eskil={false} offset={0.3} darkness={0.6} />
        </EffectComposer>
      </Canvas>

      {/* Control Buttons */}
      <div className="absolute top-4 left-4 flex gap-2">
        {onClose && (
          <button onClick={onClose} className="p-2.5 bg-stone-950/50 hover:bg-stone-950/70 backdrop-blur-md border border-white/20 rounded-lg text-white/80 hover:text-white transition-all" title="Close">
            <X className="w-5 h-5" />
          </button>
        )}
        <button onClick={() => cameraResetRef.current()} className="p-2.5 bg-stone-950/50 hover:bg-stone-950/70 backdrop-blur-md border border-white/20 rounded-lg text-white/80 hover:text-white transition-all" title="Reset View">
          <RotateCcw className="w-5 h-5" />
        </button>
        <button onClick={toggleFullscreen} className="p-2.5 bg-stone-950/50 hover:bg-stone-950/70 backdrop-blur-md border border-white/20 rounded-lg text-white/80 hover:text-white transition-all" title="Toggle Fullscreen">
          <Maximize2 className="w-5 h-5" />
        </button>
      </div>

      {/* Interaction Hint */}
      {showHint && (
        <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 px-6 py-3 bg-stone-950/60 backdrop-blur-md border border-cyan-500/30 rounded-full text-white/90 text-sm flex items-center gap-2">
          <span className="animate-pulse">◉</span>
          Drag to rotate • Click quadrants to explore • Scroll to zoom
        </div>
      )}

      {/* Title */}
      <div className="absolute top-4 right-4 text-right">
        <h2 className="text-3xl md:text-4xl font-extralight tracking-[0.2em] text-white mb-1" style={{ textShadow: "0 0 30px rgba(136,204,255,0.6)" }}>
          AQAL
        </h2>
        <p className="text-white/50 text-xs tracking-[0.25em] uppercase">All Quadrants • All Levels</p>
      </div>

      {/* Hovered label */}
      {hoveredQuadrantDef && (
        <div className="absolute bottom-6 right-6 px-4 py-2 bg-stone-950/60 backdrop-blur-md border border-white/20 rounded-lg">
          <p className="text-white/90 text-sm font-medium">{hoveredQuadrantDef.fullName}</p>
          <p className="text-white/50 text-xs">{hoveredQuadrantDef.subtitle}</p>
        </div>
      )}

      {/* Legend */}
      <div className="absolute left-4 bottom-20 flex flex-col gap-2">
        {AQAL_QUADRANTS.map((q) => {
          const hex = `#${q.colorHex.toString(16).padStart(6, "0")}`
          return (
            <div
              key={q.name}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-lg transition-all cursor-pointer ${hoveredName === q.name ? "bg-white/10" : "bg-stone-950/40"}`}
              onClick={() => handleQuadrantClick(q)}
            >
              <div className="w-3 h-3 rounded-full" style={{ backgroundColor: hex, boxShadow: `0 0 8px ${hex}` }} />
              <span className="text-white/80 text-xs font-medium tracking-wide">{q.name}</span>
              <span className="text-white/40 text-xs hidden md:inline">• {q.subtitle}</span>
            </div>
          )
        })}
      </div>

      {/* Modal */}
      {selectedQuadrant && (
        <QuadrantModal quadrant={selectedQuadrant} onClose={handleModalClose} />
      )}
    </div>
  )
}

export default AQALQuadrantsVisualization
