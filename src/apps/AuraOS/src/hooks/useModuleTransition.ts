import { useState, useRef, useEffect } from 'react';
import { useSpring } from '@react-spring/web';
import { ModuleKey } from '../../types';

export interface UseModuleTransitionReturn {
  module: ModuleKey;
  prevModule: ModuleKey;
  transitionProgress: number;
  transitionTo: (next: ModuleKey) => void;
}

export function useModuleTransition(initialModule: ModuleKey): UseModuleTransitionReturn {
  const [module, setModule] = useState<ModuleKey>(initialModule);
  // prevModuleRef holds the last module state
  const prevModuleRef = useRef<ModuleKey>(initialModule);
  // transitionProgress is a plain number for CSS and WebGL renderers
  const [transitionProgress, setTransitionProgress] = useState(1);

  const [, api] = useSpring(() => ({
    progress: 1,
    config: { mass: 2, tension: 80, friction: 30 },
    onChange: (result) => {
      setTransitionProgress(result.value.progress);
    }
  }));

  const transitionTo = (next: ModuleKey) => {
    if (next === module) return;
    prevModuleRef.current = module;
    setModule(next);
    
    // Animate from 0 to 1
    api.start({ from: { progress: 0 }, to: { progress: 1 } });
  };

  return {
    module,
    prevModule: prevModuleRef.current,
    transitionProgress,
    transitionTo
  };
}
