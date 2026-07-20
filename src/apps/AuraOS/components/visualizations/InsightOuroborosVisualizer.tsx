import React, { useRef, useState, useEffect, useMemo } from 'react';
import { Canvas, useFrame, useThree, invalidate } from '@react-three/fiber';
import { OrbitControls, Html, PerformanceMonitor } from '@react-three/drei';
import { EffectComposer, Bloom } from '@react-three/postprocessing';
import * as THREE from 'three';
import gsap from 'gsap';
import { INSIGHT_OUROBOROS_STAGES, getOuroborosStageByNumber } from '../../services/insightOuroborosService';
import OuroborosKeyIcon from './SacredGeometryIcons/OuroborosKeyIcon';

// ─── Color palette — OKLCH-calibrated jewel tones ─────────────────────────────
const STAGE_COLORS: Record<number, { base: string; emissive: string }> = {
  1:  { base: '#1a2a3a', emissive: '#5090d0' },
  2:  { base: '#162436', emissive: '#4080c0' },
  3:  { base: '#121e30', emissive: '#3070b0' },
  4:  { base: '#0e1828', emissive: '#2860a0' },
  5:  { base: '#2e1e0e', emissive: '#c07a30' },
  6:  { base: '#321e10', emissive: '#d08840' },
  7:  { base: '#2a0e0e', emissive: '#b03030' },
  8:  { base: '#240e0e', emissive: '#a02020' },
  9:  { base: '#241414', emissive: '#a03030' },
  10: { base: '#221818', emissive: '#904040' },
  11: { base: '#0a2226', emissive: '#20a0b8' },
  12: { base: '#0a2630', emissive: '#20b0c8' },
  13: { base: '#0a2a36', emissive: '#20c0d8' },
  14: { base: '#0a2a28', emissive: '#20b8a8' },
  15: { base: '#0a2820', emissive: '#20a890' },
  16: { base: '#1a2a08', emissive: '#60b020' },
};

const PHASE_COLORS: Record<string, string> = {
  'Pre-Vipassana':    '#3a6a9a',
  'Vipassana Begins': '#8a5a2a',
  'Dark Night':       '#7a2222',
  'High Equanimity':  '#1a7070',
};

// ─── Ouroboros path ─────────────────────────────────────────────────────────────
function buildOuroborosPath(): THREE.CatmullRomCurve3 {
  const pts: THREE.Vector3[] = [];
  for (let i = 0; i < 120; i++) {
    const a = (i / 120) * Math.PI * 2;
    pts.push(new THREE.Vector3(Math.cos(a) * 12, 0, Math.sin(a) * 12));
  }
  return new THREE.CatmullRomCurve3(pts, true);
}

// ─── Serpent shader — dark void teal ─────────────────────────────────────────
const VERT = `
  varying vec2 vUv;
  uniform float uTime;
  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;
const FRAG = `
  varying vec2 vUv;
  uniform float uTime;
  uniform vec3 uColorA;
  uniform vec3 uColorB;
  void main() {
    float band = sin(vUv.x * 40.0 + uTime * 2.0) * 0.5 + 0.5;
    vec3 col = mix(uColorA, uColorB, band);
    float emissive = 0.15 + band * 0.2;
    gl_FragColor = vec4(col * emissive, 1.0);
  }
`;

// ─── SerpentBody ────────────────────────────────────────────────────────────────
function SerpentBody({ path }: { path: THREE.CatmullRomCurve3 }) {
  const meshRef = useRef<THREE.Mesh>(null);
  const matRef = useRef<THREE.ShaderMaterial>(null);

  const geometry = useMemo(
    () => new THREE.TubeGeometry(path, 180, 0.55, 16, true),
    [path]
  );

  const uniforms = useMemo(
    () => ({
      uTime:   { value: 0 },
      uColorA: { value: new THREE.Color('#061014') },
      uColorB: { value: new THREE.Color('#1a5060') },
    }),
    []
  );

  useFrame((_, delta) => {
    if (matRef.current) {
      matRef.current.uniforms.uTime.value += delta;
    }
  });

  return (
    <mesh ref={meshRef} geometry={geometry}>
      <shaderMaterial
        ref={matRef}
        vertexShader={VERT}
        fragmentShader={FRAG}
        uniforms={uniforms}
      />
    </mesh>
  );
}

// ─── SerpentHead — serpentine form ───────────────────────────────────────────
function SerpentHead({ path }: { path: THREE.CatmullRomCurve3 }) {
  const tongueRef = useRef<THREE.Group>(null);
  const pos = useMemo(() => path.getPointAt(0.99), [path]);
  const tangent = useMemo(() => path.getTangentAt(0.99), [path]);
  const rot = useMemo(() => {
    const m = new THREE.Object3D();
    m.position.copy(pos);
    m.lookAt(pos.clone().add(tangent));
    m.rotateX(Math.PI / 2);
    return m.rotation.clone();
  }, [pos, tangent]);

  useFrame((state) => {
    if (tongueRef.current) {
      const pulse = Math.sin(state.clock.elapsedTime * 0.8) * 0.1 + 1.0;
      tongueRef.current.scale.y = pulse;
    }
    invalidate();
  });

  const darkMat = <meshStandardMaterial color="#0a2030" emissive="#2a9aaa" emissiveIntensity={0.7} metalness={0.8} roughness={0.3} />;

  return (
    <group position={pos} rotation={rot}>
      {/* Head body — wide flat triangular shape */}
      <mesh scale={[1.6, 0.8, 1.0]}>
        <sphereGeometry args={[1.1, 16, 10]} />
        {darkMat}
      </mesh>
      {/* Left eye */}
      <mesh position={[0.45, 0.2, 0.6]}>
        <sphereGeometry args={[0.18, 8, 8]} />
        <meshStandardMaterial color="#3a1a00" emissive="#c87020" emissiveIntensity={1.2} />
      </mesh>
      {/* Right eye */}
      <mesh position={[-0.45, 0.2, 0.6]}>
        <sphereGeometry args={[0.18, 8, 8]} />
        <meshStandardMaterial color="#3a1a00" emissive="#c87020" emissiveIntensity={1.2} />
      </mesh>
      {/* Tongue fork — pulses via group ref */}
      <group ref={tongueRef} position={[0, 0, 1.0]}>
        <mesh position={[0.15, 0, 0.3]} rotation={[0, 0, Math.PI * 15 / 180]}>
          <cylinderGeometry args={[0.03, 0.01, 0.6, 4]} />
          <meshStandardMaterial color="#2a0808" emissive="#801010" emissiveIntensity={0.4} />
        </mesh>
        <mesh position={[-0.15, 0, 0.3]} rotation={[0, 0, -Math.PI * 15 / 180]}>
          <cylinderGeometry args={[0.03, 0.01, 0.6, 4]} />
          <meshStandardMaterial color="#2a0808" emissive="#801010" emissiveIntensity={0.4} />
        </mesh>
      </group>
    </group>
  );
}

// ─── SerpentTail — double-tapered coil ────────────────────────────────────────
function SerpentTail({ path }: { path: THREE.CatmullRomCurve3 }) {
  const pos = useMemo(() => path.getPointAt(0.01), [path]);
  const tangent = useMemo(() => path.getTangentAt(0.01), [path]);
  const rot = useMemo(() => {
    const m = new THREE.Object3D();
    m.position.copy(pos);
    m.lookAt(pos.clone().sub(tangent));
    m.rotateX(Math.PI / 2);
    return m.rotation.clone();
  }, [pos, tangent]);

  return (
    <group position={pos} rotation={rot}>
      {/* Primary taper */}
      <mesh>
        <coneGeometry args={[0.5, 1.8, 8]} />
        <meshStandardMaterial color="#0a2030" emissive="#2a9aaa" emissiveIntensity={0.6} metalness={0.8} roughness={0.3} />
      </mesh>
      {/* Secondary narrower tip */}
      <mesh position={[0, -1.2, 0]}>
        <coneGeometry args={[0.25, 1.0, 6]} />
        <meshStandardMaterial color="#0a2030" emissive="#2a9aaa" emissiveIntensity={0.5} metalness={0.8} roughness={0.3} />
      </mesh>
    </group>
  );
}

// ─── ParticleFlow ────────────────────────────────────────────────────────────────
function ParticleFlow({ path }: { path: THREE.CatmullRomCurve3 }) {
  const COUNT = 400;
  const geoRef = useRef<THREE.BufferGeometry>(null);

  const { positions, colors, tArr, speedArr } = useMemo(() => {
    const positions = new Float32Array(COUNT * 3);
    const colors = new Float32Array(COUNT * 3);
    const tArr = new Float32Array(COUNT);
    const speedArr = new Float32Array(COUNT);

    for (let i = 0; i < COUNT; i++) {
      const t = Math.random();
      tArr[i] = t;
      const si = Math.floor(t * INSIGHT_OUROBOROS_STAGES.length);
      const phase = INSIGHT_OUROBOROS_STAGES[si]?.phase ?? 'Pre-Vipassana';
      const col = new THREE.Color(PHASE_COLORS[phase] ?? '#888');
      colors[i * 3] = col.r;
      colors[i * 3 + 1] = col.g;
      colors[i * 3 + 2] = col.b;
      speedArr[i] = si >= 4 && si < 10 ? 0.008 + Math.random() * 0.004
        : si >= 10 ? 0.003 + Math.random() * 0.002
        : 0.005 + Math.random() * 0.002;
      const p = path.getPointAt(t);
      positions[i * 3] = p.x;
      positions[i * 3 + 1] = p.y;
      positions[i * 3 + 2] = p.z;
    }
    return { positions, colors, tArr, speedArr };
  }, [path]);

  useFrame(() => {
    if (!geoRef.current) return;
    const posAttr = geoRef.current.attributes.position as THREE.BufferAttribute;
    const colAttr = geoRef.current.attributes.color as THREE.BufferAttribute;
    const posArr = posAttr.array as Float32Array;
    const colArr = colAttr.array as Float32Array;

    for (let i = 0; i < COUNT; i++) {
      tArr[i] = (tArr[i] + speedArr[i]) % 1.0;
      const p = path.getPointAt(tArr[i]);
      posArr[i * 3] = p.x; posArr[i * 3 + 1] = p.y; posArr[i * 3 + 2] = p.z;
      const si = Math.floor(tArr[i] * INSIGHT_OUROBOROS_STAGES.length);
      const phase = INSIGHT_OUROBOROS_STAGES[si]?.phase ?? 'Pre-Vipassana';
      const col = new THREE.Color(PHASE_COLORS[phase] ?? '#888');
      colArr[i * 3] = col.r; colArr[i * 3 + 1] = col.g; colArr[i * 3 + 2] = col.b;
    }
    posAttr.needsUpdate = true;
    colAttr.needsUpdate = true;
    invalidate();
  });

  return (
    <points>
      <bufferGeometry ref={geoRef}>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
        <bufferAttribute attach="attributes-color" args={[colors, 3]} />
      </bufferGeometry>
      <pointsMaterial
        vertexColors
        size={0.07}
        transparent
        opacity={0.35}
        sizeAttenuation
        blending={THREE.AdditiveBlending}
        depthWrite={false}
      />
    </points>
  );
}

// ─── StageNode ────────────────────────────────────────────────────────────────
interface StageNodeProps {
  stage: typeof INSIGHT_OUROBOROS_STAGES[0];
  index: number;
  total: number;
  path: THREE.CatmullRomCurve3;
  isSelected: boolean;
  onSelect: (n: number) => void;
}

function StageNode({ stage, index, total, path, isSelected, onSelect }: StageNodeProps) {
  const meshRef = useRef<THREE.Mesh>(null);
  // Use index/total (not index/(total-1)) so all nodes are evenly spaced around the
  // full closed loop — prevents node 1 and node 16 from overlapping at t=0/t=1
  const t = index / total;
  const pos = useMemo(() => path.getPointAt(t), [path, t]);
  const colors = STAGE_COLORS[stage.stage] ?? { base: '#0a1a20', emissive: '#1a6070' };

  useFrame((state) => {
    if (!meshRef.current) return;
    const mat = meshRef.current.material as THREE.MeshStandardMaterial;
    if (isSelected) {
      const pulse = Math.sin(state.clock.elapsedTime * 5) * 0.5 + 0.5;
      meshRef.current.scale.setScalar(1.3 + pulse * 0.15);
      mat.emissiveIntensity = 1.2 + pulse * 0.3;
    } else {
      meshRef.current.scale.setScalar(1);
      mat.emissiveIntensity = 0.8;
    }
    invalidate();
  });

  return (
    <group position={pos}>
      {/* Large invisible hit sphere — makes nodes much easier to click */}
      <mesh onClick={(e) => { e.stopPropagation(); onSelect(stage.stage); }} visible={false}>
        <sphereGeometry args={[1.4, 8, 8]} />
        <meshBasicMaterial transparent opacity={0} />
      </mesh>
      <mesh
        ref={meshRef}
        onClick={(e) => { e.stopPropagation(); onSelect(stage.stage); }}
      >
        <icosahedronGeometry args={[0.72, 2]} />
        <meshStandardMaterial
          color={colors.base}
          emissive={colors.emissive}
          emissiveIntensity={0.8}
          metalness={0.3}
          roughness={0.5}
        />
      </mesh>
      <Html
        center
        position={[0, 1.1, 0]}
        style={{ pointerEvents: 'none', userSelect: 'none' }}
        occlude={false}
      >
        <span style={{
          color: '#94a3b8',
          fontSize: '10px',
          fontWeight: 'bold',
          fontFamily: 'monospace',
          textShadow: '0 0 6px rgba(0,0,0,0.9)',
          background: 'rgba(2,6,23,0.7)',
          borderRadius: '3px',
          padding: '1px 4px',
        }}>
          {stage.stage}
        </span>
      </Html>
    </group>
  );
}

// ─── Inner Rings — three concentric sacred geometry rings ─────────────────────
function InnerRings() {
  const ring1Ref = useRef<THREE.Mesh>(null);
  const ring2Ref = useRef<THREE.Mesh>(null);
  const ring3Ref = useRef<THREE.Mesh>(null);

  useFrame((_, delta) => {
    if (ring1Ref.current) ring1Ref.current.rotation.z += delta * 0.06;
    if (ring2Ref.current) ring2Ref.current.rotation.z -= delta * 0.04;
    if (ring3Ref.current) ring3Ref.current.rotation.z += delta * 0.02;
  });

  const ringMat = (
    <meshStandardMaterial color="#0a4050" emissive="#0a4050" emissiveIntensity={0.4} />
  );

  return (
    <>
      <mesh ref={ring1Ref} rotation={[Math.PI / 2, 0, 0]} position={[0, 0.05, 0]}>
        <torusGeometry args={[2.0, 0.04, 8, 64]} />
        {ringMat}
      </mesh>
      <mesh ref={ring2Ref} rotation={[Math.PI / 2, 0, 0]} position={[0, 0, 0]}>
        <torusGeometry args={[3.0, 0.03, 8, 64]} />
        {ringMat}
      </mesh>
      <mesh ref={ring3Ref} rotation={[Math.PI / 2, 0, 0]} position={[0, -0.05, 0]}>
        <torusGeometry args={[4.2, 0.025, 8, 64]} />
        {ringMat}
      </mesh>
    </>
  );
}

// ─── CameraRig ────────────────────────────────────────────────────────────────
interface CameraRigProps {
  selectedStage: number | null;
  path: THREE.CatmullRomCurve3;
  controlsRef: React.RefObject<ReturnType<typeof OrbitControls> | null>;
}

function CameraRig({ selectedStage, path, controlsRef }: CameraRigProps) {
  const { camera } = useThree();

  useEffect(() => {
    const ctrl = controlsRef.current as unknown as { target: THREE.Vector3; update: () => void } | null;

    if (selectedStage !== null) {
      const idx = INSIGHT_OUROBOROS_STAGES.findIndex(s => s.stage === selectedStage);
      if (idx === -1) return;
      const t = idx / (INSIGHT_OUROBOROS_STAGES.length - 1);
      const stagePos = path.getPointAt(t);
      const outward = stagePos.clone().normalize().multiplyScalar(20);
      const targetCam = outward.clone().add(new THREE.Vector3(0, 5, 0));

      gsap.to(camera.position, {
        x: targetCam.x, y: targetCam.y, z: targetCam.z,
        duration: 1.2, ease: 'power2.inOut',
        onUpdate: () => { invalidate(); },
      });
      if (ctrl) {
        gsap.to(ctrl.target, {
          x: stagePos.x, y: stagePos.y, z: stagePos.z,
          duration: 1.2, ease: 'power2.inOut',
          onUpdate: () => { ctrl.update(); invalidate(); },
        });
      }
    } else {
      gsap.to(camera.position, {
        x: 0, y: 28, z: 0,
        duration: 1.2, ease: 'power2.inOut',
        onUpdate: () => { invalidate(); },
      });
      if (ctrl) {
        gsap.to(ctrl.target, {
          x: 0, y: 0, z: 0,
          duration: 1.2, ease: 'power2.inOut',
          onUpdate: () => { ctrl.update(); invalidate(); },
        });
      }
    }
  }, [selectedStage, path, camera, controlsRef]);

  return null;
}

// ─── OuroborosScene ──────────────────────────────────────────────────────────
interface SceneProps {
  selectedStage: number | null;
  onSelectStage: (n: number | null) => void;
  path: THREE.CatmullRomCurve3;
  controlsRef: React.RefObject<ReturnType<typeof OrbitControls> | null>;
}

function OuroborosScene({ selectedStage, onSelectStage, path, controlsRef }: SceneProps) {
  return (
    <>
      <fog attach="fog" args={['#020617', 20, 60]} />
      <ambientLight intensity={0.12} color="#c9b9e8" />
      <directionalLight position={[30, 40, 30]} intensity={0.22} color="#8ab8e1" />
      <directionalLight position={[-20, 20, -30]} intensity={0.18} color="#8ab8e1" />

      <group onClick={(e) => { if (e.object.type === 'Mesh' && e.eventObject === e.object) return; onSelectStage(null); }}>
        <SerpentBody path={path} />
        <SerpentHead path={path} />
        <SerpentTail path={path} />
        <InnerRings />
        <ParticleFlow path={path} />

        {INSIGHT_OUROBOROS_STAGES.map((stage, i) => (
          <StageNode
            key={stage.stage}
            stage={stage}
            index={i}
            total={INSIGHT_OUROBOROS_STAGES.length}
            path={path}
            isSelected={selectedStage === stage.stage}
            onSelect={(n) => onSelectStage(n === selectedStage ? null : n)}
          />
        ))}
      </group>

      <CameraRig selectedStage={selectedStage} path={path} controlsRef={controlsRef} />

      <OrbitControls
        ref={controlsRef as React.RefObject<typeof OrbitControls>}
        enableDamping
        dampingFactor={0.05}
        minDistance={14}
        maxDistance={55}
        maxPolarAngle={Math.PI / 2.2}
        makeDefault
      />

      <EffectComposer>
        <Bloom luminanceThreshold={0.3} intensity={1.2} mipmapBlur />
      </EffectComposer>
    </>
  );
}

// ─── InfoPanel — glassmorphism + Cormorant Garamond ───────────────────────────
function InfoPanel({ selectedStage }: { selectedStage: number | null }) {
  if (!selectedStage) {
    return (
      <div className="border border-dashed border-stone-700/50 rounded-2xl p-4 flex items-center justify-center text-stone-500 text-center text-sm min-h-[120px]">
        <p>Click a stage node to explore</p>
      </div>
    );
  }

  const stage = getOuroborosStageByNumber(selectedStage);
  if (!stage) return null;

  const phaseColor = PHASE_COLORS[stage.phase] ?? '#666';

  return (
    <div className="bg-stone-900/75 backdrop-blur-md border border-stone-700/30 rounded-2xl p-5 animate-fade-in">
      <div className="space-y-3">
        <div className="flex items-start gap-3">
          <OuroborosKeyIcon size={20} className="text-amber-400/70 flex-shrink-0 mt-1" />
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: phaseColor }} />
              <span className="text-xs text-stone-500 font-mono">{stage.phase}</span>
              <span className="text-xs text-stone-600 font-mono ml-auto">#{stage.stage}</span>
            </div>
            <h4
              className="text-xl font-semibold tracking-wide text-stone-100"
              style={{ fontFamily: "'Cormorant Garamond', serif" }}
            >
              {stage.name}
            </h4>
          </div>
        </div>

        {stage.description && (
          <div className="pt-2 border-t border-stone-800/60">
            <p className="text-sm text-slate-300 leading-relaxed">{stage.description}</p>
          </div>
        )}

        {stage.keyMarkers && stage.keyMarkers.length > 0 && (
          <div className="pt-2 border-t border-stone-800/60">
            <p className="text-xs font-mono text-amber-500/70 mb-2">Markers</p>
            <ul className="space-y-1">
              {stage.keyMarkers.map((marker, idx) => (
                <li key={idx} className="text-xs text-slate-400 list-disc list-inside pl-2">{marker}</li>
              ))}
            </ul>
          </div>
        )}

        {stage.duration && (
          <div className="pt-2 border-t border-stone-800/60">
            <p className="text-xs text-stone-500">{stage.duration}</p>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Root export ─────────────────────────────────────────────────────────────
interface InsightOuroborosVisualizerProps {
  selectedStage?: number | null;
  onSelectStage?: (stage: number) => void;
}

export default function InsightOuroborosVisualizer({
  selectedStage: externalSelectedStage,
  onSelectStage: externalOnSelectStage,
}: InsightOuroborosVisualizerProps = {}) {
  const [selectedStage, setSelectedStage] = useState<number | null>(externalSelectedStage ?? null);
  const [dpr, setDpr] = useState(1.5);
  const controlsRef = useRef<ReturnType<typeof OrbitControls> | null>(null);
  const path = useMemo(() => buildOuroborosPath(), []);

  const handleSelect = (n: number | null) => {
    setSelectedStage(n);
    if (n !== null) externalOnSelectStage?.(n);
  };

  return (
    <div className="w-full h-screen flex flex-col overflow-hidden">
      <div className="flex-shrink-0 text-center space-y-1 p-4">
        <h3 className="text-3xl font-bold text-slate-100">The Insight Ouroboros</h3>
        <p className="text-sm text-slate-500">A serpent biting its tail — 16 stages of insight in one sacred circle. Click any stage to explore.</p>
      </div>

      {/* Scrollable content area */}
      <div className="flex-1 overflow-y-auto px-4 pb-4 space-y-4">
        {/* Canvas */}
        <div className="w-full h-[360px] rounded-xl overflow-hidden border border-stone-800/50 bg-[#020617] flex-shrink-0">
        <Canvas
          frameloop="demand"
          dpr={dpr}
          camera={{ position: [0, 28, 0], fov: 60, near: 0.1, far: 1000 }}
          gl={{ antialias: true, toneMapping: THREE.ACESFilmicToneMapping, toneMappingExposure: 1.2 }}
          onPointerMissed={() => handleSelect(null)}
        >
          <PerformanceMonitor
            onDecline={() => setDpr(0.75)}
            onIncline={() => setDpr(Math.min(dpr + 0.25, 2))}
          >
            <OuroborosScene
              selectedStage={selectedStage}
              onSelectStage={handleSelect}
              path={path}
              controlsRef={controlsRef}
            />
          </PerformanceMonitor>
        </Canvas>
        </div>

        {/* Info panel */}
        <InfoPanel selectedStage={selectedStage} />

        {/* Phase legend */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {Object.entries(PHASE_COLORS).map(([phase, color]) => (
            <div key={phase} className="flex items-center gap-2 text-xs p-2 rounded-lg bg-stone-900/40 backdrop-blur-sm border border-stone-800/50">
              <div className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ backgroundColor: color }} />
              <span className="text-stone-400 truncate">{phase}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
