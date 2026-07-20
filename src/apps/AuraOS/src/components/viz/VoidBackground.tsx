import React, { Suspense, useEffect, useState } from 'react';
import { ModuleKey } from '../../../types';
import { useModuleTransition } from '../../hooks/useModuleTransition';
import { VoidCSS } from './VoidCSS';

const VoidWebGL = React.lazy(() => import('./VoidWebGL'));

export type VoidBackgroundProps = {
  module: ModuleKey;
  variant?: 'wizard' | 'page' | 'hero';
  mode?: 'auto' | 'css' | 'webgl';
  intensity?: 'subtle' | 'medium';
  className?: string; // Optional custom wrapper classes
};

/**
 * VoidBackground Decision Logic (mode="auto"):
 * 1. Is variant "wizard"? -> CSS mode
 * 2. Is prefers-reduced-motion active? -> CSS mode
 * 3. Is WebGL unavailable or hardware low-power (<= 4 cores)? -> CSS mode
 * 4. Otherwise -> WebGL mode
 */
export default function VoidBackground({
  module,
  variant = 'page',
  mode = 'auto',
  intensity = 'subtle',
  className = ''
}: VoidBackgroundProps) {
  const { module: currentModule, prevModule, transitionProgress, transitionTo } = useModuleTransition(module);

  useEffect(() => {
    transitionTo(module);
  }, [module, transitionTo]);

  const [hardwareCapable, setHardwareCapable] = useState(true);
  const [motionReduced, setMotionReduced] = useState(false);

  useEffect(() => {
    // Check reduced motion
    const motionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    setMotionReduced(motionQuery.matches);
    const motionHandler = (e: MediaQueryListEvent) => setMotionReduced(e.matches);
    motionQuery.addEventListener('change', motionHandler);

    // Hardware Concurrency check (simplistic heuristic)
    const concurrency = navigator.hardwareConcurrency || 4;
    
    // Attempt to check if WebGL2 is available
    let hasWebGL = true;
    try {
      const canvas = document.createElement('canvas');
      hasWebGL = !!(window.WebGL2RenderingContext && canvas.getContext('webgl2'));
    } catch(e) {
      hasWebGL = false;
    }

    if (concurrency <= 4 || !hasWebGL) {
      setHardwareCapable(false);
    }

    return () => {
      motionQuery.removeEventListener('change', motionHandler);
    };
  }, []);

  // Mode decision logic
  let resolvedMode: 'css' | 'webgl' = 'webgl';
  if (mode !== 'auto') {
    resolvedMode = mode === 'webgl' ? 'webgl' : 'css';
  } else {
    // Auto resolution rules
    if (variant === 'wizard' || motionReduced || !hardwareCapable) {
      resolvedMode = 'css';
    }
  }

  return (
    <div data-module={currentModule} className={`fixed inset-0 -z-10 ${className}`}>
      {resolvedMode === 'css' && (
        <VoidCSS module={currentModule} intensity={intensity} />
      )}
      
      {resolvedMode === 'webgl' && (
        <Suspense fallback={<VoidCSS module={currentModule} intensity={intensity} />}>
          <VoidWebGL 
            module={currentModule} 
            prevModule={prevModule}
            transitionProgress={transitionProgress}
            intensity={intensity} 
          />
        </Suspense>
      )}
    </div>
  );
}
