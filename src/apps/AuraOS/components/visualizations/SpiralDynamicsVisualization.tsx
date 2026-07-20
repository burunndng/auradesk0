"use client"

import { useEffect, useRef, useState } from "react"
import * as THREE from "three"
import { X } from "lucide-react"

// ============================================================================
// Spiral Dynamics Data
// ============================================================================

const SPIRAL_DYNAMICS_STAGES = [
  {
    name: "BEIGE",
    subtitle: "Survival",
    color: 0xf5f5dc,
    tier: 1,
    description: "Basic survival instincts. Food, water, warmth, sex, and safety have priority.",
    characteristics: ["Instinctive", "Automatic", "Reflexive", "Survival-driven"],
    worldview: "A natural milieu where humans rely on instincts to survive",
  },
  {
    name: "PURPLE",
    subtitle: "Tribal",
    color: 0x9932cc,
    tier: 1,
    description: "Magical, animistic thinking. Loyalty to tribe, chief, ancestors, and clan.",
    characteristics: ["Magical", "Animistic", "Tribal", "Ritualistic"],
    worldview: "A threatening world full of mysterious powers and spirits",
  },
  {
    name: "RED",
    subtitle: "Power",
    color: 0xff2222,
    tier: 1,
    description: "Egocentric, exploitative, conquering. Might makes right. Impulsive and heroic.",
    characteristics: ["Egocentric", "Exploitative", "Impulsive", "Heroic"],
    worldview: "A jungle where the strongest and most cunning survive",
  },
  {
    name: "BLUE",
    subtitle: "Order",
    color: 0x2266ff,
    tier: 1,
    description: "Meaning and purpose from higher authority. Order, stability, and discipline.",
    characteristics: ["Purposeful", "Authoritarian", "Disciplined", "Moralistic"],
    worldview: "An ordered existence under control of ultimate truth",
  },
  {
    name: "ORANGE",
    subtitle: "Success",
    color: 0xff8c00,
    tier: 1,
    description: "Achievement, success, winning. Scientific, strategic, and competitive.",
    characteristics: ["Strategic", "Competitive", "Achievement-driven", "Scientific"],
    worldview: "A marketplace full of opportunities for those who can seize them",
  },
  {
    name: "GREEN",
    subtitle: "Community",
    color: 0x00cc44,
    tier: 1,
    description: "Egalitarian, consensus-seeking. Emphasis on community, equality, and feelings.",
    characteristics: ["Egalitarian", "Consensus-seeking", "Empathetic", "Relativistic"],
    worldview: "A human habitat where we share experiences and grow together",
  },
  {
    name: "YELLOW",
    subtitle: "Systemic",
    color: 0xffee00,
    tier: 2,
    description: "Integrative, systemic thinking. Flexibility, functionality, and knowledge.",
    characteristics: ["Integrative", "Systemic", "Flexible", "Autonomous"],
    worldview: "A chaordic organism where change is the norm",
  },
  {
    name: "TURQUOISE",
    subtitle: "Holistic",
    color: 0x40e0d0,
    tier: 2,
    description: "Holistic, global perspective. Collective consciousness, ecological self.",
    characteristics: ["Holistic", "Experiential", "Collective", "Ecological"],
    worldview: "An elegantly balanced system of interlocking forces",
  },
  {
    name: "CORAL",
    subtitle: "Integral",
    color: 0xff6b6b,
    tier: 2,
    description: "Emerging level. Integration of all previous stages into unified action.",
    characteristics: ["Integral", "Unified", "Transcendent", "Emergent"],
    worldview: "A conscious universe awakening to itself through form",
  },
]

const SPIRAL_COLORS = SPIRAL_DYNAMICS_STAGES.map((stage) => new THREE.Color(stage.color))

// ============================================================================
// Helper Functions
// ============================================================================

function getInterpolatedColor(t: number): THREE.Color {
  const clampedT = Math.max(0, Math.min(1, t))
  const colorIndex = clampedT * (SPIRAL_COLORS.length - 1)
  const lowerIndex = Math.floor(colorIndex)
  const upperIndex = Math.min(lowerIndex + 1, SPIRAL_COLORS.length - 1)
  const colorT = colorIndex - lowerIndex

  const lowerColor = SPIRAL_COLORS[Math.min(lowerIndex, SPIRAL_COLORS.length - 1)]
  const upperColor = SPIRAL_COLORS[upperIndex]

  return new THREE.Color().copy(lowerColor).lerp(upperColor, colorT)
}

// ============================================================================
// Stage Info Modal
// ============================================================================

function StageModal({
  stage,
  onClose,
}: {
  stage: (typeof SPIRAL_DYNAMICS_STAGES)[0] | null
  onClose: () => void
}) {
  if (!stage) return null

  const hexColor = `#${stage.color.toString(16).padStart(6, "0")}`

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div className="absolute inset-0 bg-stone-950/80 backdrop-blur-md" />

      <div
        className="relative bg-stone-950/90 border rounded-2xl p-8 max-w-lg w-full transform transition-all animate-in fade-in zoom-in-95"
        style={{ borderColor: hexColor, boxShadow: `0 0 60px ${hexColor}30` }}
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-white/50 hover:text-white transition-colors"
        >
          <X className="w-6 h-6" />
        </button>

        <div className="flex items-center gap-2 mb-4">
          <div
            className="px-3 py-1 rounded-full text-xs font-bold tracking-widest uppercase"
            style={{
              backgroundColor: `${hexColor}20`,
              color: hexColor,
              border: `1px solid ${hexColor}40`,
            }}
          >
            {stage.tier === 1 ? "First Tier" : "Second Tier"}
          </div>
        </div>

        <h2
          className="text-5xl font-thin tracking-wider mb-1"
          style={{ color: hexColor, textShadow: `0 0 20px ${hexColor}` }}
        >
          {stage.name}
        </h2>
        <p className="text-white/50 text-sm tracking-[0.2em] uppercase mb-8">
          {stage.subtitle}
        </p>

        <p className="text-white/90 text-lg font-light leading-relaxed mb-8">
          {stage.description}
        </p>

        <div className="mb-8 p-4 rounded-lg bg-white/5 border border-white/10">
          <h3 className="text-white/40 text-xs tracking-widest uppercase mb-2">Worldview</h3>
          <p className="text-white/70 italic font-serif">"{stage.worldview}"</p>
        </div>

        <div>
          <h3 className="text-white/40 text-xs tracking-widest uppercase mb-3">Characteristics</h3>
          <div className="flex flex-wrap gap-2">
            {stage.characteristics.map((char, i) => (
              <span
                key={i}
                className="px-3 py-1 rounded-md text-xs font-medium uppercase tracking-wide"
                style={{
                  backgroundColor: `${hexColor}10`,
                  color: `${hexColor}`,
                  border: `1px solid ${hexColor}20`,
                }}
              >
                {char}
              </span>
            ))}
          </div>
        </div>

        <div
          className="absolute inset-0 rounded-2xl pointer-events-none z-[-1]"
          style={{
            background: `radial-gradient(circle at top right, ${hexColor}15 0%, transparent 60%)`,
          }}
        />
      </div>
    </div>
  )
}

// ============================================================================
// Main Visualization Component
// ============================================================================

interface SpiralDynamicsVisualizationProps {
  onClose?: () => void
}

export const SpiralDynamicsVisualization: React.FC<
  SpiralDynamicsVisualizationProps
> = ({ onClose }) => {
  const mountRef = useRef<HTMLDivElement>(null)
  const [showHint, setShowHint] = useState(true)
  const [selectedStage, setSelectedStage] = useState<
    (typeof SPIRAL_DYNAMICS_STAGES)[0] | null
  >(null)

  const raycasterRef = useRef(new THREE.Raycaster())
  const mouseRef = useRef(new THREE.Vector2())
  const clickableObjectsRef = useRef<THREE.Object3D[]>([])

  useEffect(() => {
    if (!mountRef.current) return

    // Scene Setup
    const scene = new THREE.Scene()
    scene.fog = new THREE.FogExp2(0x000000, 0.008)

    const camera = new THREE.PerspectiveCamera(
      60,
      window.innerWidth / window.innerHeight,
      0.1,
      2000
    )

    const renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: true,
      powerPreference: "high-performance",
    })
    renderer.setSize(window.innerWidth, window.innerHeight)
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
    renderer.toneMapping = THREE.ACESFilmicToneMapping
    renderer.toneMappingExposure = 1.8
    mountRef.current.appendChild(renderer.domElement)

    // --- Starfield ---
    const starsGeometry = new THREE.BufferGeometry()
    const starsCount = 8000
    const starPositions = new Float32Array(starsCount * 3)
    const starColors = new Float32Array(starsCount * 3)

    for (let i = 0; i < starsCount; i++) {
      const radius = 100 + Math.random() * 800
      const theta = Math.random() * Math.PI * 2
      const phi = Math.acos(2 * Math.random() - 1)

      starPositions[i * 3] = radius * Math.sin(phi) * Math.cos(theta)
      starPositions[i * 3 + 1] = radius * Math.sin(phi) * Math.sin(theta)
      starPositions[i * 3 + 2] = radius * Math.cos(phi)

      const brightness = 0.5 + Math.random() * 0.5
      starColors[i * 3] = brightness
      starColors[i * 3 + 1] = brightness
      starColors[i * 3 + 2] = brightness
    }

    starsGeometry.setAttribute("position", new THREE.BufferAttribute(starPositions, 3))
    starsGeometry.setAttribute("color", new THREE.BufferAttribute(starColors, 3))

    const stars = new THREE.Points(
      starsGeometry,
      new THREE.PointsMaterial({
        size: 1,
        vertexColors: true,
        transparent: true,
        opacity: 0.8,
      })
    )
    scene.add(stars)

    // --- Main Helix Group ---
    const helixGroup = new THREE.Group()
    scene.add(helixGroup)

    const helixRadius = 8
    const helixHeight = 55
    const turns = 4
    const pointsPerTurn = 150
    const totalPoints = Math.floor(turns * pointsPerTurn)
    const tubeRadius = 0.4

    // Create helix strands
    function createHelixTubeStrand(phaseOffset: number) {
      const group = new THREE.Group()
      const points: THREE.Vector3[] = []

      for (let i = 0; i <= totalPoints; i++) {
        const t = i / totalPoints
        const angle = t * turns * Math.PI * 2 + phaseOffset
        const y = t * helixHeight - helixHeight / 2
        const radiusMultiplier = 1 + t * 0.2

        points.push(
          new THREE.Vector3(
            Math.cos(angle) * helixRadius * radiusMultiplier,
            y,
            Math.sin(angle) * helixRadius * radiusMultiplier
          )
        )
      }

      const curve = new THREE.CatmullRomCurve3(points)

      // Core
      const coreGeo = new THREE.TubeGeometry(curve, totalPoints, tubeRadius * 0.5, 8, false)
      const coreMat = new THREE.MeshBasicMaterial({
        color: 0xffffff,
        transparent: true,
        opacity: 0.8,
      })

      // Inner glow
      const innerGeo = new THREE.TubeGeometry(curve, totalPoints, tubeRadius, 8, false)
      const innerColors = new Float32Array(innerGeo.attributes.position.count * 3)
      const pos = innerGeo.attributes.position

      for (let i = 0; i < pos.count; i++) {
        const t = (pos.getY(i) + helixHeight / 2) / helixHeight
        const c = getInterpolatedColor(t)
        innerColors[i * 3] = c.r
        innerColors[i * 3 + 1] = c.g
        innerColors[i * 3 + 2] = c.b
      }

      innerGeo.setAttribute("color", new THREE.BufferAttribute(innerColors, 3))
      const innerMat = new THREE.MeshBasicMaterial({
        vertexColors: true,
        transparent: true,
        opacity: 0.6,
        blending: THREE.AdditiveBlending,
      })

      // Outer glow
      const outerGeo = new THREE.TubeGeometry(curve, totalPoints, tubeRadius * 2.5, 8, false)
      const outerColors = new Float32Array(outerGeo.attributes.position.count * 3)

      for (let i = 0; i < outerGeo.attributes.position.count; i++) {
        const t = (outerGeo.attributes.position.getY(i) + helixHeight / 2) / helixHeight
        const c = getInterpolatedColor(t)
        outerColors[i * 3] = c.r
        outerColors[i * 3 + 1] = c.g
        outerColors[i * 3 + 2] = c.b
      }

      outerGeo.setAttribute("color", new THREE.BufferAttribute(outerColors, 3))
      const outerMat = new THREE.MeshBasicMaterial({
        vertexColors: true,
        transparent: true,
        opacity: 0.15,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
      })

      group.add(new THREE.Mesh(coreGeo, coreMat))
      group.add(new THREE.Mesh(innerGeo, innerMat))
      group.add(new THREE.Mesh(outerGeo, outerMat))

      return { group, curve }
    }

    const strand1 = createHelixTubeStrand(0)
    const strand2 = createHelixTubeStrand(Math.PI)
    helixGroup.add(strand1.group)
    helixGroup.add(strand2.group)

    // --- Stage Orbs & Labels ---
    const clickableObjects: THREE.Object3D[] = []
    const stageOrbs: THREE.Mesh[] = []

    SPIRAL_DYNAMICS_STAGES.forEach((stage, index) => {
      const t = index / (SPIRAL_DYNAMICS_STAGES.length - 1)
      const angle = t * turns * Math.PI * 2
      const y = t * helixHeight - helixHeight / 2
      const rad = helixRadius * (1 + t * 0.2)

      const orbX = Math.cos(angle) * rad
      const orbZ = Math.sin(angle) * rad

      const group = new THREE.Group()
      group.position.set(orbX, y, orbZ)

      // Visible orb
      const orbGeo = new THREE.SphereGeometry(0.6, 32, 32)
      const orbMat = new THREE.MeshBasicMaterial({ color: stage.color })
      const orb = new THREE.Mesh(orbGeo, orbMat)
      stageOrbs.push(orb)
      group.add(orb)

      // Glow halo
      const glowGeo = new THREE.SphereGeometry(1.5, 32, 32)
      const glowMat = new THREE.MeshBasicMaterial({
        color: stage.color,
        transparent: true,
        opacity: 0.3,
        blending: THREE.AdditiveBlending,
      })
      group.add(new THREE.Mesh(glowGeo, glowMat))

      // Hit area for clicking
      const hitGeo = new THREE.SphereGeometry(3, 16, 16)
      const hitMat = new THREE.MeshBasicMaterial({ visible: false })
      const hitMesh = new THREE.Mesh(hitGeo, hitMat)
      hitMesh.userData = { stageIndex: index, type: "stageOrb" }
      clickableObjects.push(hitMesh)
      group.add(hitMesh)

      // Text label
      const canvas = document.createElement("canvas")
      canvas.width = 512
      canvas.height = 128
      const ctx = canvas.getContext("2d")!

      const hex = `#${stage.color.toString(16).padStart(6, "0")}`
      ctx.font = "bold 50px Arial"
      ctx.fillStyle = hex
      ctx.textAlign = "center"
      ctx.shadowColor = hex
      ctx.shadowBlur = 15
      ctx.fillText(stage.name, 256, 64)

      ctx.font = "30px Arial"
      ctx.fillStyle = "#ffffff"
      ctx.shadowBlur = 0
      ctx.fillText(stage.subtitle.toUpperCase(), 256, 100)

      const tex = new THREE.CanvasTexture(canvas)
      const labelMat = new THREE.SpriteMaterial({
        map: tex,
        transparent: true,
        opacity: 0.9,
      })
      const label = new THREE.Sprite(labelMat)
      label.position.set(4, 0, 0)
      label.scale.set(8, 2, 1)
      group.add(label)

      helixGroup.add(group)
    })

    clickableObjectsRef.current = clickableObjects

    // --- Lighting ---
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.5)
    scene.add(ambientLight)

    const pointLight1 = new THREE.PointLight(0xffffff, 1.5)
    pointLight1.position.set(20, 25, 20)
    scene.add(pointLight1)

    const pointLight2 = new THREE.PointLight(0x40e0d0, 0.7)
    pointLight2.position.set(-20, -15, -20)
    scene.add(pointLight2)

    camera.position.set(0, 15, 100)
    camera.lookAt(0, 0, 0)

    // --- Interaction ---
    const controls = {
      isDragging: false,
      hasMoved: false,
      prevMouse: { x: 0, y: 0 },
      theta: 0,
      phi: Math.PI / 2,
      radius: 90,
    }

    const onMouseDown = (e: MouseEvent | TouchEvent) => {
      controls.isDragging = true
      controls.hasMoved = false
      const cx =
        "touches" in e ? e.touches[0].clientX : (e as MouseEvent).clientX
      const cy =
        "touches" in e ? e.touches[0].clientY : (e as MouseEvent).clientY
      controls.prevMouse = { x: cx, y: cy }
    }

    const onMouseMove = (e: MouseEvent | TouchEvent) => {
      const cx =
        "touches" in e ? e.touches[0].clientX : (e as MouseEvent).clientX
      const cy =
        "touches" in e ? e.touches[0].clientY : (e as MouseEvent).clientY

      if (!controls.isDragging && !("touches" in e)) {
        mouseRef.current.x = (cx / window.innerWidth) * 2 - 1
        mouseRef.current.y = -(cy / window.innerHeight) * 2 + 1
        raycasterRef.current.setFromCamera(mouseRef.current, camera)
        const hits = raycasterRef.current.intersectObjects(
          clickableObjectsRef.current
        )
        renderer.domElement.style.cursor = hits.length > 0 ? "pointer" : "default"
      }

      if (controls.isDragging) {
        const dx = cx - controls.prevMouse.x
        const dy = cy - controls.prevMouse.y
        if (Math.abs(dx) > 2 || Math.abs(dy) > 2) controls.hasMoved = true

        controls.theta -= dx * 0.005
        controls.phi -= dy * 0.005
        controls.phi = Math.max(0.1, Math.min(Math.PI - 0.1, controls.phi))
        controls.prevMouse = { x: cx, y: cy }
      }
    }

    const onMouseUp = (e: MouseEvent | TouchEvent) => {
      controls.isDragging = false
      if (!controls.hasMoved) {
        const clientX =
          "changedTouches" in e
            ? e.changedTouches[0].clientX
            : (e as MouseEvent).clientX
        const clientY =
          "changedTouches" in e
            ? e.changedTouches[0].clientY
            : (e as MouseEvent).clientY

        mouseRef.current.x = (clientX / window.innerWidth) * 2 - 1
        mouseRef.current.y = -(clientY / window.innerHeight) * 2 + 1
        raycasterRef.current.setFromCamera(mouseRef.current, camera)
        const hits = raycasterRef.current.intersectObjects(
          clickableObjectsRef.current
        )
        if (hits.length > 0) {
          const idx = hits[0].object.userData.stageIndex
          setSelectedStage(SPIRAL_DYNAMICS_STAGES[idx])
        }
      }
    }

    const onWheel = (e: WheelEvent) => {
      controls.radius = Math.max(
        40,
        Math.min(150, controls.radius + e.deltaY * 0.1)
      )
    }

    // --- Animation Loop ---
    let time = 0
    let animationId: number
    const animate = () => {
      animationId = requestAnimationFrame(animate)
      time += 0.01

      if (!controls.isDragging) controls.theta += 0.001

      camera.position.x =
        controls.radius *
        Math.sin(controls.phi) *
        Math.sin(controls.theta)
      camera.position.y = controls.radius * Math.cos(controls.phi)
      camera.position.z =
        controls.radius *
        Math.sin(controls.phi) *
        Math.cos(controls.theta)
      camera.lookAt(0, 0, 0)

      // Pulse orbs
      stageOrbs.forEach((orb, i) => {
        const s = 1 + Math.sin(time * 3 + i) * 0.1
        orb.scale.set(s, s, s)
      })

      // Rotate stars
      stars.rotation.y += 0.00004
      stars.rotation.x += 0.00002

      renderer.render(scene, camera)
    }
    animate()

    // --- Event Listeners ---
    const el = renderer.domElement
    el.addEventListener("mousedown", onMouseDown)
    el.addEventListener("mousemove", onMouseMove)
    window.addEventListener("mouseup", onMouseUp)
    el.addEventListener("touchstart", onMouseDown)
    el.addEventListener("touchmove", onMouseMove)
    el.addEventListener("touchend", onMouseUp)
    el.addEventListener("wheel", onWheel)

    const handleResize = () => {
      camera.aspect = window.innerWidth / window.innerHeight
      camera.updateProjectionMatrix()
      renderer.setSize(window.innerWidth, window.innerHeight)
    }
    window.addEventListener("resize", handleResize)

    const hintTimer = setTimeout(() => setShowHint(false), 5000)

    // --- Cleanup ---
    return () => {
      el.removeEventListener("mousedown", onMouseDown)
      el.removeEventListener("mousemove", onMouseMove)
      window.removeEventListener("mouseup", onMouseUp)
      el.removeEventListener("touchstart", onMouseDown)
      el.removeEventListener("touchmove", onMouseMove)
      el.removeEventListener("touchend", onMouseUp)
      el.removeEventListener("wheel", onWheel)
      window.removeEventListener("resize", handleResize)
      cancelAnimationFrame(animationId)

      // Comprehensive scene traversal for disposal
      scene.traverse((obj) => {
        if (obj instanceof THREE.Mesh || obj instanceof THREE.Line || obj instanceof THREE.Points || obj instanceof THREE.Sprite) {
          obj.geometry?.dispose()
          if (obj.material) {
            if (Array.isArray(obj.material)) {
              obj.material.forEach(m => {
                m.map?.dispose()
                m.dispose()
              })
            } else {
              obj.material.map?.dispose()
              obj.material.dispose()
            }
          }
        } else if (obj instanceof THREE.Light) {
          obj.dispose?.()
        }
      })

      renderer.dispose()
      renderer.forceContextLoss()
      clearTimeout(hintTimer)
      // Safe DOM clearing
      if (mountRef.current) {
        while (mountRef.current.firstChild) {
          mountRef.current.removeChild(mountRef.current.firstChild)
        }
      }

      // Null refs
      clickableObjectsRef.current = []
    }
  }, [])

  return (
    <div
      ref={mountRef}
      className="fixed inset-0 z-0 bg-stone-950 overflow-hidden select-none"
    >
      {/* Close button */}
      {onClose && (
        <button
          onClick={onClose}
          className="absolute top-8 left-8 z-20 text-white/60 hover:text-white transition-colors"
        >
          <X className="w-6 h-6" />
        </button>
      )}

      {/* Branding */}
      <div className="absolute top-8 left-8 z-10 pointer-events-none">
        <h1 className="text-white/90 text-2xl font-thin tracking-[0.4em] uppercase drop-shadow-lg">
          Spiral Dynamics
        </h1>
        <p className="text-white/40 text-xs font-light tracking-[0.3em] mt-1 ml-1">
          Consciousness Evolution Map
        </p>
      </div>

      {/* Helper text */}
      {showHint && (
        <div className="absolute bottom-8 right-8 z-10 text-white/30 text-sm font-light tracking-widest animate-pulse pointer-events-none">
          DRAG TO ROTATE • CLICK NODES TO EXPLORE
        </div>
      )}

      {/* Modal */}
      <StageModal stage={selectedStage} onClose={() => setSelectedStage(null)} />
    </div>
  )
}
