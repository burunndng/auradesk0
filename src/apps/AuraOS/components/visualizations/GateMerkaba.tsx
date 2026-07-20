import React, { useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { MeshTransmissionMaterial } from '@react-three/drei';
import { EffectComposer, Bloom, ChromaticAberration, Vignette } from '@react-three/postprocessing';
import { BlendFunction } from 'postprocessing';
import { motion } from 'framer-motion';
import * as THREE from 'three';

// Merkaba = two interlocked tetrahedra (Star of David in 3D)
// Upper tetrahedron points up, lower points down, rotated 60° relative
function MerkabaGeometry() {
  const groupRef = useRef<THREE.Group>(null);

  useFrame((_, delta) => {
    if (!groupRef.current) return;
    groupRef.current.rotation.y += delta * 0.18;
    groupRef.current.rotation.x += delta * 0.04;
  });

  // Tetrahedron vertices (normalized)
  const R = 1.1;
  const upVerts: [number, number, number][] = [
    [0, R, 0],
    [-R * 0.816, -R * 0.333, R * 0.471],
    [R * 0.816, -R * 0.333, R * 0.471],
    [0, -R * 0.333, -R * 0.943],
  ];
  const downVerts: [number, number, number][] = upVerts.map(
    ([x, y, z]) => [x, -y, -z]
  );

  const faces: [number, number, number][] = [
    [0, 1, 2], [0, 2, 3], [0, 3, 1], [1, 3, 2],
  ];

  function buildTetraGeo(verts: [number, number, number][]) {
    const positions: number[] = [];
    const normals: number[] = [];
    for (const [a, b, c] of faces) {
      const va = new THREE.Vector3(...verts[a]);
      const vb = new THREE.Vector3(...verts[b]);
      const vc = new THREE.Vector3(...verts[c]);
      const n = new THREE.Vector3()
        .crossVectors(vb.clone().sub(va), vc.clone().sub(va))
        .normalize();
      for (const v of [va, vb, vc]) {
        positions.push(v.x, v.y, v.z);
        normals.push(n.x, n.y, n.z);
      }
    }
    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
    geo.setAttribute('normal', new THREE.Float32BufferAttribute(normals, 3));
    return geo;
  }

  const upGeo = buildTetraGeo(upVerts);
  const downGeo = buildTetraGeo(downVerts);

  return (
    <group ref={groupRef}>
      <mesh geometry={upGeo}>
        <MeshTransmissionMaterial
          backside
          samples={4}
          thickness={0.5}
          roughness={0.02}
          transmission={0.97}
          ior={1.6}
          chromaticAberration={0.04}
          anisotropicBlur={0.1}
          temporalDistortion={0.05}
          color="#c8b8e8"
          distortionScale={0.1}
          distortion={0.05}
        />
      </mesh>
      <mesh geometry={downGeo}>
        <MeshTransmissionMaterial
          backside
          samples={4}
          thickness={0.5}
          roughness={0.02}
          transmission={0.97}
          ior={1.6}
          chromaticAberration={0.04}
          anisotropicBlur={0.1}
          temporalDistortion={0.05}
          color="#c8b8e8"
          distortionScale={0.1}
          distortion={0.05}
        />
      </mesh>
    </group>
  );
}

export default function GateMerkaba() {
  const isMobile = typeof window !== 'undefined' && window.innerWidth < 640;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: [0, 1, 1, 0] }}
      transition={{ duration: 3.2, times: [0, 0.2, 0.7, 1], ease: 'easeInOut' }}
      aria-hidden="true"
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 1,
        pointerEvents: 'none',
      }}
    >
      <Canvas
        camera={{ position: [0, 0, 5], fov: 40 }}
        gl={{
          alpha: true,
          antialias: !isMobile,
          toneMapping: THREE.ACESFilmicToneMapping,
          toneMappingExposure: 0.9,
        }}
        dpr={isMobile ? 1.5 : Math.min(window.devicePixelRatio, 3)}
        style={{ width: '100%', height: '100%' }}
      >
        <ambientLight intensity={0.6} />
        <directionalLight position={[3, 5, 3]} intensity={1.2} />
        <pointLight position={[-3, -2, 2]} intensity={0.5} color="#c8b8e8" />
        <MerkabaGeometry />
        <EffectComposer>
          <Bloom mipmapBlur luminanceThreshold={0.1} intensity={0.4} />
          <ChromaticAberration
            blendFunction={BlendFunction.NORMAL}
            offset={[0.003, 0.003]}
            radialModulation={false}
            modulationOffset={0}
          />
          <Vignette eskil={false} offset={0.4} darkness={0.8} />
        </EffectComposer>
      </Canvas>
    </motion.div>
  );
}
