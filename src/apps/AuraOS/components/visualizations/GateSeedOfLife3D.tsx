import React, { useRef, useEffect } from 'react';
import { Renderer, Program, Mesh, Triangle } from 'ogl';

interface DissolveSignal {
  progress: number;
}

interface GateSeedOfLife3DProps {
  dissolveSignal?: React.MutableRefObject<DissolveSignal>;
}

const VERT_SRC = /* glsl */ `
attribute vec2 position;
attribute vec2 uv;
void main() {
  gl_Position = vec4(position, 0.0, 1.0);
}
`;

const FRAG_SRC = /* glsl */ `
precision highp float;
uniform float uTime;
uniform float uProgress;
uniform vec2 uResolution;
#define TAU 6.283185307
#define R 0.38
#define LINE_T 0.004
#define GLOW_T 0.04

float sdRing(vec2 p, vec2 c, float r) {
  return abs(length(p - c) - r);
}

void main() {
  vec2 uv = (gl_FragCoord.xy / uResolution) * 2.0 - 1.0;
  uv.x *= uResolution.x / uResolution.y;

  float speed = (1.0 + uProgress * 3.0) * (TAU / 200.0);
  float a = uTime * speed;
  uv = mat2(cos(a), -sin(a), sin(a), cos(a)) * uv;

  float d = 1e9;
  d = min(d, sdRing(uv, vec2(0.0), R));
  for (int i = 0; i < 6; i++) {
    float ang = float(i) * TAU / 6.0;
    d = min(d, sdRing(uv, vec2(cos(ang), sin(ang)) * R, R));
  }

  float baseAlpha = 0.04 + uProgress * 0.12;
  float ring = (1.0 - smoothstep(0.0, LINE_T, d)) * baseAlpha;
  float glow = (1.0 - smoothstep(0.0, GLOW_T, d)) * baseAlpha * 0.3;
  float alpha = max(ring, glow);

  vec3 goldMid   = vec3(0.863, 0.765, 0.502);
  vec3 goldLight = vec3(0.941, 0.882, 0.647);
  vec3 color = mix(goldMid, goldLight, uProgress);

  gl_FragColor = vec4(color, alpha);
}
`;

export default function GateSeedOfLife3D({ dissolveSignal }: GateSeedOfLife3DProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const reducedMotion =
    typeof window !== 'undefined' &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  useEffect(() => {
    if (reducedMotion) return;
    const canvas = canvasRef.current!;
    const isMobile = window.innerWidth < 640;

    const renderer = new Renderer({
      canvas,
      alpha: true,
      premultipliedAlpha: false,
      dpr: isMobile ? 1.5 : Math.min(window.devicePixelRatio || 1, 3),
    });
    renderer.setSize(window.innerWidth, window.innerHeight);

    const geometry = new Triangle(renderer.gl);

    const program = new Program(renderer.gl, {
      vertex: VERT_SRC,
      fragment: FRAG_SRC,
      uniforms: {
        uTime:       { value: 0 },
        uProgress:   { value: 0 },
        uResolution: { value: [window.innerWidth, window.innerHeight] },
      },
      transparent: true,
      depthTest: false,
    });

    const mesh = new Mesh(renderer.gl, { geometry, program });

    let rafId: number;
    let lastT = 0;
    let slowCount = 0;

    function frame(t: number) {
      const delta = t - lastT;
      lastT = t;
      if (delta > 50) {
        if (++slowCount > 10) renderer.dpr = 1;
      } else {
        slowCount = Math.max(0, slowCount - 1);
      }

      program.uniforms.uTime.value = (t / 1000) % 2000;
      program.uniforms.uProgress.value = dissolveSignal?.current?.progress ?? 0;
      renderer.render({ scene: mesh });
      rafId = requestAnimationFrame(frame);
    }
    rafId = requestAnimationFrame(frame);

    const onResize = () => {
      renderer.dpr = window.innerWidth < 640 ? 1.5 : Math.min(window.devicePixelRatio || 1, 3);
      renderer.setSize(window.innerWidth, window.innerHeight);
      program.uniforms.uResolution.value = [window.innerWidth, window.innerHeight];
    };
    window.addEventListener('resize', onResize);

    return () => {
      cancelAnimationFrame(rafId);
      window.removeEventListener('resize', onResize);
      renderer.gl.getExtension('WEBGL_lose_context')?.loseContext();
    };
  }, []); // dissolveSignal is a stable ref — no dep needed

  if (reducedMotion) return null;

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      style={{ position: 'fixed', inset: 0, zIndex: 0, pointerEvents: 'none' }}
    />
  );
}
