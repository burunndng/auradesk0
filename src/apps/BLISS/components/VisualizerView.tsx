import React, { useRef, useEffect, useState, useCallback } from 'react';
import * as THREE from 'three';
import { vizAudio } from '../lib/vizAudio';
import { vizModes } from '../lib/shaders/modes';
import { useDaw } from '../context/DawContext';
import { clock } from '../audio/clock';
import { Eye, Play, Shuffle } from 'lucide-react';

// ── PingPong: lock-free SPSC render-target pair for sim modes ──────────────
class PingPong {
  private targets: [THREE.WebGLRenderTarget, THREE.WebGLRenderTarget];
  private idx = 0;
  public size: { w: number; h: number };

  constructor(
    private renderer: THREE.WebGLRenderer,
    w: number, h: number,
  ) {
    const opts: THREE.RenderTargetOptions = {
      depthBuffer: false,
      stencilBuffer: false,
      magFilter: THREE.LinearFilter,
      minFilter: THREE.LinearFilter,
      wrapS: THREE.RepeatWrapping,
      wrapT: THREE.RepeatWrapping,
    };
    this.targets = [
      new THREE.WebGLRenderTarget(w, h, opts),
      new THREE.WebGLRenderTarget(w, h, opts),
    ];
    this.size = { w, h };
  }

  get current() { return this.targets[this.idx]; }
  get previous() { return this.targets[1 - this.idx]; }
  get texture() { return this.current.texture; }

  swap() { this.idx = 1 - this.idx; }

  resize(w: number, h: number) {
    if (w === this.size.w && h === this.size.h) return;
    this.targets[0].setSize(w, h);
    this.targets[1].setSize(w, h);
    this.size = { w, h };
  }

  dispose() {
    this.targets[0].dispose();
    this.targets[1].dispose();
  }
}

export const VisualizerView: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { playing } = useDaw();

  const [mode, setMode] = useState(0);
  const [palette, setPalette] = useState(1);
  const [complexity, setComplexity] = useState(0.5);
  const [symmetry, setSymmetry] = useState(6);
  const [reactivity, setReactivity] = useState(1.2);
  const [autopilot, setAutopilot] = useState(false);
  const [autoProgress, setAutoProgress] = useState(0);

  // Refs for live values inside RAF loop
  const modeRef = useRef(mode);
  const palRef = useRef(palette);
  const compRef = useRef(complexity);
  const symRef = useRef(symmetry);
  const reactRef = useRef(reactivity);
  const autoRef = useRef(autopilot);
  const mouseRef = useRef({ x: 0.5, y: 0.5 });

  useEffect(() => { modeRef.current = mode; }, [mode]);
  useEffect(() => { palRef.current = palette; }, [palette]);
  useEffect(() => { compRef.current = complexity; }, [complexity]);
  useEffect(() => { symRef.current = symmetry; }, [symmetry]);
  useEffect(() => { reactRef.current = reactivity; }, [reactivity]);
  useEffect(() => { autoRef.current = autopilot; }, [autopilot]);

  // Autopilot: cycle modes every 16 bars (clock-driven) or 30s fallback
  useEffect(() => {
    if (!autopilot) return;
    let stepCount = 0;
    let timer: ReturnType<typeof setTimeout> | null = null;

    const advance = () => {
      setMode(prev => (prev + 1) % vizModes.length);
      stepCount = 0;
      setAutoProgress(0);
    };

    if (playing) {
      const unsub = clock.onStep(() => {
        stepCount++;
        if (stepCount % 256 === 0) advance(); // 16 bars
        setAutoProgress((stepCount % 256) / 256);
      });
      return () => { unsub(); };
    } else {
      const interval = 30000;
      const start = Date.now();
      timer = setInterval(() => {
        advance();
      }, interval);
      const progTimer = setInterval(() => {
        setAutoProgress((Date.now() - start) % interval / interval);
      }, 500);
      return () => { clearInterval(timer); clearInterval(progTimer); };
    }
  }, [autopilot, playing]);

  // Manual mode override pauses autopilot for 2 cycles
  const handleModeClick = useCallback((idx: number) => {
    setMode(idx);
    setAutoProgress(0);
  }, []);

  // Three.js setup + RAF loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const renderer = new THREE.WebGLRenderer({ canvas, antialias: false, alpha: false });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

    const scene = new THREE.Scene();
    const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);

    // DataTextures
    const waveData = new Uint8Array(256 * 4);
    const waveTex = new THREE.DataTexture(waveData, 256, 1, THREE.RGBAFormat);
    waveTex.needsUpdate = true;

    const specData = new Uint8Array(256 * 4);
    const specTex = new THREE.DataTexture(specData, 256, 1, THREE.RGBAFormat);
    specTex.needsUpdate = true;

    const uniforms: Record<string, { value: any }> = {
      uTime: { value: 0 },
      uResolution: { value: new THREE.Vector2(window.innerWidth, window.innerHeight) },
      uSpeed: { value: 1.0 },
      uComplexity: { value: 0.5 },
      uSymmetry: { value: 6 },
      uPalette: { value: 1 },
      uPlanform: { value: 0 },
      uMouse: { value: new THREE.Vector2(0.5, 0.5) },
      uReactivity: { value: 1.2 },
      uBass: { value: 0 },
      uMid: { value: 0 },
      uTreble: { value: 0 },
      uLevel: { value: 0 },
      uBeat: { value: 0 },
      uFlux: { value: 0 },
      uCentroid: { value: 0.5 },
      uAudioOn: { value: 0 },
      uBands0: { value: new THREE.Vector4(0, 0, 0, 0) },
      uBands1: { value: new THREE.Vector4(0, 0, 0, 0) },
      uDissonance: { value: 0 },
      uBeatPulse: { value: 0 },
      uBeatPhase: { value: 0 },
      uBloomT: { value: 3 },
      uStereo: { value: new THREE.Vector2(0, 0) },
      uHueShift: { value: 0 },
      uPulse: { value: 0 },
      uPulseRate: { value: 6.0 },
      uVoid: { value: 0 },
      uFlicker: { value: 0 },
      uFlickerHz: { value: 10 },
      uTone: { value: 0.35 },
      uAscension: { value: 0 },
      uAsc: { value: 0 },
      uRay: { value: 0 },
      uChoreo: { value: 0 },
      uScope: { value: 0 },
      uCine: { value: 1 },
      uWall: { value: 0 },
      uWallScale: { value: 1 },
      uTrail: { value: 0 },
      uDose: { value: 0.5 },
      uSpectrum: { value: specTex },
      uWaveform: { value: waveTex },
      // Simulation uniforms (used by ping-pong sim modes)
      uState: { value: null },
      uStateSize: { value: new THREE.Vector2(1, 1) },
      uPass: { value: 0 },
      uTrailMap: { value: null },
    };

    let currentMode = -1;
    let material: THREE.ShaderMaterial | null = null;
    const geometry = new THREE.PlaneGeometry(2, 2);
    let mesh: THREE.Mesh | null = null;

    // ── Sim state (populated when entering a sim mode) ───────────────────────
    let simPingPong: PingPong | null = null;   // for RD: state ping-pong
    let simScene: THREE.Scene | null = null;
    let simCamera: THREE.OrthographicCamera | null = null;
    let simMesh: THREE.Mesh | null = null;
    let initMat: THREE.ShaderMaterial | null = null;
    let stepMat: THREE.ShaderMaterial | null = null;

    // Physarum: extra trail ping-pong + multi-pass materials
    let trailPingPong: PingPong | null = null;
    let agentPingPong: PingPong | null = null;
    let depositMat: THREE.ShaderMaterial | null = null;
    let blurMat: THREE.ShaderMaterial | null = null;

    let currentSimSubsteps = 0;
    let simInitialized = false;

    const disposeSim = () => {
      simPingPong?.dispose(); simPingPong = null;
      trailPingPong?.dispose(); trailPingPong = null;
      agentPingPong?.dispose(); agentPingPong = null;
      initMat?.dispose(); initMat = null;
      stepMat?.dispose(); stepMat = null;
      depositMat?.dispose(); depositMat = null;
      blurMat?.dispose(); blurMat = null;
      simScene = null; simCamera = null; simMesh = null;
      currentSimSubsteps = 0;
      simInitialized = false;
    };

    const initSim = (idx: number) => {
      disposeSim();
      const shader = vizModes[idx];
      if (!shader.simulate) return;

      const simW = Math.max(1, Math.floor(canvas.clientWidth * 0.5));
      const simH = Math.max(1, Math.floor(canvas.clientHeight * 0.5));
      currentSimSubsteps = shader.simulate.substeps ?? 8;

      simPingPong = new PingPong(renderer, simW, simH);
      uniforms.uState.value = simPingPong.texture;
      uniforms.uStateSize.value.set(simW, simH);

      simScene = new THREE.Scene();
      simCamera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);
      const simGeo = new THREE.PlaneGeometry(2, 2);

      initMat = new THREE.ShaderMaterial({
        vertexShader: shader.vertex,
        fragmentShader: shader.simulate.init,
        uniforms,
        depthTest: false,
        depthWrite: false,
      });
      stepMat = new THREE.ShaderMaterial({
        vertexShader: shader.vertex,
        fragmentShader: shader.simulate.step,
        uniforms,
        depthTest: false,
        depthWrite: false,
      });

      simMesh = new THREE.Mesh(simGeo, initMat);
      simMesh.frustumCulled = false;

      // For Physarum, set up agent + trail ping-pongs
      if (idx === 10) {
        agentPingPong = new PingPong(renderer, simW, simH);
        trailPingPong = new PingPong(renderer, simW, simH);
        depositMat = new THREE.ShaderMaterial({
          vertexShader: shader.vertex,
          fragmentShader: shader.simulate.step,
          uniforms,
          depthTest: false,
          depthWrite: false,
        });
        blurMat = new THREE.ShaderMaterial({
          vertexShader: shader.vertex,
          fragmentShader: shader.simulate.step,
          uniforms,
          depthTest: false,
          depthWrite: false,
        });
        uniforms.uTrailMap.value = trailPingPong.texture;
      }

      // Run init pass
      simScene.add(simMesh);
      renderer.setRenderTarget(simPingPong.current);
      renderer.render(simScene, simCamera);
      renderer.setRenderTarget(null);
      simPingPong.swap();

      simInitialized = true;
    };

    const setMode = (idx: number) => {
      if (idx === currentMode) return;
      currentMode = idx;
      const shader = vizModes[idx];

      // Clean up previous sim state
      disposeSim();

      if (material) material.dispose();
      material = new THREE.ShaderMaterial({
        vertexShader: shader.vertex,
        fragmentShader: shader.fragment,
        uniforms,
        depthTest: false,
        depthWrite: false,
      });
      if (mesh) scene.remove(mesh);
      mesh = new THREE.Mesh(geometry, material);
      mesh.frustumCulled = false;
      scene.add(mesh);

      // Initialize sim if this mode has one
      if (shader.simulate) {
        initSim(idx);
        // Update display material's uState to point to the ping-pong texture
        uniforms.uState.value = simPingPong?.texture ?? null;
      }
    };

    setMode(0);

    // Per-band smoothing state (asymmetric: fast attack, slow release per band)
    const smooth = {
      bass: 0, mid: 0, treble: 0, level: 0,
      beat: 0, flux: 0, centroid: 0.5,
      sub: 0, lowmid: 0, highmid: 0, air: 0,
    };
    // Peak envelopes (directly from vizAudio, no additional smoothing needed)
    const peak = {
      sub: 0, bass: 0, lowmid: 0, mid: 0,
      highmid: 0, treble: 0, air: 0, level: 0,
    };
    const SMOOTH = 0.15;

    let time = 0;
    let prevBeat = 0;
    let beatPulse = 0;
    let beatPhase = 0;
    let bloomT = 3;
    let lastT = 0;
    let rafId = 0;

    const frame = (t: number) => {
      const delta = lastT ? (t - lastT) / 1000 : 0.016;
      lastT = t;
      time += delta;

      // Switch mode if changed
      if (modeRef.current !== currentMode) {
        setMode(modeRef.current);
      }

      // Update control uniforms
      uniforms.uPalette.value = palRef.current;
      uniforms.uSymmetry.value = symRef.current;
      uniforms.uComplexity.value = compRef.current;
      uniforms.uReactivity.value = reactRef.current;
      uniforms.uMouse.value.set(mouseRef.current.x, mouseRef.current.y);

      // Audio analysis
      const audio = vizAudio.analyse(reactRef.current);
      const ar = audio.on ? 1 : 0;

      // Per-band asymmetric smoothing: fast attack (snappy), slow release (weight)
      const atk = 0.35, rel = 0.08;
      const sm = (cur: number, raw: number) => cur + (raw - cur) * (raw > cur ? atk : rel);
      smooth.bass    = sm(smooth.bass, audio.bass);
      smooth.mid     = sm(smooth.mid, audio.mid);
      smooth.treble  = sm(smooth.treble, audio.treble);
      smooth.level   = sm(smooth.level, audio.level);
      smooth.beat    = sm(smooth.beat, audio.beat);
      smooth.flux    = sm(smooth.flux, audio.flux);
      smooth.centroid = sm(smooth.centroid, audio.centroid);
      smooth.sub     = sm(smooth.sub, audio.sub);
      smooth.lowmid  = sm(smooth.lowmid, audio.lowmid);
      smooth.highmid = sm(smooth.highmid, audio.highmid);
      smooth.air     = sm(smooth.air, audio.air);

      // Peak envelopes (directly from analysis — already slow-decaying)
      peak.sub     = audio.peakSub;
      peak.bass    = audio.peakBass;
      peak.lowmid  = audio.peakLowmid;
      peak.mid     = audio.peakMid;
      peak.highmid = audio.peakHighmid;
      peak.treble  = audio.peakTreble;
      peak.air     = audio.peakAir;
      peak.level   = audio.peakLevel;

      uniforms.uTime.value = time;
      uniforms.uBass.value = smooth.bass;
      uniforms.uMid.value = smooth.mid;
      uniforms.uTreble.value = smooth.treble;
      uniforms.uLevel.value = smooth.level;
      uniforms.uBeat.value = smooth.beat;
      uniforms.uFlux.value = smooth.flux;
      uniforms.uCentroid.value = smooth.centroid;
      uniforms.uAudioOn.value = audio.on ? 1.0 : 0.0;
      uniforms.uBands0.value.set(smooth.sub, smooth.bass, smooth.lowmid, smooth.mid);
      uniforms.uBands1.value.set(smooth.highmid, smooth.treble, smooth.air, smooth.level);

      // Beat pulse — exponential decay for natural feel (not linear)
      if (audio.beat > 0.8 && prevBeat < 0.8) { beatPulse = 1.0; beatPhase = 0; }
      beatPulse = beatPulse * Math.pow(0.08, delta); // exponential falloff
      beatPhase = Math.min(1, beatPhase + delta * audio.bpm / 60);
      uniforms.uBeatPulse.value = beatPulse;
      uniforms.uBeatPhase.value = beatPhase;

      if (audio.beat > 0.8 && prevBeat < 0.8) bloomT = 0;
      bloomT = Math.min(3, bloomT + delta);
      uniforms.uBloomT.value = bloomT;
      uniforms.uStereo.value.set(smooth.bass, smooth.treble);
      prevBeat = audio.beat;

      // Pack waveform into texture
      const wave = audio.waveform;
      for (let i = 0; i < 256; i++) {
        const v = Math.max(0, Math.min(255, Math.round(((wave[i] ?? 0) * 0.5 + 0.5) * 255)));
        waveData[i * 4] = v;
        waveData[i * 4 + 1] = v;
        waveData[i * 4 + 2] = v;
        waveData[i * 4 + 3] = 255;
      }
      waveTex.needsUpdate = true;

      // Pack spectrum into texture
      const spec = audio.spectrum;
      for (let i = 0; i < 256 && i < spec.length; i++) {
        const v = Math.max(0, Math.min(255, Math.round(spec[i] * 255)));
        specData[i * 4] = v;
        specData[i * 4 + 1] = v;
        specData[i * 4 + 2] = v;
        specData[i * 4 + 3] = 255;
      }
      specTex.needsUpdate = true;

      // ── Run simulation steps if current mode has a sim ──────────────────
      const currentShader = vizModes[currentMode];
      if (currentShader.simulate && simInitialized && simPingPong && simScene && simCamera && simMesh && stepMat) {
        if (currentMode === 10 && agentPingPong && trailPingPong && depositMat && blurMat) {
          // ── Physarum: 3 passes per substep ──────────────────────────────
          for (let s = 0; s < currentSimSubsteps; s++) {
            // Pass 0: agents sense+move (read agentA → write agentB)
            stepMat.uniforms.uPass.value = 0;
            stepMat.uniforms.uState.value = agentPingPong.texture;
            stepMat.uniforms.uTrailMap.value = trailPingPong.texture;
            simMesh.material = stepMat;
            renderer.setRenderTarget(agentPingPong.current);
            renderer.render(simScene, simCamera);
            agentPingPong.swap();

            // Pass 1: deposit (read agentB + trailA → write trailB)
            depositMat.uniforms.uPass.value = 1;
            depositMat.uniforms.uState.value = agentPingPong.texture;
            depositMat.uniforms.uTrailMap.value = trailPingPong.texture;
            simMesh.material = depositMat;
            renderer.setRenderTarget(trailPingPong.current);
            renderer.render(simScene, simCamera);
            trailPingPong.swap();

            // Pass 2: blur + decay (read trailB → write trailA)
            blurMat.uniforms.uPass.value = 2;
            blurMat.uniforms.uTrailMap.value = trailPingPong.texture;
            simMesh.material = blurMat;
            renderer.setRenderTarget(trailPingPong.current);
            renderer.render(simScene, simCamera);
            trailPingPong.swap();
          }
          // Display reads trail map
          uniforms.uState.value = trailPingPong.texture;
        } else {
          // ── RD or other single-ping-pong sims ──────────────────────────
          for (let s = 0; s < currentSimSubsteps; s++) {
            simMesh.material = stepMat;
            renderer.setRenderTarget(simPingPong.current);
            renderer.render(simScene, simCamera);
            simPingPong.swap();
          }
          uniforms.uState.value = simPingPong.texture;
        }
        renderer.setRenderTarget(null);
      }

      renderer.render(scene, camera);
      rafId = requestAnimationFrame(frame);
    };

    rafId = requestAnimationFrame(frame);

    const onResize = () => {
      const w = canvas.clientWidth || window.innerWidth;
      const h = canvas.clientHeight || window.innerHeight;
      renderer.setSize(w, h, false);
      uniforms.uResolution.value.set(w, h);
      // Resize sim targets to half-res
      if (simPingPong) {
        const sw = Math.max(1, Math.floor(w * 0.5));
        const sh = Math.max(1, Math.floor(h * 0.5));
        simPingPong.resize(sw, sh);
        agentPingPong?.resize(sw, sh);
        trailPingPong?.resize(sw, sh);
        uniforms.uStateSize.value.set(sw, sh);
      }
    };
    onResize();
    window.addEventListener('resize', onResize);

    const onMouseMove = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      mouseRef.current.x = (e.clientX - rect.left) / rect.width;
      mouseRef.current.y = 1.0 - (e.clientY - rect.top) / rect.height;
    };
    canvas.addEventListener('mousemove', onMouseMove);

    return () => {
      cancelAnimationFrame(rafId);
      window.removeEventListener('resize', onResize);
      canvas.removeEventListener('mousemove', onMouseMove);
      disposeSim();
      geometry.dispose();
      if (material) material.dispose();
      waveTex.dispose();
      specTex.dispose();
      renderer.dispose();
    };
  }, []);

  return (
    <div className="flex-1 relative min-h-0 bg-black overflow-hidden">
      <canvas ref={canvasRef} className="w-full h-full block" />

      {/* Controls overlay */}
      <div className="absolute bottom-0 left-0 right-0 z-10 bg-gradient-to-t from-black/90 to-transparent pt-12 pb-4 px-5 flex flex-col gap-3">
        {/* Mode buttons */}
        <div className="flex items-center gap-1.5 flex-wrap">
          {vizModes.map((m, i) => (
            <button
              key={i}
              onClick={() => handleModeClick(i)}
              className={`px-3 py-1.5 rounded-md text-[11px] font-sans transition-all cursor-pointer ${
                mode === i
                  ? 'bg-white text-zinc-950 font-medium'
                  : 'bg-zinc-900/80 text-zinc-500 hover:text-zinc-300 border border-zinc-800'
              }`}
            >
              {m.name}
            </button>
          ))}
        </div>

        {/* Sliders + Autopilot */}
        <div className="flex items-center gap-5">
          {/* Autopilot */}
          <button
            onClick={() => setAutopilot(a => !a)}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-[11px] font-sans transition-all border relative overflow-hidden cursor-pointer ${
              autopilot
                ? 'bg-amber-500/20 border-amber-500/40 text-amber-300'
                : 'bg-zinc-900/80 border-zinc-800 text-zinc-500 hover:text-zinc-300'
            }`}
            title="Auto-cycle modes every 16 bars"
          >
            <Shuffle className="w-3 h-3" />
            Autopilot
            {autopilot && (
              <span
                className="absolute bottom-0 left-0 h-[2px] bg-amber-400 transition-all"
                style={{ width: `${autoProgress * 100}%` }}
              />
            )}
          </button>

          {/* Palette */}
          <label className="flex items-center gap-2 text-[10px] font-mono text-zinc-600">
            Palette
            <input type="range" min="0" max="8" step="1" value={palette}
              onChange={e => setPalette(parseInt(e.target.value))}
              className="daw-fader w-16" />
          </label>

          {/* Complexity */}
          <label className="flex items-center gap-2 text-[10px] font-mono text-zinc-600">
            Complexity
            <input type="range" min="0" max="1" step="0.01" value={complexity}
              onChange={e => setComplexity(parseFloat(e.target.value))}
              className="daw-fader w-16" />
          </label>

          {/* Symmetry */}
          <label className="flex items-center gap-2 text-[10px] font-mono text-zinc-600">
            Symmetry
            <input type="range" min="3" max="12" step="1" value={symmetry}
              onChange={e => setSymmetry(parseInt(e.target.value))}
              className="daw-fader w-16" />
          </label>

          {/* Reactivity */}
          <label className="flex items-center gap-2 text-[10px] font-mono text-zinc-600">
            Reactivity
            <input type="range" min="0" max="3" step="0.1" value={reactivity}
              onChange={e => setReactivity(parseFloat(e.target.value))}
              className="daw-fader w-16" />
          </label>
        </div>
      </div>
    </div>
  );
};
