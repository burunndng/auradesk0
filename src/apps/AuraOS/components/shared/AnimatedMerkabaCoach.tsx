import React, { useState, useEffect, useRef, useCallback, memo, useMemo } from 'react';
import { Send, X, Trash2, Bot, Brain, Heart, Ghost, Orbit, History, Layout } from 'lucide-react';
import ResonanceFieldIcon from '../visualizations/SacredGeometryIcons/ResonanceFieldIcon';
import LightningPathIcon from '../visualizations/SacredGeometryIcons/LightningPathIcon';
import { motion, AnimatePresence } from 'framer-motion';
import { CoachMessage, ModuleKey, ModuleInfo, AllPractice, ActiveTab } from '../../types.ts';
import { practices } from '../../constants.ts';
import { useReducedMotion } from '../../hooks/useReducedMotion';
import { coachAwarenessService, AwarenessContext } from '../../services/coachAwarenessService.ts';
import { StorageManager } from '../../.claude/lib/storageManager.ts';
import {
  detectEasterEggKeyword,
  detectUserIntent,
  parseCoachActions,
  CoachAction,
  findPracticeFuzzy,
} from '../../services/coachActionService.ts';
import {
  saveConversationHybrid,
  saveUnlock,
  logAnalyticsEvent,
} from '../../services/coachDatabaseService.ts';
import { generateCoachResponse, CoachContext } from '../../services/coachChatService.ts';
import { typography, effects, theme, buttonSystem } from '../../theme.ts';

const MAX_COACH_MESSAGES = 10;

// --- Sub-components for Optimization ---

const MerkabaAvatar = memo(({ animationState, primaryColor, secondaryColor, rotationDuration }: {
  animationState: string,
  primaryColor: string,
  secondaryColor: string,
  rotationDuration: number
}) => {
  // Respect user's motion preferences for accessibility
  const prefersReducedMotion = useReducedMotion();

  // Memoize spark durations to prevent random() from being called every render
  const sparkDurations = useMemo(() => {
    const sparkConfigs = {
      idle: { count: 6, size: 1.5, maxRadius: 80, duration: [2.5, 3.5], opacity: 0.8 },
      thinking: { count: 12, size: 2, maxRadius: 100, duration: [1.5, 2.5], opacity: 1.0 },
      speaking: { count: 8, size: 1.8, maxRadius: 90, duration: [2, 3], opacity: 0.9 },
      alert: { count: 16, size: 2.5, maxRadius: 120, duration: [1, 2], opacity: 1.1 },
      celebration: { count: 20, size: 3, maxRadius: 110, duration: [0.8, 1.5], opacity: 1.2 },
      concerned: { count: 4, size: 1.2, maxRadius: 60, duration: [3, 4], opacity: 0.6 },
    };
    const config = sparkConfigs[animationState as keyof typeof sparkConfigs] || sparkConfigs.idle;

    // Generate random durations once per state change
    return [...Array(config.count)].map(() =>
      config.duration[0] + Math.random() * (config.duration[1] - config.duration[0])
    );
  }, [animationState]);

  // Vortex orbital motion (advanced choreography)
  const getVortexMotion = () => {
    if (prefersReducedMotion) return { y: [0, -8, 0] };

    // State-specific orbital motion
    if (animationState === 'thinking') {
      return {
        x: [0, 3, 2, -2, 0],
        y: [0, -10, -12, -8, 0],
        rotate: [0, 30, 60, 30, 0],
      };
    } else if (animationState === 'speaking') {
      return {
        x: [0, 2, -2, 0],
        y: [0, -8, -10, 0],
        rotate: [0, 15, -15, 0],
      };
    } else if (animationState === 'alert') {
      return {
        x: [0, 2, -2, 2, -2, 0], // Rapid vibration
        y: [0, -6, -6, -6, -6, 0],
        scale: [1, 1.02, 0.98, 1.02, 0.98, 1],
      };
    }

    // Default idle/concerned: gentle orbital breathing
    return {
      x: [0, 2, 1, -1, 0],
      y: [0, -8, -6, -4, 0],
    };
  };

  return (
    <motion.div
      className="absolute inset-0 flex items-center justify-center"
      animate={prefersReducedMotion ? {} : getVortexMotion()}
      transition={{
        duration: animationState === 'alert' ? 0.6 : animationState === 'thinking' ? 3 : 4,
        repeat: Infinity,
        ease: "easeInOut"
      }}
    >
      {/* Dynamic Swirling Background Glows - State-Responsive */}
      <AnimatePresence>
        {!prefersReducedMotion && (
          <>
            {/* Get state-specific opacity values (design spec) */}
            {(() => {
              const glowOpacities = {
                idle: { primary: 0.40, secondary: 0.35, hasThird: false },
                thinking: { primary: 0.65, secondary: 0.55, hasThird: true },
                speaking: { primary: 0.55, secondary: 0.45, hasThird: false },
                alert: { primary: 0.75, secondary: 0.65, hasThird: true },
                celebration: { primary: 0.85, secondary: 0.75, hasThird: true },
                concerned: { primary: 0.30, secondary: 0.25, hasThird: false },
              };
              const glows = glowOpacities[animationState as keyof typeof glowOpacities] || glowOpacities.idle;
              const durationMultiplier = animationState === 'thinking' ? 0.5 : animationState === 'alert' ? 0.3 : 1;

              return (
                <>
                  <motion.div
                    className="absolute inset-0 rounded-full blur-[40px]"
                    style={{ opacity: glows.primary }}
                    animate={{
                      scale: [1, 1.3, 0.8, 1.2, 1],
                      rotate: [0, 120, 240, 360],
                      backgroundColor: [primaryColor, secondaryColor, primaryColor]
                    }}
                    transition={{ duration: 12 * durationMultiplier, repeat: Infinity, ease: "linear" }}
                  />
                  <motion.div
                    className="absolute inset-0 rounded-full blur-[70px]"
                    style={{ opacity: glows.secondary }}
                    animate={{
                      scale: [1.3, 0.7, 1.4, 1],
                      rotate: [360, 240, 120, 0],
                      backgroundColor: [secondaryColor, primaryColor, secondaryColor]
                    }}
                    transition={{ duration: 18 * durationMultiplier, repeat: Infinity, ease: "linear" }}
                  />
                  {/* Third atmospheric glow for thinking/alert/celebration states */}
                  {glows.hasThird && (
                    <motion.div
                      className="absolute inset-0 rounded-full blur-[85px]"
                      style={{ opacity: glows.secondary * 0.8 }}
                      animate={{
                        scale: [1, 1.15, 0.9, 1.1, 1],
                        rotate: [180, 60, -60, 180],
                        backgroundColor: [primaryColor, secondaryColor, primaryColor]
                      }}
                      transition={{ duration: 24 * durationMultiplier, repeat: Infinity, ease: "linear" }}
                    />
                  )}
                </>
              );
            })()}

            {/* Resonance Rings - State-Specific Wave Propagation */}
            {(() => {
              const ringConfigs = {
                idle: { count: 2, startOpacity: 0.35, duration: 3, borderWidth: 1, maxSize: 160 },
                thinking: { count: 3, startOpacity: 0.50, duration: 1.5, borderWidth: 2, maxSize: 200 },
                speaking: { count: 2, startOpacity: 0.40, duration: 2.5, borderWidth: 1.5, maxSize: 180 },
                alert: { count: 4, startOpacity: 0.60, duration: 1, borderWidth: 2.5, maxSize: 240 },
                celebration: { count: 5, startOpacity: 0.70, duration: 0.8, borderWidth: 2, maxSize: 220 },
                concerned: { count: 1, startOpacity: 0.25, duration: 4, borderWidth: 1, maxSize: 140 },
              };
              const config = ringConfigs[animationState as keyof typeof ringConfigs] || ringConfigs.idle;

              return [...Array(config.count)].map((_, i) => (
                <motion.div
                  key={`ring-${i}`}
                  className="absolute border rounded-full"
                  style={{
                    width: config.maxSize,
                    height: config.maxSize,
                    borderColor: i % 2 === 0 ? primaryColor : secondaryColor,
                    borderWidth: config.borderWidth,
                    marginLeft: -(config.maxSize / 2),
                    marginTop: -(config.maxSize / 2),
                  }}
                  initial={{ scale: 0, opacity: 0 }}
                  animate={{ scale: 1, opacity: 0 }}
                  transition={{
                    duration: config.duration,
                    repeat: Infinity,
                    delay: i * (config.duration * 0.3),
                    ease: "easeOut"
                  }}
                />
              ));
            })()}

            {/* Energy Sparks - State-Specific Particle System */}
            {(() => {
              const sparkConfigs = {
                idle: { count: 6, size: 1.5, maxRadius: 80, opacity: 0.8 },
                thinking: { count: 12, size: 2, maxRadius: 100, opacity: 1.0 },
                speaking: { count: 8, size: 1.8, maxRadius: 90, opacity: 0.9 },
                alert: { count: 16, size: 2.5, maxRadius: 120, opacity: 1.1 },
                celebration: { count: 20, size: 3, maxRadius: 110, opacity: 1.2 },
                concerned: { count: 4, size: 1.2, maxRadius: 60, opacity: 0.6 },
              };
              const config = sparkConfigs[animationState as keyof typeof sparkConfigs] || sparkConfigs.idle;

              return [...Array(config.count)].map((_, i) => {
                const angle = (i / config.count) * Math.PI * 2;
                const maxRadius = config.maxRadius;
                return (
                  <motion.div
                    key={`spark-${i}`}
                    className={`absolute rounded-full`}
                    style={{
                      width: config.size,
                      height: config.size,
                      backgroundColor: i % 3 === 0 ? secondaryColor : i % 3 === 1 ? primaryColor : 'white',
                      filter: 'blur(1px)',
                    }}
                    initial={{ x: 0, y: 0, opacity: 0, scale: 0 }}
                    animate={{
                      x: [0, Math.cos(angle) * maxRadius],
                      y: [0, Math.sin(angle) * (maxRadius * 0.8)],
                      opacity: [0, config.opacity, 0],
                      scale: [0, 1.5, 0]
                    }}
                    transition={{
                      duration: sparkDurations[i],
                      repeat: Infinity,
                      delay: i * 0.08,
                      ease: "easeOut"
                    }}
                  />
                );
              });
            })()}
          </>
        )}
      </AnimatePresence>

      <motion.svg
        width="130"
        height="130"
        viewBox="0 0 100 100"
        className="relative z-10 drop-shadow-[0_0_20px_rgba(0,0,0,0.6)]"
        animate={prefersReducedMotion ? {} : { 
          rotate: 360,
          scale: animationState === 'thinking' ? [1, 1.1, 1] : 
                 animationState === 'speaking' ? [1, 1.03, 1] : [1, 1.05, 1]
        }}
        transition={prefersReducedMotion ? {} : { 
          rotate: { duration: rotationDuration, ease: "linear", repeat: Infinity },
          scale: { duration: 2, repeat: Infinity, ease: "easeInOut" }
        }}
      >
        <defs>
          <linearGradient id="wireGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor={primaryColor} stopOpacity="1" />
            <stop offset="100%" stopColor={secondaryColor} stopOpacity="0.8" />
          </linearGradient>
          <filter id="neon-glow" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="2" result="coloredBlur" />
            <feMerge>
              <feMergeNode in="coloredBlur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        <g filter="url(#neon-glow)" stroke="url(#wireGradient)" strokeWidth={animationState === 'alert' ? 2 : 1.5} fill="none">
          {/* Upward-pointing tetrahedron component - State-Responsive Rotation */}
          {(() => {
            const rotationDurations = {
              idle: 25,
              thinking: 4,
              speaking: 8,
              alert: 1.5,
              celebration: 2,
              concerned: 15,
            };
            const duration = rotationDurations[animationState as keyof typeof rotationDurations] || 25;

            return (
              <motion.g
                style={{ transformOrigin: '50% 50%' }}
                animate={prefersReducedMotion ? {} : { rotate: 360 }}
                transition={prefersReducedMotion ? {} : { duration, repeat: Infinity, ease: "linear" }}
              >
                <path d="M50 15 L30 65 L70 65 Z" fill={`url(#wireGradient)`} fillOpacity="0.05" strokeLinejoin="round" />
                <path d="M50 15 L20 50 M50 15 L80 50 M20 50 L80 50" strokeOpacity="0.4" strokeWidth="0.8" />
                <path d="M30 65 L20 50 M70 65 L80 50" strokeOpacity="0.3" strokeWidth="0.6" />
              </motion.g>
            );
          })()}

          {/* Downward-pointing tetrahedron component - State-Responsive Counter-Rotation */}
          {(() => {
            const counterRotationDurations = {
              idle: 20,
              thinking: 3,
              speaking: 6,
              alert: 1.2,
              celebration: 1.5,
              concerned: 12,
            };
            const duration = counterRotationDurations[animationState as keyof typeof counterRotationDurations] || 20;

            return (
              <motion.g
                style={{ transformOrigin: '50% 50%' }}
                animate={prefersReducedMotion ? {} : { rotate: -360 }}
                transition={prefersReducedMotion ? {} : { duration, repeat: Infinity, ease: "linear" }}
              >
                <path d="M50 85 L30 35 L70 35 Z" fill={`url(#wireGradient)`} fillOpacity="0.05" strokeLinejoin="round" />
                <path d="M50 85 L20 50 M50 85 L80 50" strokeOpacity="0.4" strokeWidth="0.8" />
                <path d="M30 35 L20 50 M70 35 L80 50" strokeOpacity="0.3" strokeWidth="0.6" />
              </motion.g>
            );
          })()}

          {/* Interlocking geometric bridge elements */}
          <motion.g
            style={{ transformOrigin: '50% 50%' }}
            animate={prefersReducedMotion ? {} : { opacity: [0.2, 0.5, 0.2] }}
            transition={prefersReducedMotion ? {} : { duration: 4, repeat: Infinity, ease: "easeInOut" }}
          >
            <path d="M30 35 L70 35 L30 65 Z" strokeOpacity="0.2" strokeWidth="0.5" />
            <path d="M70 35 L70 65 L30 65 Z" strokeOpacity="0.2" strokeWidth="0.5" />
          </motion.g>
        </g>

        {/* The Sentient Eye (Now inside SVG) */}
        <motion.g
          style={{ transformOrigin: '50% 50%' }}
          animate={prefersReducedMotion ? {} : { 
            scale: animationState === 'thinking' ? 1.15 : 1,
            rotate: animationState === 'speaking' ? [0, 5, -5, 0] : 0
          }}
          transition={prefersReducedMotion ? {} : { 
            scale: { duration: 0.5, ease: "easeInOut" },
            rotate: { duration: 0.2, repeat: Infinity }
          }}
        >
          {/* Obsidian Sclera (Background) - Deep polished finish */}
          <circle cx="50" cy="50" r="14" fill="#030303" stroke={primaryColor} strokeWidth="0.5" strokeOpacity="0.3" />

          {/* Holographic Iris (Rotating Layers) - More complex pattern */}
          <motion.g
            animate={prefersReducedMotion ? {} : { rotate: 360 }}
            transition={prefersReducedMotion ? {} : { duration: 10, ease: "linear", repeat: Infinity }}
            style={{ transformOrigin: '50% 50%' }}
          >
            <circle cx="50" cy="50" r="10" fill="none" stroke={`url(#wireGradient)`} strokeWidth="2.5" strokeDasharray="2 4" opacity="0.8" />
            <circle cx="50" cy="50" r="11" fill="none" stroke={primaryColor} strokeWidth="1" strokeDasharray="1 8" opacity="0.6" />
          </motion.g>

          <motion.g
            animate={prefersReducedMotion ? {} : { rotate: -360 }}
            transition={prefersReducedMotion ? {} : { duration: 7, ease: "linear", repeat: Infinity }}
            style={{ transformOrigin: '50% 50%' }}
          >
            <circle cx="50" cy="50" r="7" fill="none" stroke={secondaryColor} strokeWidth="1.5" strokeDasharray="4 4" opacity="0.7" />
            <circle cx="50" cy="50" r="8.5" fill="none" stroke="#fff" strokeWidth="0.5" strokeDasharray="1 12" opacity="0.5" />
          </motion.g>

          {/* Radiant Pupil (The Core) - State-Responsive Glow */}
          {(() => {
            const pupilConfigs = {
              idle: { radiusRange: [4, 4.2, 4], glowSize: '6px', duration: 2.5 },
              thinking: { radiusRange: [4, 5.5, 4], glowSize: '12px', duration: 0.6 },
              speaking: { radiusRange: [4, 4.8, 4], glowSize: '8px', duration: 1 },
              alert: { radiusRange: [4, 6, 3.5, 5.5, 4], glowSize: '18px', duration: 0.4 },
              celebration: { radiusRange: [4, 6, 4], glowSize: '14px', duration: 0.8 },
              concerned: { radiusRange: [3, 3.5, 3], glowSize: '4px', duration: 3 },
            };
            const config = pupilConfigs[animationState as keyof typeof pupilConfigs] || pupilConfigs.idle;

            return (
              <motion.circle
                cx="50"
                cy="50"
                r="4"
                fill="white"
                animate={prefersReducedMotion ? {} : {
                  r: config.radiusRange,
                  opacity: [0.9, 1, 0.9],
                  filter: `drop-shadow(0 0 ${config.glowSize} ${primaryColor})`
                }}
                transition={prefersReducedMotion ? {} : {
                  duration: config.duration,
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
              />
            );
          })()}
          
          {/* Crystal Lens Reflection - Meticulous highlights */}
          <path d="M46 46 Q 50 42 54 46" stroke="white" strokeWidth="0.8" strokeOpacity="0.5" fill="none" />
          <circle cx="54" cy="54" r="1" fill="white" fillOpacity="0.3" />
        </motion.g>
      </motion.svg>

      {/* Extra pulses for "Thinking" state */}
      {animationState === 'thinking' && !prefersReducedMotion && (
        <motion.div
          className="absolute z-0 border border-amber-500/20 rounded-full"
          style={{ width: '120px', height: '120px', marginLeft: '-60px', marginTop: '-60px' }}
          initial={{ scale: 0.33, opacity: 0.5 }}
          animate={{ scale: 1, opacity: 0 }}
          transition={{ duration: 1.5, repeat: Infinity, ease: "easeOut" }}
        />
      )}

      {!prefersReducedMotion && [0, 90, 180, 270].map((deg, i) => (
        <motion.div
          key={i}
          className="absolute w-1.5 h-1.5 rounded-full bg-stone-300"
          animate={{ rotate: 360 }}
          transition={{ duration: 10 + i * 2, repeat: Infinity, ease: "linear" }}
        >
          <div className="w-full h-full bg-white rounded-full blur-[1px]" style={{ transform: `translateX(${35 + i * 2}px)` }} />
        </motion.div>
      ))}
    </motion.div>
  );
}, (prevProps, nextProps) => {
  // Custom comparison: only re-render if these specific props change
  // This prevents unnecessary re-renders when parent state changes
  return (
    prevProps.animationState === nextProps.animationState &&
    prevProps.primaryColor === nextProps.primaryColor &&
    prevProps.secondaryColor === nextProps.secondaryColor &&
    prevProps.rotationDuration === nextProps.rotationDuration
  );
});

MerkabaAvatar.displayName = 'MerkabaAvatar';

const ChatInput = memo(({ onSendMessage, disabled, isLoading }: { 
  onSendMessage: (msg: string) => void, 
  disabled: boolean,
  isLoading: boolean
}) => {
  const [localMessage, setLocalMessage] = useState('');

  const handleSubmit = (e?: React.FormEvent) => {
    e?.preventDefault();
    if (localMessage.trim() && !disabled) {
      onSendMessage(localMessage);
      setLocalMessage('');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="p-4 bg-neutral-900/80 backdrop-blur-xl border-t border-stone-800/60 rounded-b-2xl">
      <div className="relative flex items-center">
        <input
          type="text"
          value={localMessage}
          onChange={(e) => setLocalMessage(e.target.value)}
          placeholder="Input command..."
          className="w-full bg-stone-950/50 text-stone-200 placeholder-stone-600 text-sm px-4 py-3.5 rounded-xl border border-stone-800 focus:border-stone-500 focus:ring-0 transition-all pr-12 font-mono"
          disabled={disabled}
        />
        <motion.button
          type="submit"
          disabled={disabled || !localMessage.trim()}
          className="absolute right-2 p-2 bg-stone-800 hover:bg-stone-700 text-amber-500 rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed border border-stone-700 shadow-lg"
          aria-label="Send"
          whileTap={{ scale: 0.88 }}
          transition={{ duration: 0.1 }}
        >
          {isLoading ? <div className="w-4 h-4 border-2 border-stone-500 border-t-transparent rounded-full animate-spin" /> : <Send size={16} />}
        </motion.button>
      </div>
    </form>
  );
});

const MessageList = memo(({ messages, isLoading }: { messages: CoachMessage[], isLoading: boolean }) => {
  const prefersReducedMotion = useReducedMotion();

  // Strip markdown formatting from coach messages to ensure plain text display
  const cleanText = (text: string, role: string): string => {
    if (role !== 'coach') return text;

    // Remove markdown bold/italic/code
    return text
      .replace(/\*\*(.*?)\*\*/g, '$1') // Bold
      .replace(/\*(.*?)\*/g, '$1')     // Italic
      .replace(/__(.*?)__/g, '$1')     // Bold underscore
      .replace(/_(.*?)_/g, '$1')       // Italic underscore
      .replace(/`(.*?)`/g, '$1')       // Inline code
      .replace(/```[\s\S]*?```/g, ''); // Code blocks
  };

  return (
    <>
      {messages.map((msg, idx) => (
        <motion.div
          initial={prefersReducedMotion ? { opacity: 1 } : { opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          key={idx}
          className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'} animate-fade-in`}
        >
          <div className={`max-w-[85%] ${msg.role === 'user' ? 'items-end' : 'items-start'} flex flex-col`}>
            <div className={`
              px-4 py-3 text-sm leading-relaxed shadow-sm
              ${msg.role === 'user'
                ? 'bg-stone-800/80 text-stone-100 rounded-2xl rounded-tr-sm border border-stone-700/50 backdrop-blur-sm'
                : 'bg-transparent text-stone-300 border-l-2 border-stone-600 pl-4'}
            `}>
              {cleanText(msg.text, msg.role)}
            </div>
            {msg.role === 'coach' && <span className="text-[10px] text-stone-400 mt-1 uppercase tracking-widest pl-4 font-bold">Construct</span>}
          </div>
        </motion.div>
      ))}

      {isLoading && (
        <div className="flex justify-start pl-4 border-l-2 border-stone-700/50 py-2">
           <div className="flex gap-1.5">
              {prefersReducedMotion ? (
                // Static dots for reduced motion
                <>
                  <div className="w-1.5 h-1.5 bg-stone-500 rounded-full opacity-75" />
                  <div className="w-1.5 h-1.5 bg-stone-500 rounded-full opacity-75" />
                  <div className="w-1.5 h-1.5 bg-stone-500 rounded-full opacity-75" />
                </>
              ) : (
                // Animated dots for normal motion
                <>
                  <motion.div className="w-1.5 h-1.5 bg-stone-500 rounded-full" animate={{ scale: [1, 1.5, 1], opacity: [0.5, 1, 0.5] }} transition={{ duration: 1, repeat: Infinity, delay: 0 }} />
                  <motion.div className="w-1.5 h-1.5 bg-stone-500 rounded-full" animate={{ scale: [1, 1.5, 1], opacity: [0.5, 1, 0.5] }} transition={{ duration: 1, repeat: Infinity, delay: 0.2 }} />
                  <motion.div className="w-1.5 h-1.5 bg-stone-500 rounded-full" animate={{ scale: [1, 1.5, 1], opacity: [0.5, 1, 0.5] }} transition={{ duration: 1, repeat: Infinity, delay: 0.4 }} />
                </>
              )}
           </div>
        </div>
      )}
    </>
  );
});

// --- Main Component ---

interface AnimatedMerkabaCoachProps {
  userId: string;
  practiceStack: AllPractice[];
  completedCount: number;
  completionRate: number;
  timeCommitment: number;
  timeIndicator: string;
  modules: Record<ModuleKey, ModuleInfo>;
  getStreak: (practiceId: string) => number;
  practiceNotes: Record<string, string>;
  dailyNotes: Record<string, string>;
  userProfile?: {
    experienceLevel: 'beginner' | 'intermediate' | 'advanced';
    preferredIntensity: 'low' | 'moderate' | 'high' | 'variable';
    recurringPatterns?: string[];
    commonBlockers?: string[];
    practiceComplianceRate?: number;
  };
  currentTab?: ActiveTab;
  onUnlockFlabbergaster?: () => void;
  onNavigateToTab?: (tabId: string) => void;
  onAddPractice?: (practice: AllPractice) => void;
  onOpenWizard?: (wizardId: string) => void;
  onShowCelebration?: () => void;
}

type AnimationState = 'idle' | 'thinking' | 'speaking' | 'alert' | 'celebration' | 'concerned';

export default function AnimatedMerkabaCoach({
  userId,
  practiceStack,
  completedCount,
  completionRate,
  modules,
  practiceNotes,
  dailyNotes,
  userProfile,
  currentTab,
  onUnlockFlabbergaster,
  onNavigateToTab,
  onAddPractice,
  onOpenWizard,
  onShowCelebration,
}: AnimatedMerkabaCoachProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [coachResponses, setCoachResponses] = useState<CoachMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [animationState, setAnimationState] = useState<AnimationState>('idle');
  const [showSuggestionBadge, setShowSuggestionBadge] = useState(false);
  const [currentSuggestion, setCurrentSuggestion] = useState<{ text: string; module?: ModuleKey; type?: string } | null>(null);
  const [hasEverOpened, setHasEverOpened] = useState(() => {
    return StorageManager.getUntyped('aura-coach-opened') === 'true';
  });
  const chatContainerRef = useRef<HTMLDivElement>(null);
  const suggestionTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Respect user's motion preferences for accessibility
  const prefersReducedMotion = useReducedMotion();

  // Auto-scroll chat
  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [coachResponses]);

  useEffect(() => {
    return () => {
      if (suggestionTimeoutRef.current) clearTimeout(suggestionTimeoutRef.current);
    };
  }, []);

  const handleOpen = useCallback(() => {
    setIsOpen(true);
    setHasEverOpened(true);
    StorageManager.setUntyped('aura-coach-opened', 'true');
  }, []);

  const handleClearChat = useCallback(() => {
    setCoachResponses([]);
    setAnimationState('idle');
  }, []);

  const triggerCelebration = useCallback(() => {
    setAnimationState('celebration');
    setTimeout(() => setAnimationState('idle'), 3000);
  }, []);

  const showProactiveSuggestion = useCallback((text: string, module?: ModuleKey, type?: string) => {
    setCurrentSuggestion({ text, module, type });
    setShowSuggestionBadge(true);
    setAnimationState('alert');

    if (suggestionTimeoutRef.current) clearTimeout(suggestionTimeoutRef.current);
    suggestionTimeoutRef.current = setTimeout(() => {
      setShowSuggestionBadge(false);
      setCurrentSuggestion(null);
      setAnimationState('idle');
    }, 60000);
  }, []);

  const dismissSuggestion = useCallback((recordDismissal: boolean = true) => {
    if (recordDismissal && currentSuggestion) {
      coachAwarenessService.recordDismissal(currentSuggestion.type || 'user_dismissed');
    }
    setShowSuggestionBadge(false);
    setCurrentSuggestion(null);
    setAnimationState('idle');
    if (suggestionTimeoutRef.current) clearTimeout(suggestionTimeoutRef.current);
  }, [currentSuggestion]);

  const executeAction = useCallback(async (action: CoachAction) => {
    await logAnalyticsEvent(userId, 'action_executed', {
      action_type: action.type,
      payload: action.payload,
    });

    switch (action.type) {
      case 'UNLOCK_FLABBERGASTER':
        if (onUnlockFlabbergaster) {
          onUnlockFlabbergaster();
          await saveUnlock(userId, 'easter_egg', 'flabbergaster', 'conversation', { triggered_by: 'keyword_detection' });
          triggerCelebration();
        }
        break;
      case 'NAVIGATE_TO_TAB':
        if (onNavigateToTab && action.payload) onNavigateToTab(action.payload);
        break;
      case 'ADD_PRACTICE':
        if (onAddPractice && action.payload) {
          // Try fuzzy matching for better success rate
          const fuzzyResult = findPracticeFuzzy(action.payload);

          if (fuzzyResult) {
            onAddPractice(fuzzyResult.practice);

            // If fuzzy match (not exact), show confirmation
            if (!fuzzyResult.exactMatch) {
              setCoachResponses(prev => [...prev, {
                role: 'coach',
                text: `Added "${fuzzyResult.practice.name}" to your stack (matched from "${action.payload}").`
              }]);
            }
          } else {
            // Action failed - provide helpful feedback
            setCoachResponses(prev => [...prev, {
              role: 'coach',
              text: `Couldn't find a practice matching "${action.payload}". Try being more specific or check the Browse tab to see all available practices.`
            }]);
          }
        }
        break;
      case 'OPEN_WIZARD':
        if (onOpenWizard && action.payload) onOpenWizard(action.payload);
        break;
      case 'SHOW_CELEBRATION':
        triggerCelebration();
        break;
    }
  }, [userId, onUnlockFlabbergaster, onNavigateToTab, onAddPractice, onOpenWizard, triggerCelebration]);

  const handleSendMessage = useCallback(async (message: string) => {
    if (!message.trim() || isLoading) return;

    // Easter Egg Check
    const easterEggDetection = detectEasterEggKeyword(message);
    if (easterEggDetection) {
      setCoachResponses(prev => [...prev.slice(-(MAX_COACH_MESSAGES - 2)), 
        { role: 'user', text: message },
        { role: 'coach', text: easterEggDetection.response }
      ]);
      await executeAction(easterEggDetection.action);
      await saveConversationHybrid(userId, 'coach', easterEggDetection.response, true, easterEggDetection.action.type, easterEggDetection.action.payload);
      return;
    }

    // Intent Check
    const userIntent = detectUserIntent(message);
    if (userIntent) {
      const responseText = 'On it!';
      setCoachResponses(prev => [...prev.slice(-(MAX_COACH_MESSAGES - 2)), 
        { role: 'user', text: message },
        { role: 'coach', text: responseText }
      ]);
      await executeAction(userIntent);
      await saveConversationHybrid(userId, 'coach', responseText, true, userIntent.type, userIntent.payload);
      return;
    }

    // Regular AI response
    setCoachResponses(prev => [...prev.slice(-(MAX_COACH_MESSAGES - 1)), { role: 'user', text: message }]);
    setIsLoading(true);
    setAnimationState('thinking');

    try {
        const context: CoachContext = {
            practiceStack: practiceStack.map(p => ({
              id: p.id,
              name: p.name,
              module: 'isCustom' in p && p.isCustom ? p.module : undefined,
            })),
            completedCount,
            completionRate,
            timeCommitment: practiceStack.reduce((sum, p) => sum + p.timePerWeek, 0),
            timeIndicator: 'Balanced',
            modules: Object.entries(modules).reduce((acc, [key, mod]) => {
              const count = practiceStack.filter(p => {
                if ('isCustom' in p && p.isCustom) return p.module === key;
                const practiceModule = (Object.keys(practices) as ModuleKey[]).find(mKey =>
                  practices[mKey].some(pr => pr.id === p.id)
                );
                return practiceModule === key;
              }).length;
              acc[key] = { name: mod.name, count };
              return acc;
            }, {} as Record<string, { name: string; count: number }>),
            practiceNotes,
            dailyNotes,
            userProfile,
          };

      const result = await generateCoachResponse(
        context,
        message,
        coachResponses.slice(-MAX_COACH_MESSAGES),
        undefined,
      );

      if (!result.success) throw new Error(result.error || 'Failed');

      const actionParse = parseCoachActions(result.text);
      setCoachResponses(prev => [...prev.slice(-(MAX_COACH_MESSAGES - 1)), {
        role: 'coach',
        text: actionParse.cleanedResponse
      }]);

      if (actionParse.hasAction && actionParse.action) {
        await executeAction(actionParse.action);
        await saveConversationHybrid(userId, 'coach', actionParse.cleanedResponse, true, actionParse.action.type, actionParse.action.payload);
      }

      setAnimationState('speaking');
      setTimeout(() => setAnimationState('idle'), 2000);
    } catch (error) {
      console.error('Coach error:', error);
      setCoachResponses(prev => [...prev.slice(-(MAX_COACH_MESSAGES - 1)), {
        role: 'coach',
        text: "I'm having trouble connecting to the field right now."
      }]);
      setAnimationState('concerned');
      setTimeout(() => setAnimationState('idle'), 2000);
    } finally {
      setIsLoading(false);
    }
  }, [isLoading, practiceStack, completedCount, completionRate, modules, practiceNotes, dailyNotes, userProfile, coachResponses, userId, executeAction]);

  // --- Awareness Proactivity ---
  useEffect(() => {
    // Proactive check every 30s
    const checkForInterventions = () => {
      if (isOpen || showSuggestionBadge) return;

      // Only trigger proactivity on Hub-level tabs to avoid interrupting deep work
      const hubTabs = ['dashboard', 'stack', 'practice-hub', 'learn-hub', 'tools', 'insights', 'journal', 'shadow-tools'];
      if (currentTab && !hubTabs.includes(currentTab)) return;

      const awarenessContext: AwarenessContext = {
        currentTab: currentTab || 'dashboard',
        practiceStack,
        completedCount,
        completionRate,
        modules: Object.entries(modules).reduce((acc, [key, mod]) => {
          const count = practiceStack.filter(p => {
            if ('isCustom' in p && p.isCustom) return p.module === key;
            const practiceModule = (Object.keys(practices) as ModuleKey[]).find(mKey =>
              practices[mKey].some(pr => pr.id === p.id)
            );
            return practiceModule === key;
          }).length;
          if (count > 0) acc[key as ModuleKey] = { name: mod.name, count };
          return acc;
        }, {} as Record<ModuleKey, { name: string; count: number }>),
        sessionDuration: 0,
        timeOfDay: 'morning', 
      };

      const intervention = coachAwarenessService.calculateInterventionScore(awarenessContext);
      if (intervention) {
        showProactiveSuggestion(intervention.suggestedAction.message, intervention.suggestedAction.metadata?.module, intervention.suggestedAction.type);
      }
    };

    const interval = setInterval(checkForInterventions, 120000);
    return () => clearInterval(interval);
  }, [isOpen, showSuggestionBadge, currentTab, practiceStack, completedCount, completionRate, modules, showProactiveSuggestion]);

  // Immediate shadow onboarding check on tab entry — bypasses global cooldown
  useEffect(() => {
    if (currentTab !== 'shadow-tools' || isOpen || showSuggestionBadge) return;
    const timeout = setTimeout(() => {
      const result = coachAwarenessService.getDirectShadowOnboarding();
      if (result) {
        showProactiveSuggestion(result.message, 'shadow', result.type);
      }
    }, 3000); // 3s after entering tab to let content settle
    return () => clearTimeout(timeout);
  }, [currentTab, isOpen, showSuggestionBadge, showProactiveSuggestion]);

  // --- Dynamic Lighting Mapping ---
  const getThemeColors = useCallback(() => {
    // Default Alchemical Void colors
    let primary = '#fb923c'; // Orange (Body)
    let secondary = '#a855f7'; // Purple (Shadow)

    if (!currentTab) return { primary, secondary };

    if (currentTab.includes('body')) {
      primary = '#fb923c'; // Orange
      secondary = '#f97316';
    } else if (currentTab.includes('mind')) {
      primary = '#fbbf24'; // Amber (matches module system)
      secondary = '#14b8a6'; // Teal
    } else if (currentTab.includes('spirit')) {
      primary = '#facc15'; // Yellow
      secondary = '#14b8a6';
    } else if (currentTab.includes('shadow')) {
      primary = '#c084fc'; // Purple
      secondary = '#a855f7';
    } else if (currentTab === 'dashboard' || currentTab === 'stack') {
      primary = '#fb923c'; // Balanced/Mixed
      secondary = '#c084fc';
    }

    return { primary, secondary };
  }, [currentTab]);

  const themeColors = getThemeColors();

  // Aesthetic Constants
  const PRIMARY_COLOR = '#fb923c';
  const SECONDARY_COLOR = '#a855f7';

  const getModuleColor = (module?: ModuleKey) => {
    switch (module) {
      case 'mind': return { text: 'text-teal-400', border: 'border-teal-500/30', bg: 'bg-teal-500/10', shadow: 'shadow-cyan-500/20' };
      case 'body': return { text: 'text-emerald-400', border: 'border-emerald-500/30', bg: 'bg-emerald-500/10', shadow: 'shadow-emerald-500/20' };
      case 'spirit': return { text: 'text-amber-400', border: 'border-amber-500/30', bg: 'bg-amber-500/10', shadow: 'shadow-amber-500/20' };
      case 'shadow': return { text: 'text-purple-400', border: 'border-purple-500/30', bg: 'bg-purple-500/10', shadow: 'shadow-purple-500/20' };
      default: return { text: 'text-amber-500', border: 'border-amber-500/30', bg: 'bg-amber-500/10', shadow: 'shadow-amber-500/20' };
    }
  };

  const getRotationDuration = useCallback(() => {
    switch (animationState) {
      case 'thinking': return 2;
      case 'speaking': return 4;
      case 'celebration': return 1;
      case 'alert': return 0.5;
      default: return 20;
    }
  }, [animationState]);

  const sugColor = getModuleColor(currentSuggestion?.module);

  return (
    <>
      <AnimatePresence>
        {!isOpen && (
          <motion.div
            key="button-view"
            className="fixed right-4 sm:right-8 z-[70]"
            style={{ bottom: 'max(6rem, calc(env(safe-area-inset-bottom) + 2rem))' }}
            initial={prefersReducedMotion ? {} : { opacity: 0, scale: 0.85 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={prefersReducedMotion ? {} : { opacity: 0, scale: 0.85 }}
            transition={{ duration: 0.2, ease: [0.25, 1, 0.5, 1] }}
          >
        <AnimatePresence>
          {/* Initial Greeting Bubble or Proactive Suggestion */}
          {(showSuggestionBadge && currentSuggestion) ? (
            <motion.div
              initial={prefersReducedMotion ? { opacity: 1 } : { opacity: 0, y: 10, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={prefersReducedMotion ? { opacity: 0 } : { opacity: 0, y: 10, scale: 0.9 }}
              className={`absolute bottom-full right-0 mb-4 w-72 ${effects.glassDark} ${sugColor.border} rounded-xl p-4 ${effects.shadowLarge} backdrop-blur-xl pointer-events-auto`}
            >
              <div className="flex items-start gap-3 relative z-10">
                <div className={`w-8 h-8 rounded-full ${sugColor.bg} flex items-center justify-center border ${sugColor.border} flex-shrink-0 ${prefersReducedMotion ? '' : 'animate-pulse-slow'}`}>
                  {currentSuggestion.module === 'mind' ? <Brain size={14} className={sugColor.text} /> :
                   currentSuggestion.module === 'body' ? <LightningPathIcon size={14} className={sugColor.text} /> :
                   currentSuggestion.module === 'spirit' ? <Heart size={14} className={sugColor.text} /> :
                   currentSuggestion.module === 'shadow' ? <Ghost size={14} className={sugColor.text} /> :
                   <ResonanceFieldIcon size={14} className={sugColor.text} />}
                </div>
                <div className="flex-1">
                  <p className={`${typography.label} ${sugColor.text} mb-1 uppercase tracking-wider font-bold drop-shadow-sm`}>
                    {currentSuggestion.module ? `${currentSuggestion.module} Insight` : 'Insight Available'}
                  </p>
                  <p className={`${typography.caption} text-stone-100 leading-relaxed drop-shadow-sm`}>{currentSuggestion.text}</p>
                </div>
                <button onClick={() => dismissSuggestion(true)} className="text-stone-500 hover:text-stone-100 transition-colors p-1" aria-label="Dismiss"><X size={14} /></button>
              </div>
              <div className="mt-3 flex gap-2 relative z-10">
                <button onClick={() => { handleOpen(); dismissSuggestion(false); }} className={`${buttonSystem.styles.primary} !py-1.5 flex-1 text-xs`}>Connect</button>
                <button onClick={() => dismissSuggestion(true)} className={`${buttonSystem.styles.ghost} !py-1.5 flex-1 text-xs`}>Later</button>
              </div>
            </motion.div>
          ) : !hasEverOpened && (
            <motion.div
              initial={prefersReducedMotion ? { opacity: 1 } : { opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={prefersReducedMotion ? {} : { delay: 5 }}
              className={`absolute bottom-1/2 right-full mr-4 whitespace-nowrap ${effects.glassDark} border border-stone-700/50 rounded-full px-4 py-2 ${effects.shadowMedium} backdrop-blur-md pointer-events-auto`}
            >
              <p className={`${typography.caption} text-stone-300 font-medium flex items-center gap-2`}>
                <Orbit size={14} className={`text-amber-500 ${prefersReducedMotion ? '' : 'animate-spin-slow'}`} />
                How can I guide your practice today?
              </p>
            </motion.div>
          )}
        </AnimatePresence>

        <motion.button
          onClick={handleOpen}
          className="relative group outline-none w-[72px] md:w-[120px] h-[72px] md:h-[120px]"
          whileHover={prefersReducedMotion ? {} : { scale: 1.05 }}
          whileTap={prefersReducedMotion ? {} : { scale: 0.95 }}
          aria-label="Open AI Coach"
        >
          <motion.div 
            className="absolute inset-0 rounded-full blur-3xl transition-all duration-700 opacity-20 group-hover:opacity-40" 
            style={{ backgroundColor: themeColors.primary }}
          />
          <MerkabaAvatar 
            animationState={animationState} 
            primaryColor={themeColors.primary} 
            secondaryColor={themeColors.secondary} 
            rotationDuration={getRotationDuration()} 
          />
          <motion.div
            className="absolute inset-0 rounded-full border"
            style={{ borderColor: `${themeColors.primary}30` }}
            initial={{ scale: 0.8, opacity: 0 }}
            whileHover={{ scale: 1.1, opacity: 1 }}
            transition={{ duration: 0.3 }}
          />
        </motion.button>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            key="chat-panel"
            className={`fixed bottom-0 left-0 right-0 sm:bottom-6 sm:right-6 sm:left-auto sm:w-[420px] sm:max-w-md w-full h-[85dvh] sm:h-[700px] max-h-[85dvh] sm:rounded-2xl rounded-t-2xl flex flex-col z-[60] bg-neutral-950/90 backdrop-blur-2xl border border-stone-800/60 ${effects.shadowLarge} overflow-hidden`}
            role="dialog"
            aria-modal="true"
            aria-labelledby="coach-dialog-title"
            initial={prefersReducedMotion ? {} : { opacity: 0, y: 48 }}
            animate={{ opacity: 1, y: 0 }}
            exit={prefersReducedMotion ? {} : { opacity: 0, y: 48 }}
            transition={{ duration: 0.32, ease: [0.25, 1, 0.5, 1] }}
            onKeyDown={(e) => {
              if (e.key === 'Escape') {
                setIsOpen(false);
              }
            }}
          >
      <h2 id="coach-dialog-title" className="sr-only">AI Practice Coach</h2>
      <div className="sticky top-0 z-10 bg-neutral-900/50 p-4 flex items-center justify-between border-b border-stone-800/60 backdrop-blur-md">

        <div className="flex items-center gap-3">
          <div className="w-8 h-8 flex items-center justify-center rounded-lg bg-gradient-to-br from-neutral-800 to-neutral-900 border border-white/10 shadow-inner">
            <Bot size={18} className="text-stone-300" />
          </div>
          <div>
            <h3 className={`${typography.h5} text-stone-100 font-serif tracking-wide`}>Construct</h3>
            <div className="flex items-center gap-1.5">
              <span className={`w-1.5 h-1.5 rounded-full ${animationState === 'thinking' ? 'bg-amber-400 animate-pulse' : 'bg-emerald-500'} `} />
              <span className="text-[10px] text-stone-400 uppercase tracking-widest font-medium">
                {animationState === 'thinking' ? 'Syncing...' : 'Field Active'}
              </span>
            </div>
          </div>
        </div>
        <div className="flex gap-1">
          <button onClick={handleClearChat} className="p-2 text-stone-500 hover:text-red-400 transition-colors rounded-md hover:bg-white/5" aria-label="Clear conversation"><Trash2 size={16} /></button>
          <button onClick={() => setIsOpen(false)} className="p-2 text-stone-500 hover:text-white transition-colors rounded-md hover:bg-white/5" aria-label="Close coach"><X size={16} /></button>
        </div>
      </div>

      <div ref={chatContainerRef} className="flex-1 overflow-y-auto p-5 space-y-6 scrollbar-thin scrollbar-thumb-stone-800 scrollbar-track-transparent">
        {coachResponses.length === 0 && (
          <div className="flex flex-col items-center justify-center h-full text-center px-6 opacity-60 space-y-6">
            <div className="w-20 h-20 relative">
                 <motion.div
                   className="absolute inset-0 border border-stone-700/50 rounded-full"
                   animate={prefersReducedMotion ? {} : { scale: [1, 1.1, 1], opacity: [0.3, 0.5, 0.3] }}
                   transition={prefersReducedMotion ? {} : { duration: 4, repeat: Infinity }}
                 />
                 <motion.div
                   className="absolute inset-2 border border-stone-600/50 rounded-full"
                   animate={prefersReducedMotion ? {} : { rotate: 360 }}
                   transition={prefersReducedMotion ? {} : { duration: 20, repeat: Infinity, ease: "linear" }}
                   style={{ borderStyle: 'dashed' }}
                 />
                 <div className="absolute inset-0 flex items-center justify-center"><Brain className="text-stone-500" size={24} /></div>
            </div>
            <div>
                <p className={`${typography.body} text-stone-300 mb-2`}>How can I support your practice?</p>
                <p className={`${typography.caption} text-stone-500 max-w-[240px] leading-relaxed mx-auto`}>I can analyze your streaks, suggest shadow work, or guide you through the AQAL model.</p>
            </div>
                        <div className="grid grid-cols-1 gap-2 w-full max-w-[280px] pt-4">
                          {[
                            { icon: History, label: 'Where am I in my practice?', cmd: 'Give me an honest read of where I am in my practice — consistency, balance, blind spots.' },
                            { icon: Layout, label: 'What should I add to my stack?', cmd: 'What gaps or imbalances do you see in my current practice stack? What would you add?' },
                            { icon: Brain, label: "I'm stuck — help me move", cmd: "I feel stuck in my development and not sure why. Help me identify what's blocking me." },
                            { icon: ResonanceFieldIcon, label: 'Which wizard should I try?', cmd: 'Based on where I am, which guided practice would be most useful for me right now?' },
                          ].map((item, i) => (
                            <motion.button
                              key={i}
                              onClick={() => handleSendMessage(item.cmd)}
                              className="flex items-center gap-3 px-4 py-3 rounded-xl bg-stone-900/80 border border-stone-700/50 hover:border-amber-500/50 hover:bg-stone-800/80 transition-all group text-left"
                              initial={prefersReducedMotion ? {} : { opacity: 0, y: 8 }}
                              animate={{ opacity: 1, y: 0 }}
                              transition={{ delay: 0.15 + i * 0.08, duration: 0.3, ease: [0.25, 1, 0.5, 1] }}
                              whileTap={prefersReducedMotion ? {} : { scale: 0.97 }}
                            >
                              <item.icon size={15} className="text-stone-400 group-hover:text-amber-400 transition-colors shrink-0" />
                              <span className="text-xs text-stone-200 group-hover:text-white font-medium tracking-wide leading-snug">{item.label}</span>
                            </motion.button>
                          ))}
                        </div>
          </div>
        )}
        <MessageList messages={coachResponses} isLoading={isLoading} />
      </div>

      <ChatInput onSendMessage={handleSendMessage} disabled={isLoading} isLoading={isLoading} />
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}