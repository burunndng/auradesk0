// Music Visualization Renderer
// High-performance WebGL/Canvas-based audio visualizer
// Spectral analysis and fluid dynamics rendering

import { useEffect, useRef, useMemo } from 'react';
import { useAudioStore } from '@/hooks/useAudioStore';

interface MusicVizRendererProps {
  mode?: 'SPECTRO' | 'FLUID' | 'NEBULA' | 'PARTICLES';
  quality?: 'low' | 'medium' | 'high';
  adaptiveRes?: boolean;
}

export default function MusicVizRenderer({ 
  mode = 'SPECTRO', 
  quality = 'high',
  adaptiveRes = true 
}: MusicVizRendererProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const audioStore = useAudioStore();
  const animationFrameRef = useRef<number>(0);
  const analyserRef = useRef<AudioAnalyserNode | null>(null);
  const lastUpdateRef = useRef<number>(0);
  
  const settings = useMemo(() => {
    const base = {
      SPECTRO: {
        fftSize: 1024,
        binCount: 256,
        barWidth: adaptiveRes ? 3 : 2,
        barSpacing: adaptiveRes ? 2 : 1,
        glowIntensity: adaptiveRes ? 0.8 : 0.6,
      },
      FLUID: {
        particleCount: adaptiveRes ? 150 : 100,
        turbulence: 0.01,
        attractSpeed: 0.02,
      },
      NEBULA: {
        starCount: adaptiveRes ? 200 : 150,
        coreRadius: adaptiveRes ? 120 : 100,
        swirlSpeed: adaptiveRes ? 0.015 : 0.01,
      },
      PARTICLES: {
        particleCount: adaptiveRes ? 300 : 200,
        trailLength: adaptiveRes ? 60 : 40,
        gravity: adaptiveRes ? 0.4 : 0.3,
      }
    };
    return base[mode];
  }, [mode, adaptiveRes]);

  // Initialize Web Audio API
  useEffect(() => {
    if (!audioStore.audioContext || !audioStore.gainNode) return;
    
    const setupAnalyser = () => {
      const analyser = audioStore.audioContext.createAnalyser();
      analyser.fftSize = settings.fftSize;
      analyser.smoothingTimeConstant = 0.5;
      
      const source = audioStore.gainNode;
      source.connect(analyser);
      analyser.connect(audioStore.audioContext.destination);
      
      analyserRef.current = analyser;
    };

    setupAnalyser();

    return () => {
      if (analyserRef.current) {
        analyserRef.current.disconnect();
      }
    };
  }, [audioStore.audioContext, audioStore.gainNode, settings]);

  // Main render loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const gl = canvas.getContext('2d');
    if (!gl) return;

    const updateVisuals = (timestamp: number) => {
      const now = timestamp;
      const deltaTime = now - lastUpdateRef.current;
      lastUpdateRef.current = now;

      // Get current audio data
      if (analyserRef.current) {
        const dataArray = new Uint8Array(analyserRef.current.frequencyBinCount);
        analyserRef.current.getByteFrequencyData(dataArray);
        
        // Process based on mode
        switch (mode) {
          case 'SPECTRO':
            renderSpectrum(gl, dataArray, settings as typeof settings.SPECTRO);
            break;
          case 'FLUID':
            renderFluid(gl, dataArray, settings as typeof settings.FLUID, deltaTime);
            break;
          case 'NEBULA':
            renderNebula(gl, dataArray, settings as typeof settings.NEBULA, deltaTime);
            break;
          case 'PARTICLES':
            renderParticles(gl, dataArray, settings as typeof settings.PARTICLES, deltaTime);
            break;
        }
      }

      animationFrameRef.current = requestAnimationFrame(updateVisuals);
    };

    animationFrameRef.current = requestAnimationFrame(updateVisuals);

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [mode, settings, audioStore.audioContext, audioStore.gainNode]);

  // Handle resize and quality changes
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const resizeCanvas = () => {
      const parent = canvas.parentElement;
      if (parent) {
        canvas.width = parent.clientWidth * window.devicePixelRatio;
        canvas.height = parent.clientHeight * window.devicePixelRatio;
        gl?.scale(window.devicePixelRatio, window.devicePixelRatio);
      }
    };

    const observer = new ResizeObserver(resizeCanvas);
    observer.observe(canvas.parentElement as Element);
    
    resizeCanvas();

    return () => {
      observer.disconnect();
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="w-full h-full"
      style={{
        imageRendering: quality === 'low' ? 'auto' : 'crisp-edges',
        willChange: 'transform',
      }}
    />
  );
}

// Individual renderer functions
function renderSpectrum(gl: CanvasRenderingContext2D, data: Uint8Array, settings: any) {
  const { binCount, barWidth, barSpacing, glowIntensity } = settings;
  const centerX = gl.canvas.width / 2;
  const centerY = gl.canvas.height / 2;
  const maxBarHeight = Math.min(gl.canvas.height, gl.canvas.width) / 2;

  gl.clearRect(0, 0, gl.canvas.width, gl.canvas.height);

  // Draw spectral bars
  for (let i = 0; i < binCount; i++) {
    const bin = Math.floor((i / binCount) * data.length);
    const value = data[bin] / 255;
    const barHeight = value * maxBarHeight;
    const angle = (i / binCount) * Math.PI * 2 - Math.PI / 2;
    const x = centerX + Math.cos(angle) * (centerX - 40);
    const y = centerY + Math.sin(angle) * (centerY - 40);

    // Draw bar with glow
    const gradient = gl.createRadialGradient(x, y, 0, x, y, barHeight);
    gradient.addColorStop(0, `rgba(127, 161, 255, ${glowIntensity})`);
    gradient.addColorStop(1, `rgba(216, 178, 106, ${value * 0.3})`);
    
    gl.fillStyle = gradient;
    gl.beginPath();
    gl.ellipse(x, y, barWidth, barHeight, 0, 0, Math.PI * 2);
    gl.fill();
  }
}

function renderFluid(gl: CanvasRenderingContext2D, data: Uint8Array, settings: any, deltaTime: number) {
  // Basic fluid simulation with audio influences
  gl.clearRect(0, 0, gl.canvas.width, gl.canvas.height);
  
  // Render fluid particles influenced by bass frequencies
  const centerX = gl.canvas.width / 2;
  const centerY = gl.canvas.height / 2;
  
  const bassAvg = data.slice(0, 32).reduce((a, b) => a + b, 0) / 32 / 255;
  
  for (let i = 0; i < settings.particleCount; i++) {
    const angle = (Math.PI * 2 * i) / settings.particleCount;
    const radius = 100 + bassAvg * 50 * Math.sin(Date.now() * settings.turbulence + i);
    const x = centerX + Math.cos(angle) * radius;
    const y = centerY + Math.sin(angle) * radius;
    
    const gradient = gl.createRadialGradient(x, y, 0, x, y, 3);
    gradient.addColorStop(0, `rgba(216, 178, 106, ${bassAvg * 0.8})`);
    gradient.addColorStop(1, `rgba(216, 178, 106, 0)`);
    
    gl.fillStyle = gradient;
    gl.beginPath();
    gl.arc(x, y, 3, 0, Math.PI * 2);
    gl.fill();
  }
}

function renderNebula(gl: CanvasRenderingContext2D, data: Uint8Array, settings: any, deltaTime: number) {
  gl.clearRect(0, 0, gl.canvas.width, gl.canvas.height);
  
  const centerX = gl.canvas.width / 2;
  const centerY = gl.canvas.height / 2;
  const time = Date.now() * settings.swirlSpeed;

  // Draw nebula core
  const coreGradient = gl.createRadialGradient(
    centerX, centerY, 0,
    centerX, centerY, settings.coreRadius
  );
  coreGradient.addColorStop(0, 'rgba(127, 161, 255, 0.8)');
  coreGradient.addColorStop(1, 'rgba(127, 161, 255, 0)');
  
  gl.fillStyle = coreGradient;
  gl.beginPath();
  gl.ellipse(centerX, centerY, settings.coreRadius, settings.coreRadius, 0, 0, Math.PI * 2);
  gl.fill();

  // Draw swirling particles
  const hueShift = (data[0] / 255) * 360;
  for (let i = 0; i < settings.starCount; i++) {
    const angle = (Math.PI * 2 * i) / settings.starCount + time * 0.2;
    const radius = settings.coreRadius * (0.5 + Math.random() * 1.5);
    const x = centerX + Math.cos(angle) * radius;
    const y = centerY + Math.sin(angle) * radius;
    
    const starSize = 1 + Math.random() * 2;
    gl.fillStyle = `hsla(${(hueShift + i * 30) % 360}, 70%, 50%, ${0.4 + Math.random() * 0.3})`;
    
    gl.beginPath();
    gl.arc(x, y, starSize, 0, Math.PI * 2);
    gl.fill();
  }
}

function renderParticles(gl: CanvasRenderingContext2D, data: Uint8Array, settings: any, deltaTime: number) {
  gl.clearRect(0, 0, gl.canvas.width, gl.canvas.height);
  
  const centerX = gl.canvas.width / 2;
  const centerY = gl.canvas.height / 2;
  const trailIntensity = data[64] / 255;

  // Particle system with trails
  const particles: Array<{x: number, y: number, vx: number, vy: number, life: number}> = [];
  
  // Add new particles based on audio energy
  const particleCount = Math.floor(settings.particleCount * (0.5 + trailIntensity * 0.8));
  for (let i = 0; i < particleCount; i++) {
    const angle = Math.random() * Math.PI * 2;
    const speed = 1 + Math.random() * 3;
    particles.push({
      x: centerX,
      y: centerY,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed,
      life: 1.0
    });
  }

  // Update and render particles
  for (let i = 0; i < particles.length; i++) {
    const p = particles[i];
    
    // Update position
    p.x += p.vx;
    p.y += p.vy;
    p.vy += settings.gravity;
    p.life *= 0.992;
    
    // Apply drag
    p.vx *= 0.96;
    p.vy *= 0.96;
    
    // Wrap around edges
    if (p.x < 0) p.x = gl.canvas.width;
    if (p.x > gl.canvas.width) p.x = 0;
    if (p.y < 0) p.y = gl.canvas.height;
    if (p.y > gl.canvas.height) p.y = 0;

    // Draw particle with trail effect
    const alpha = p.life;
    const size = 2 + p.life * 4;
    
    gl.fillStyle = `rgba(127, 161, 255, ${alpha})`;
    gl.beginPath();
    gl.arc(p.x, p.y, size, 0, Math.PI * 2);
    gl.fill();
  }
}