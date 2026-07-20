import { patchGraph } from '../audio/patchgraph';
import { getContext } from '../audio/context';

// Adapted from music-viz (github.com/burunndng/music-viz) src/lib/audio.ts
// Reads from SharedArrayBuffer ring buffer (zero-copy from AudioWorklet) when
// available; falls back to native AnalyserNode reads.
// Enhanced: per-band attack/release, peak hold, transient-weighted beat detection.

const normalizeDB = (db: number, min = -100, max = 0) =>
  Math.max(0, Math.min(1, (db - min) / (max - min)));

// Asymmetric EMA: fast attack, slow release (independent rates).
// `a` = attack speed (higher = snappier onset), `r` = release speed (higher = faster fade).
const emaAR = (cur: number, raw: number, a: number, r: number) =>
  cur + (raw - cur) * (raw > cur ? a : r);

export interface AudioAnalysis {
  on: boolean;
  sub: number; bass: number; lowmid: number; mid: number;
  highmid: number; treble: number; air: number; level: number;
  beat: number; flux: number; phase: number; bpm: number;
  centroid: number; dissonance: number;
  waveform: Float32Array; spectrum: Float32Array;
  // Per-band peak envelopes (slow-decaying max for visual punch)
  peakSub: number; peakBass: number; peakLowmid: number;
  peakMid: number; peakHighmid: number; peakTreble: number;
  peakAir: number; peakLevel: number;
}

class VizAudioEngine {
  private fftBuf = new Float32Array(512);
  private waveBuf = new Float32Array(1024);
  private fluxHistory = new Float32Array(512);
  private specPrev = new Float32Array(512);
  private bassSlow = 0.05;
  private lastBeatT = 0;

  // Per-band EMA state (attack/release pairs per band)
  private emaSub = 0; private emaBass = 0; private emaLowmid = 0;
  private emaMid = 0; private emaHighmid = 0; private emaTreble = 0;
  private emaAir = 0; private emaLevel = 0; private emaDissonance = 0;

  // Peak hold — tracks per-band peaks with slow decay for visual impact
  private peakSub = 0; private peakBass = 0; private peakLowmid = 0;
  private peakMid = 0; private peakHighmid = 0; private peakTreble = 0;
  private peakAir = 0; private peakLevel = 0;

  // Band-specific attack/release: [attack, release]
  // Attack = how fast the band rises to a new peak (higher = snappier onset)
  // Release = how fast it falls back (higher = faster fade)
  private static readonly BAND_AR: Record<string, [number, number]> = {
    sub:     [0.55, 0.06],  // fast attack, very slow release — sub-bass weight
    bass:    [0.40, 0.10],  // punchy kick
    lowmid:  [0.25, 0.06],  // warm body
    mid:     [0.22, 0.06],  // vocal/synth presence
    highmid: [0.35, 0.12],  // snare snap, clap transient
    treble:  [0.45, 0.08],  // hi-hat fast attack, medium release
    air:     [0.50, 0.04],  // shimmery transient, very quick fade
    level:   [0.30, 0.05],  // overall energy envelope
  };

  // Peak decay rates (per frame, ~60fps)
  private static readonly PEAK_DECAY = 0.035;

  analysis: AudioAnalysis = {
    on: false,
    sub: 0, bass: 0, lowmid: 0, mid: 0, highmid: 0, treble: 0, air: 0, level: 0,
    beat: 0, flux: 0, phase: 0, bpm: 128,
    centroid: 0.5, dissonance: 0,
    waveform: new Float32Array(256),
    spectrum: new Float32Array(512),
    peakSub: 0, peakBass: 0, peakLowmid: 0,
    peakMid: 0, peakHighmid: 0, peakTreble: 0,
    peakAir: 0, peakLevel: 0,
  };

  analyse(sensitivity = 1.2): AudioAnalysis {
    const analyser = patchGraph.analyser;
    if (!analyser) {
      this.analysis.on = false;
      return this.analysis;
    }

    const ctx = getContext();
    if (!ctx || ctx.state !== 'running') {
      this.analysis.on = false;
      return this.analysis;
    }

    this.analysis.on = true;

    // --- Data source selection ---
    // Prefer SharedArrayBuffer ring buffer (zero-copy, sub-block latency from
    // the audio worklet). Fall back to AnalyserNode when ring buffer unavailable
    // (e.g. no COOP/COEP headers, or worklet not yet loaded).
    const ringAvailable = patchGraph.waveformRing && patchGraph.waveformRing.peek(1).length > 0;

    if (ringAvailable) {
      // Read latest 256 samples from ring buffer (sub-block, sub-microsecond latency)
      const latestWave = patchGraph.waveformRing!.peek(256);
      const offset = Math.max(0, 256 - latestWave.length);
      for (let i = 0; i < latestWave.length; i++) {
        this.waveBuf[offset + i] = latestWave[i];
      }
      // Zero-fill any leading samples if ring buffer has fewer than 256
      for (let i = 0; i < offset; i++) this.waveBuf[i] = 0;
    } else {
      // Fallback: read from native AnalyserNode
      analyser.getFloatTimeDomainData(this.waveBuf);
    }

    // Spectrum always comes from AnalyserNode (FFT is done on the audio thread)
    analyser.getFloatFrequencyData(this.fftBuf);

    const n = this.fftBuf.length;
    const sampleRate = ctx.sampleRate;
    const binHz = sampleRate / (analyser.fftSize);

    const freqToIdx = (f: number) => Math.min(n - 1, Math.max(0, Math.round(f / binHz)));
    const avg = (lo: number, hi: number) => {
      let s = 0, c = 0;
      for (let i = freqToIdx(lo); i <= freqToIdx(hi) && i < n; i++) {
        s += normalizeDB(this.fftBuf[i]);
        c++;
      }
      return c > 0 ? (s / c) * sensitivity : 0;
    };

    const sub     = avg(20, 60);
    const bass    = avg(60, 250);
    const lowmid  = avg(250, 500);
    const mid     = avg(500, 2000);
    const highmid = avg(2000, 4000);
    const treble  = avg(4000, 8000);
    const air     = avg(8000, 16000);
    const level   = (sub + bass + mid + treble) / 4;

    // Spectral centroid
    let cNum = 0, cDen = 0;
    for (let i = 0; i < n; i++) {
      const v = normalizeDB(this.fftBuf[i]);
      if (v > 0) { cNum += v * i; cDen += v; }
    }
    this.analysis.centroid = cDen > 0 ? cNum / cDen / n : 0.5;

    // Spectral flux
    let flux = 0;
    for (let i = 0; i < n; i++) {
      const v = normalizeDB(this.fftBuf[i]);
      const d = v - this.specPrev[i];
      if (d > 0) flux += d;
      this.specPrev[i] = v;
    }
    flux /= n;
    this.analysis.flux = flux;

    // BPM estimation via flux autocorrelation
    for (let i = 511; i > 0; i--) this.fluxHistory[i] = this.fluxHistory[i - 1];
    this.fluxHistory[0] = flux;

    const autocorr = (lag: number) => {
      let sum = 0;
      for (let i = 0; i < 512 - lag; i++) sum += this.fluxHistory[i] * this.fluxHistory[i + lag];
      return sum;
    };
    let maxCorr = 0, bestLag = 30;
    for (let lag = 20; lag <= 60; lag++) {
      const corr = autocorr(lag);
      if (corr > maxCorr) { maxCorr = corr; bestLag = lag; }
    }
    const estimatedBPM = Math.round(3600 / Math.max(bestLag, 1));

    // Spectral dissonance
    let diss = 0;
    for (let i = 2; i < n; i++) {
      const a_ = normalizeDB(this.fftBuf[i]);
      const b_ = normalizeDB(this.fftBuf[i - 2]);
      diss += a_ * b_ * (a_ + b_) * 0.5;
    }
    this.emaDissonance = emaAR(this.emaDissonance, Math.min(1, diss / n), 0.10, 0.02);
    this.analysis.dissonance = this.emaDissonance * sensitivity;

    // Per-band asymmetric EMA (fast attack, slow release per band)
    const ar = VizAudioEngine.BAND_AR;
    this.emaSub     = emaAR(this.emaSub, sub,     ar.sub[0],     ar.sub[1]);
    this.emaBass    = emaAR(this.emaBass, bass,   ar.bass[0],    ar.bass[1]);
    this.emaLowmid  = emaAR(this.emaLowmid, lowmid, ar.lowmid[0], ar.lowmid[1]);
    this.emaMid     = emaAR(this.emaMid, mid,     ar.mid[0],     ar.mid[1]);
    this.emaHighmid = emaAR(this.emaHighmid, highmid, ar.highmid[0], ar.highmid[1]);
    this.emaTreble  = emaAR(this.emaTreble, treble, ar.treble[0], ar.treble[1]);
    this.emaAir     = emaAR(this.emaAir, air,     ar.air[0],     ar.air[1]);
    this.emaLevel   = emaAR(this.emaLevel, level, ar.level[0],   ar.level[1]);

    this.analysis.sub     = this.emaSub;
    this.analysis.bass    = this.emaBass;
    this.analysis.lowmid  = this.emaLowmid;
    this.analysis.mid     = this.emaMid;
    this.analysis.highmid = this.emaHighmid;
    this.analysis.treble  = this.emaTreble;
    this.analysis.air     = this.emaAir;
    this.analysis.level   = this.emaLevel;

    // Peak hold — per-band slow-decaying envelope for visual punch
    const pkDecay = VizAudioEngine.PEAK_DECAY;
    const updatePeak = (cur: number, prev: number) => Math.max(prev - pkDecay, cur);
    this.peakSub     = updatePeak(sub,     this.peakSub);
    this.peakBass    = updatePeak(bass,    this.peakBass);
    this.peakLowmid  = updatePeak(lowmid,  this.peakLowmid);
    this.peakMid     = updatePeak(mid,     this.peakMid);
    this.peakHighmid = updatePeak(highmid, this.peakHighmid);
    this.peakTreble  = updatePeak(treble,  this.peakTreble);
    this.peakAir     = updatePeak(air,     this.peakAir);
    this.peakLevel   = updatePeak(level,   this.peakLevel);
    this.analysis.peakSub     = this.peakSub;
    this.analysis.peakBass    = this.peakBass;
    this.analysis.peakLowmid  = this.peakLowmid;
    this.analysis.peakMid     = this.peakMid;
    this.analysis.peakHighmid = this.peakHighmid;
    this.analysis.peakTreble  = this.peakTreble;
    this.analysis.peakAir     = this.peakAir;
    this.analysis.peakLevel   = this.peakLevel;

    // Beat detection — transient-weighted: combines bass energy + high-mid flux
    // so snares/claps register as beats too, not just kicks.
    const now = performance.now() / 1000;
    this.bassSlow = this.bassSlow * 0.92 + bass * 0.08;
    const bassHit  = bass > this.bassSlow * 1.35 && bass > 0.18;
    const snareHit = highmid > 0.30 && flux > 0.02; // high-mid transient spike
    const beatHit  = bassHit || snareHit;
    if (beatHit && now - this.lastBeatT > 0.15) {
      this.analysis.beat = 1.0;
      this.analysis.phase = 0;
      this.lastBeatT = now;
    } else {
      this.analysis.beat = Math.max(0, this.analysis.beat - 0.06);
      this.analysis.phase = Math.min(1, (now - this.lastBeatT) / Math.max(0.3, 60 / estimatedBPM));
    }
    this.analysis.bpm = estimatedBPM;

    // Waveform (first 256 samples of time-domain buffer)
    this.analysis.waveform.set(this.waveBuf.subarray(0, 256));

    // Spectrum (normalised dB)
    for (let i = 0; i < n; i++) {
      this.analysis.spectrum[i] = normalizeDB(this.fftBuf[i]);
    }

    return this.analysis;
  }
}

export const vizAudio = new VizAudioEngine();
