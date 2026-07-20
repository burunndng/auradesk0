import React, { useRef, useMemo } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import { EffectComposer, Bloom, Vignette, ChromaticAberration } from '@react-three/postprocessing';
import { BlendFunction } from 'postprocessing';
import * as THREE from 'three';
import { AnimatePresence, motion } from 'framer-motion';
import { JhanaLevel } from '../../types.ts';

// ============================================================================
// Constants
// ============================================================================

// Derived from OKLCH narrative palette — warm form jhanas → pale formless jhanas
// Chroma drops from 0.17 (1st) to 0.01 (8th) encoding dissolution
const JHANA_COLORS: Record<JhanaLevel, number> = {
  'Access Concentration': 0x7a6fa8,
  'Momentary Concentration': 0x9d90c0,
  '1st Jhana': 0xd4726a,
  '2nd Jhana': 0xd4a055,
  '3rd Jhana': 0xd4c46a,
  '4th Jhana': 0x8abda0,
  '5th Jhana': 0x88bdd4,
  '6th Jhana': 0x96c4cc,
  '7th Jhana': 0xa8b8d0,
  '8th Jhana': 0xd4cce4,
};

// Form jhanas: solid (opacity 1.0). Formless: increasingly translucent.
const JHANA_SPHERE_OPACITY: Record<JhanaLevel, number> = {
  'Access Concentration': 0.85,
  'Momentary Concentration': 0.85,
  '1st Jhana': 1.0,
  '2nd Jhana': 1.0,
  '3rd Jhana': 0.95,
  '4th Jhana': 0.90,
  '5th Jhana': 0.70,
  '6th Jhana': 0.55,
  '7th Jhana': 0.40,
  '8th Jhana': 0.25,
};

// Is this a formless jhana? Used for material differentiation in later tasks.
const FORMLESS_JHANAS: Set<JhanaLevel> = new Set([
  '5th Jhana', '6th Jhana', '7th Jhana', '8th Jhana'
]);

const JHANA_DESCRIPTIONS: Record<JhanaLevel, string> = {
  'Access Concentration': 'The threshold state before jhana. Mind is collected and stable.',
  'Momentary Concentration': 'Brief moments of strong concentration during insight practice.',
  '1st Jhana': 'Sustained absorption with thinking, joy, and happiness. All five factors present.',
  '2nd Jhana': 'Thinking drops away. Stronger unification with piti and sukha. More absorbed.',
  '3rd Jhana': 'Energetic piti fades, leaving pure contentment. Equanimous happiness.',
  '4th Jhana': 'Even sukha fades into pure equanimity. Effortless absorption.',
  '5th Jhana': 'Infinite space. Mind expands beyond form to boundless space itself.',
  '6th Jhana': 'Infinite consciousness. Awareness itself becomes the object and subject.',
  '7th Jhana': 'Nothingness. The subtle sense of being dissolves into vast emptiness.',
  '8th Jhana': 'Neither-perception-nor-non-perception. The subtlest state before cessation.',
};

const JHANAS_IN_ORDER: JhanaLevel[] = [
  'Access Concentration', 'Momentary Concentration',
  '1st Jhana', '2nd Jhana', '3rd Jhana', '4th Jhana',
  '5th Jhana', '6th Jhana', '7th Jhana', '8th Jhana',
];

// ============================================================================
// Utilities
// ============================================================================

function createSpiralCurve(): THREE.CatmullRomCurve3 {
  const points: THREE.Vector3[] = [];
  for (let i = 0; i <= 200; i++) {
    const t = i / 200;
    const height = t * 20;
    const radius = 5 + t * 2;
    const angle = t * Math.PI * 8;
    points.push(new THREE.Vector3(radius * Math.cos(angle), height, radius * Math.sin(angle)));
  }
  return new THREE.CatmullRomCurve3(points);
}

// ============================================================================
// Jhana Point Mesh
// ============================================================================

interface JhanaPointMeshProps {
  jhana: JhanaLevel;
  position: THREE.Vector3;
  selectedJhana: JhanaLevel | null;
  onSelectJhana: (jhana: JhanaLevel) => void;
  animTimeRef: React.MutableRefObject<number>;
}

function JhanaPointMesh({ jhana, position, selectedJhana, onSelectJhana, animTimeRef }: JhanaPointMeshProps) {
  const meshRef = useRef<THREE.Mesh>(null);
  const isSelected = jhana === selectedJhana;
  const isFormless = FORMLESS_JHANAS.has(jhana);

  useFrame(() => {
    if (!meshRef.current) return;
    const mat = meshRef.current.material as THREE.MeshStandardMaterial;
    if (isSelected) {
      const scale = 1.2 + Math.sin(animTimeRef.current * 6) * 0.2;
      meshRef.current.scale.setScalar(scale);
      mat.emissiveIntensity = 0.8 + Math.sin(animTimeRef.current * 4) * 0.2;
    } else {
      meshRef.current.scale.setScalar(1);
      mat.emissiveIntensity = isFormless ? 0.4 : 0.45;
    }
  });

  return (
    <group position={[position.x, position.y, position.z]}>
      <mesh ref={meshRef} onClick={(e) => { e.stopPropagation(); onSelectJhana(jhana); }}>
        <icosahedronGeometry args={[0.7, 5]} />
        {isFormless ? (
          <meshPhysicalMaterial
            color={JHANA_COLORS[jhana]}
            emissive={new THREE.Color(JHANA_COLORS[jhana])}
            emissiveIntensity={0.4}
            metalness={0.1}
            roughness={0.05}
            transmission={1 - JHANA_SPHERE_OPACITY[jhana]}
            transparent
            opacity={JHANA_SPHERE_OPACITY[jhana]}
            thickness={0.5}
          />
        ) : (
          <meshStandardMaterial
            color={JHANA_COLORS[jhana]}
            emissive={new THREE.Color(JHANA_COLORS[jhana])}
            emissiveIntensity={isSelected ? 0.9 : 0.45}
            metalness={0.85}
            roughness={0.15}
          />
        )}
      </mesh>
      {/* Aura sphere — smaller for formless */}
      <mesh>
        <icosahedronGeometry args={[isFormless ? 0.85 : 1.0, 4]} />
        <meshBasicMaterial
          color={JHANA_COLORS[jhana]}
          transparent
          opacity={isFormless ? 0.08 : 0.18}
        />
      </mesh>
    </group>
  );
}

// ============================================================================
// Particle System
// ============================================================================

function ParticleSystem({ spiralCurve }: { spiralCurve: THREE.CatmullRomCurve3 }) {
  const pointsRef = useRef<THREE.Points>(null);
  const PARTICLE_COUNT = 1000;

  // Pre-compute start tangent for particle wrap-around
  const startTangent = useMemo(() => spiralCurve.getTangentAt(0).normalize(), [spiralCurve]);

  const { geometry, velocities } = useMemo(() => {
    const geo = new THREE.BufferGeometry();
    const positions = new Float32Array(PARTICLE_COUNT * 3);
    const vels = new Float32Array(PARTICLE_COUNT * 3);

    for (let i = 0; i < PARTICLE_COUNT; i++) {
      const t = Math.random();
      const pos = spiralCurve.getPointAt(t);
      const tangent = spiralCurve.getTangentAt(t).normalize();
      const speed = 0.05 + Math.random() * 0.05;

      positions[i * 3]     = pos.x + (Math.random() - 0.5) * 2;
      positions[i * 3 + 1] = pos.y + (Math.random() - 0.5) * 2;
      positions[i * 3 + 2] = pos.z + (Math.random() - 0.5) * 2;

      vels[i * 3]     = tangent.x * speed;
      vels[i * 3 + 1] = tangent.y * speed;
      vels[i * 3 + 2] = tangent.z * speed;
    }

    geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    return { geometry: geo, velocities: vels };
  }, [spiralCurve]);

  useFrame(() => {
    if (!pointsRef.current) return;
    const positions = pointsRef.current.geometry.attributes.position.array as Float32Array;

    for (let i = 0; i < PARTICLE_COUNT; i++) {
      velocities[i * 3 + 1] += 0.001; // upward draft

      positions[i * 3]     += velocities[i * 3];
      positions[i * 3 + 1] += velocities[i * 3 + 1];
      positions[i * 3 + 2] += velocities[i * 3 + 2];

      if (positions[i * 3 + 1] > 20) {
        positions[i * 3 + 1] -= 20;
        const speed = 0.05 + Math.random() * 0.05;
        velocities[i * 3]     = startTangent.x * speed;
        velocities[i * 3 + 1] = startTangent.y * speed;
        velocities[i * 3 + 2] = startTangent.z * speed;
      }
    }

    pointsRef.current.geometry.attributes.position.needsUpdate = true;
  });

  return (
    <points ref={pointsRef} geometry={geometry}>
      <pointsMaterial color={0xa8c8e1} size={0.1} transparent opacity={0.4} sizeAttenuation />
    </points>
  );
}

// ============================================================================
// Scene (inside Canvas)
// ============================================================================

interface SpiralSceneProps {
  selectedJhana: JhanaLevel | null;
  onSelectJhana: (jhana: JhanaLevel) => void;
}

function SpiralScene({ selectedJhana, onSelectJhana }: SpiralSceneProps) {
  const { camera } = useThree();
  const controlsRef = useRef<import('three-stdlib').OrbitControls>(null);
  const spiralGroupRef = useRef<THREE.Group>(null);
  const spiralMeshRef = useRef<THREE.Mesh>(null);
  const animTimeRef = useRef(0);
  const isFocusingRef = useRef(false);
  const focusTargetRef = useRef(new THREE.Vector3());

  const spiralCurve = useMemo(() => createSpiralCurve(), []);
  const tubeGeometry = useMemo(
    () => new THREE.TubeGeometry(spiralCurve, 240, 0.35, 10, false),
    [spiralCurve]
  );
  const jhanaPositions = useMemo(
    () => JHANAS_IN_ORDER.map((_, i) => spiralCurve.getPointAt(i / (JHANAS_IN_ORDER.length - 1))),
    [spiralCurve]
  );

  const handleSelectJhana = (jhana: JhanaLevel) => {
    onSelectJhana(jhana);
    const idx = JHANAS_IN_ORDER.indexOf(jhana);
    if (idx >= 0) {
      const pos = jhanaPositions[idx];
      focusTargetRef.current.set(pos.x, pos.y + 3, pos.z + 5);
      isFocusingRef.current = true;
    }
  };

  useFrame(() => {
    animTimeRef.current += 0.002;

    // Breathing + slow rotation
    if (spiralMeshRef.current && spiralGroupRef.current) {
      const breathe = 1.0 + Math.sin(animTimeRef.current * 2) * 0.02;
      spiralMeshRef.current.scale.set(breathe, 1, breathe);
      spiralGroupRef.current.rotation.y = Math.sin(animTimeRef.current * 0.3) * 0.05;
    }

    // Smooth camera focus transition
    if (isFocusingRef.current) {
      camera.position.lerp(focusTargetRef.current, 0.05);
      if (controlsRef.current) controlsRef.current.update();
      if (camera.position.distanceTo(focusTargetRef.current) < 0.15) {
        isFocusingRef.current = false;
      }
    }
  });

  return (
    <>
      <color attach="background" args={[0x0a0e27]} />
      <fog attach="fog" args={['#0a0e27', 100, 200]} />

      <ambientLight color={0xc9b9e8} intensity={0.5} />
      <directionalLight
        color={0xe8d4b8}
        intensity={0.6}
        position={[30, 40, 30]}
        castShadow
        shadow-mapSize={[2048, 2048]}
      />
      <directionalLight color={0x8ab8e1} intensity={0.3} position={[-20, 20, -30]} />
      <pointLight color={0xa8c8e1} intensity={0.2} position={[0, 30, 0]} />

      <group ref={spiralGroupRef}>
        <mesh ref={spiralMeshRef} geometry={tubeGeometry} castShadow receiveShadow>
          <meshStandardMaterial
            color={0x7a5c28}
            emissive={new THREE.Color(0x3c2c10)}
            emissiveIntensity={0.65}
            metalness={0.55}
            roughness={0.45}
            transparent
            opacity={0.80}
          />
        </mesh>

        {JHANAS_IN_ORDER.map((jhana, i) => (
          <JhanaPointMesh
            key={jhana}
            jhana={jhana}
            position={jhanaPositions[i]}
            selectedJhana={selectedJhana}
            onSelectJhana={handleSelectJhana}
            animTimeRef={animTimeRef}
          />
        ))}

        <ParticleSystem spiralCurve={spiralCurve} />
      </group>

      <OrbitControls
        ref={controlsRef}
        enableDamping
        dampingFactor={0.05}
        screenSpacePanning={false}
        minDistance={15}
        maxDistance={100}
      />
    </>
  );
}

// ============================================================================
// Public Component
// ============================================================================

interface JhanaSpiralVisualizer3DProps {
  selectedJhana: JhanaLevel | null;
  onSelectJhana: (jhana: JhanaLevel) => void;
}

export default function JhanaSpiralVisualizer3D({ selectedJhana, onSelectJhana }: JhanaSpiralVisualizer3DProps) {
  return (
    <div className="w-full space-y-4">
      <div className="text-center space-y-1">
        <h3 className="text-2xl font-bold text-slate-100">The Jhana Spiral</h3>
        <p className="text-xs text-slate-500">
          Click any point to explore that absorption state. Drag to orbit.
        </p>
      </div>

      {/* Full-width 3D canvas */}
      <div
        className="w-full rounded-xl overflow-hidden border border-slate-700/50"
        style={{ height: '52vh', minHeight: 320 }}
      >
        <Canvas
          camera={{ position: [0, 10, 35], fov: 60, near: 0.1, far: 1000 }}
          gl={{ toneMapping: THREE.ACESFilmicToneMapping, toneMappingExposure: 1.2, antialias: true }}
          shadows="basic"
          style={{ width: '100%', height: '100%' }}
        >
          <SpiralScene selectedJhana={selectedJhana} onSelectJhana={onSelectJhana} />
          <EffectComposer>
            <Bloom mipmapBlur luminanceThreshold={0.15} intensity={0.8} />
            <ChromaticAberration blendFunction={BlendFunction.NORMAL} offset={[0.001, 0.001]} radialModulation={false} modulationOffset={0} />
            <Vignette eskil={false} offset={0.25} darkness={0.55} />
          </EffectComposer>
        </Canvas>
      </div>

      {/* Info panel below canvas — AnimatePresence with key-based transitions */}
      <AnimatePresence mode="wait">
        {selectedJhana ? (
          <motion.div
            key={selectedJhana}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.25, ease: 'easeOut' }}
            className="bg-gradient-to-br from-slate-800/60 to-slate-900/60 border border-slate-700/50 rounded-xl p-5 backdrop-blur-sm"
          >
            <div className="flex items-center gap-3 mb-3">
              <div
                className="w-3 h-3 rounded-full flex-shrink-0 ring-2 ring-white/10"
                style={{ backgroundColor: `#${JHANA_COLORS[selectedJhana].toString(16).padStart(6, '0')}` }}
              />
              <h4 className="text-base font-semibold text-slate-100">{selectedJhana}</h4>
            </div>
            <p className="text-sm text-slate-400 leading-relaxed">
              {JHANA_DESCRIPTIONS[selectedJhana]}
            </p>
          </motion.div>
        ) : (
          <motion.div
            key="empty"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="border border-dashed border-slate-700/50 rounded-xl p-4 text-center text-slate-600 text-xs"
          >
            Click a point on the spiral to explore that absorption state
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
