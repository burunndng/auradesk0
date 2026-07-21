import { useMemo, useRef, Suspense } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { EffectComposer, Bloom, Vignette } from '@react-three/postprocessing';
import * as THREE from 'three';

const VIOLET = new THREE.Color(0x805cff);
const CYAN = new THREE.Color(0x57f6e1);
const CRIMSON = new THREE.Color(0xff315b);

const obsidian = new THREE.MeshPhysicalMaterial({
  color: 0x0a0713,
  metalness: 0.9,
  roughness: 0.16,
  clearcoat: 1,
  clearcoatRoughness: 0.08,
});

const edge = new THREE.MeshStandardMaterial({
  color: 0x6c4dce,
  emissive: 0x321b8e,
  emissiveIntensity: 2,
  metalness: 0.35,
  roughness: 0.32,
});

function Core() {
  const group = useRef<THREE.Group>(null);
  const inner = useRef<THREE.Mesh>(null);
  const shell = useRef<THREE.Mesh>(null);
  const ring1 = useRef<THREE.Mesh>(null);
  const ring2 = useRef<THREE.Mesh>(null);
  const coreLight = useRef<THREE.PointLight>(null);

  useFrame((state) => {
    const t = state.clock.elapsedTime;
    if (group.current) group.current.rotation.y = t * 0.06;
    if (shell.current) shell.current.rotation.y = -t * 0.09;
    if (inner.current) {
      inner.current.rotation.y = -t * 0.6;
      inner.current.rotation.z = t * 0.3;
    }
    if (ring1.current) ring1.current.rotation.z = t * 0.32;
    if (ring2.current) ring2.current.rotation.z = -t * 0.22;
    if (coreLight.current) coreLight.current.intensity = 14 + Math.sin(t * 3) * 4;
  });

  return (
    <group ref={group} position={[0, 0.6, 0]}>
      {/* Pedestal */}
      <mesh material={obsidian} position={[0, -0.4, 0]}>
        <cylinderGeometry args={[1.5, 2, 1, 6]} />
      </mesh>
      <mesh material={edge} position={[0, 0.15, 0]} rotation={[0, -0.17, 0]}>
        <cylinderGeometry args={[2.2, 1.5, 0.08, 6]} />
      </mesh>

      {/* Glass shell */}
      <mesh ref={shell} position={[0, 1.4, 0]}>
        <cylinderGeometry args={[1.7, 1.7, 2.6, 8, 1, true]} />
        <meshPhysicalMaterial
          color={0x3b2165}
          emissive={0x170a37}
          emissiveIntensity={0.7}
          transparent
          opacity={0.18}
          roughness={0.05}
          metalness={0.15}
          side={THREE.DoubleSide}
        />
      </mesh>

      {/* Wireframe core */}
      <mesh position={[0, 1.4, 0]}>
        <icosahedronGeometry args={[0.78, 0]} />
        <meshStandardMaterial color={0x8f6bff} emissive={0x5424dc} emissiveIntensity={3} wireframe />
      </mesh>

      {/* Inner solid core */}
      <mesh ref={inner} position={[0, 1.4, 0]}>
        <icosahedronGeometry args={[0.42, 0]} />
        <meshStandardMaterial color={0xffffff} emissive={0x8a2be2} emissiveIntensity={4} />
      </mesh>

      <pointLight ref={coreLight} color={0x7146ff} intensity={15} distance={8} decay={2} position={[0, 1.4, 0]} />

      {/* Rings around core */}
      <mesh ref={ring1} position={[0, 1.4, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[1.45, 0.018, 6, 96]} />
        <meshBasicMaterial color={CYAN} transparent opacity={0.75} />
      </mesh>
      <mesh ref={ring2} position={[0, 1.4, 0]} rotation={[Math.PI / 2 + 0.45, 0.3, 0]}>
        <torusGeometry args={[1.75, 0.01, 6, 96]} />
        <meshBasicMaterial color={VIOLET} transparent opacity={0.55} />
      </mesh>
    </group>
  );
}

function OuterRings() {
  const group = useRef<THREE.Group>(null);
  useFrame((state) => {
    const t = state.clock.elapsedTime;
    if (group.current) {
      group.current.rotation.y = -t * 0.06;
      group.current.rotation.z = t * 0.04;
    }
  });
  return (
    <group ref={group}>
      <mesh rotation={[Math.PI / 2.5, Math.PI / 4, 0]}>
        <torusGeometry args={[6, 0.025, 16, 120]} />
        <meshStandardMaterial color={VIOLET} emissive={VIOLET} emissiveIntensity={1.5} />
      </mesh>
      <mesh rotation={[Math.PI / 1.5, Math.PI / 3, 0]}>
        <torusGeometry args={[7.5, 0.025, 16, 120]} />
        <meshStandardMaterial color={CYAN} emissive={CYAN} emissiveIntensity={1.5} />
      </mesh>
    </group>
  );
}

function Debris() {
  const group = useRef<THREE.Group>(null);
  const items = useMemo(() => {
    const arr: { pos: [number, number, number]; rot: THREE.Vector3; rotSpeed: THREE.Vector3; baseY: number; phase: number }[] = [];
    for (let i = 0; i < 22; i++) {
      const r = 5 + Math.random() * 6;
      const theta = Math.random() * Math.PI * 2;
      const y = (Math.random() - 0.5) * 9;
      arr.push({
        pos: [Math.cos(theta) * r, y, Math.sin(theta) * r],
        rot: new THREE.Vector3(Math.random() * Math.PI, Math.random() * Math.PI, Math.random() * Math.PI),
        rotSpeed: new THREE.Vector3(Math.random() * 0.02, Math.random() * 0.02, Math.random() * 0.02),
        baseY: y,
        phase: Math.random() * Math.PI * 2,
      });
    }
    return arr;
  }, []);

  useFrame((state) => {
    const t = state.clock.elapsedTime;
    if (!group.current) return;
    group.current.children.forEach((d, i) => {
      const data = items[i];
      d.rotation.x += data.rotSpeed.x;
      d.rotation.y += data.rotSpeed.y;
      d.rotation.z += data.rotSpeed.z;
      d.position.y = data.baseY + Math.sin(t * 2 + data.phase) * 0.6;
    });
  });

  return (
    <group ref={group}>
      {items.map((d, i) => (
        <mesh key={i} position={d.pos} rotation={[d.rot.x, d.rot.y, d.rot.z]}>
          <tetrahedronGeometry args={[0.18]} />
          <meshStandardMaterial color={0x111111} metalness={0.8} roughness={0.2} />
        </mesh>
      ))}
    </group>
  );
}

function Haze() {
  const ref = useRef<THREE.Points>(null);
  const geo = useMemo(() => {
    const g = new THREE.BufferGeometry();
    const pos = new Float32Array(900 * 3);
    for (let i = 0; i < 900 * 3; i += 3) {
      pos[i] = (Math.random() - 0.5) * 30;
      pos[i + 1] = (Math.random() - 0.5) * 30;
      pos[i + 2] = (Math.random() - 0.5) * 30;
    }
    g.setAttribute('position', new THREE.BufferAttribute(pos, 3));
    return g;
  }, []);

  useFrame((state) => {
    if (ref.current) ref.current.rotation.y = state.clock.elapsedTime * 0.01;
  });

  return (
    <points ref={ref} geometry={geo}>
      <pointsMaterial color={0x8172bc} size={0.04} transparent opacity={0.55} blending={THREE.AdditiveBlending} depthWrite={false} />
    </points>
  );
}

function OrbitingLights() {
  const cyan = useRef<THREE.PointLight>(null);
  const crimson = useRef<THREE.PointLight>(null);
  useFrame((state) => {
    const t = state.clock.elapsedTime;
    if (cyan.current) {
      cyan.current.position.x = Math.cos(t * 0.5) * 5;
      cyan.current.position.z = Math.sin(t * 0.5) * 5;
      cyan.current.position.y = 4 + Math.sin(t * 0.3) * 1.5;
      cyan.current.intensity = 20 + Math.sin(t * 2 + 1) * 6;
    }
    if (crimson.current) {
      crimson.current.position.x = Math.cos(-t * 0.4 + Math.PI) * 5;
      crimson.current.position.z = Math.sin(-t * 0.4 + Math.PI) * 5;
      crimson.current.position.y = 3 + Math.cos(t * 0.4) * 1.5;
      crimson.current.intensity = 16 + Math.sin(t * 2.5 + 2) * 5;
    }
  });
  return (
    <>
      <pointLight ref={cyan} color={CYAN} intensity={24} distance={12} decay={2} />
      <pointLight ref={crimson} color={CRIMSON} intensity={14} distance={10} decay={2} />
    </>
  );
}

function Scene() {
  const root = useRef<THREE.Group>(null);
  const target = useRef({ x: 0, y: 0 });

  useFrame((state) => {
    target.current.x += (state.pointer.x * 0.15 - target.current.x) * 0.03;
    target.current.y += (state.pointer.y * 0.08 - target.current.y) * 0.03;
    if (root.current) {
      root.current.rotation.y += (target.current.x - root.current.rotation.y) * 0.0;
      root.current.position.y = Math.sin(state.clock.elapsedTime * 0.8) * 0.08;
    }
  });

  return (
    <>
      <fogExp2 attach="fog" args={[0x030207, 0.055]} />
      <ambientLight intensity={0.4} color={0x332050} />
      <OrbitingLights />
      <directionalLight position={[-5, 8, 5]} intensity={0.4} color={0x222233} />

      <group ref={root}>
        <Core />
        <OuterRings />
        <Debris />
      </group>
      <Haze />

      {/* reflective floor */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -2.4, 0]}>
        <planeGeometry args={[60, 60]} />
        <meshStandardMaterial color={0x030208} metalness={0.75} roughness={0.25} />
      </mesh>

      <EffectComposer>
        <Bloom intensity={1.15} luminanceThreshold={0.28} luminanceSmoothing={0.5} mipmapBlur radius={0.7} />
        <Vignette eskil={false} offset={0.15} darkness={0.95} />
      </EffectComposer>
    </>
  );
}

export default function NeuralCoreBackground() {
  return (
    <div className="absolute inset-0" style={{ zIndex: 0 }}>
      <Canvas
        camera={{ position: [7, 4.5, 10], fov: 42, near: 0.1, far: 100 }}
        dpr={[1, 1.5]}
        gl={{ antialias: true, powerPreference: 'high-performance' }}
        style={{ background: '#030207' }}
      >
        <Suspense fallback={null}>
          <Scene />
        </Suspense>
      </Canvas>
      {/* CRT scanlines + grain over the canvas */}
      <div className="absolute inset-0 overlay-scanlines pointer-events-none" style={{ opacity: 0.4 }} />
    </div>
  );
}
