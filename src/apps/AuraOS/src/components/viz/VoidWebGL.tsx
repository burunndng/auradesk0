import React, { useRef, useMemo, useEffect, useState } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { EffectComposer, Bloom } from '@react-three/postprocessing';
import * as THREE from 'three';
import { ModuleKey } from '../../../types';
import { useVoidColors } from './use-void-colors';
import { vertexShader, fragmentShader } from './void-shader';

export type VoidWebGLProps = {
  module: ModuleKey;
  intensity?: 'subtle' | 'medium';
  prevModule: ModuleKey;
  transitionProgress: number;
};

// Inner component to handle shader updates
const VoidShaderPlane: React.FC<VoidWebGLProps> = ({ module, intensity = 'subtle', prevModule, transitionProgress }) => {
  const materialRef = useRef<THREE.ShaderMaterial>(null);
  const size = useThree((state) => state.size);
  
  // Detect prefers-reduced-motion
  const [reducedMotion, setReducedMotion] = useState(false);
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    setReducedMotion(mediaQuery.matches);
    const handler = (e: MediaQueryListEvent) => setReducedMotion(e.matches);
    mediaQuery.addEventListener('change', handler);
    return () => mediaQuery.removeEventListener('change', handler);
  }, []);

  const currentColors = useVoidColors(module);
  const prevColors = useVoidColors(prevModule);
  
  const intensityValue = intensity === 'subtle' ? 0.6 : 1.0;
  
  // Use stable uniforms object
  const uniforms = useMemo(() => ({
    uTime: { value: 0 },
    uModuleColor: { value: new THREE.Color() },
    uVoidBase: { value: new THREE.Color() },
    uPrevColor: { value: new THREE.Color() },
    uTransitionProgress: { value: 0 },
    uIntensity: { value: intensityValue },
    uResolution: { value: new THREE.Vector2(size.width, size.height) },
  }), []);

  // Sync size
  useEffect(() => {
    if (materialRef.current) {
      materialRef.current.uniforms.uResolution.value.set(size.width, size.height);
    }
  }, [size.width, size.height]);

  // Sync colors & progress
  useEffect(() => {
    if (materialRef.current) {
      materialRef.current.uniforms.uModuleColor.value.copy(currentColors.accent);
      materialRef.current.uniforms.uVoidBase.value.copy(currentColors.voidBase);
      materialRef.current.uniforms.uPrevColor.value.copy(prevColors.accent);
      materialRef.current.uniforms.uTransitionProgress.value = transitionProgress;
      
      materialRef.current.uniforms.uIntensity.value = reducedMotion ? 0.3 : intensityValue;
    }
  }, [currentColors, prevColors, transitionProgress, intensityValue, reducedMotion]);

  useFrame((state) => {
    if (!materialRef.current) return;
    
    // Freeze time if reduced motion is preferred
    if (!reducedMotion) {
      materialRef.current.uniforms.uTime.value = state.clock.elapsedTime;
    } else {
      materialRef.current.uniforms.uTime.value = 0;
    }
  });

  return (
    <mesh>
      <planeGeometry args={[2, 2]} />
      <shaderMaterial
        ref={materialRef}
        vertexShader={vertexShader}
        fragmentShader={fragmentShader}
        uniforms={uniforms}
        depthWrite={false}
        depthTest={false}
      />
    </mesh>
  );
};

export const VoidWebGL: React.FC<VoidWebGLProps> = (props) => {
  const [reducedMotion, setReducedMotion] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    setReducedMotion(mediaQuery.matches);
    
    // simple mobile check based on window width
    setIsMobile(window.innerWidth < 768);
  }, []);

  return (
    <Canvas
      dpr={isMobile ? [1, 1.5] : [1, 2]}
      gl={{
        antialias: false,
        alpha: false,
        powerPreference: 'high-performance',
      }}
      camera={{ position: [0, 0, 1], fov: 75 }}
      performance={{ min: 0.5 }}
      frameloop="always"
      style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', pointerEvents: 'none', zIndex: -10 }}
    >
      <VoidShaderPlane {...props} />
      
      {!reducedMotion && (
        <EffectComposer>
          <Bloom
            luminanceThreshold={0.25}
            luminanceSmoothing={0.9}
            intensity={isMobile ? 0.2 : 0.4}
            mipmapBlur
          />
        </EffectComposer>
      )}
    </Canvas>
  );
};

export default VoidWebGL;
