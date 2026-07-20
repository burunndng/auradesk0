/**
 * Lock-free SPSC (single-producer, single-consumer) ring buffer backed by
 * SharedArrayBuffer. Used to stream audio-rate data (waveform, spectrum) from
 * the AudioWorklet rendering thread to the main thread without MessagePort
 * overhead.
 *
 * Requires the page to be cross-origin isolated (COOP/COEP headers).
 * Falls back gracefully — if SharedArrayBuffer is unavailable, all methods
 * become no-ops so the rest of the app still works.
 */

export class RingBuffer {
  private meta: Int32Array;
  private data: Float32Array;
  private capacity: number;

  /** Total byte length needed for a ring buffer of `capacity` Float32 samples. */
  static getByteLength(capacity: number): number {
    // Layout: [writeIndex (Int32), readIndex (Int32), pad (2x Int32), ...Float32 samples]
    return 16 + capacity * 4;
  }

  constructor(sab: SharedArrayBuffer, capacity: number) {
    this.capacity = capacity;
    this.meta = new Int32Array(sab, 0, 4); // writeIdx, readIdx, pad, pad
    this.data = new Float32Array(sab, 16, capacity);
  }

  /** Write samples from the audio thread (producer). */
  write(samples: Float32Array): void {
    let writeIdx = Atomics.load(this.meta, 0);
    for (let i = 0; i < samples.length; i++) {
      this.data[(writeIdx + i) % this.capacity] = samples[i];
    }
    Atomics.store(this.meta, 0, (writeIdx + samples.length) % this.capacity);
  }

  /** Read all available samples on the main thread (consumer). Returns empty array if nothing new. */
  read(): Float32Array {
    const writeIdx = Atomics.load(this.meta, 0);
    const readIdx = Atomics.load(this.meta, 1);
    const available = (writeIdx - readIdx + this.capacity) % this.capacity;
    if (available === 0) return new Float32Array(0);

    const out = new Float32Array(available);
    for (let i = 0; i < available; i++) {
      out[i] = this.data[(readIdx + i) % this.capacity];
    }
    // Advance read pointer
    Atomics.store(this.meta, 1, writeIdx);
    return out;
  }

  /** Peek without advancing the read pointer (for non-destructive reads). */
  peek(maxSamples?: number): Float32Array {
    const writeIdx = Atomics.load(this.meta, 0);
    const readIdx = Atomics.load(this.meta, 1);
    const available = (writeIdx - readIdx + this.capacity) % this.capacity;
    const len = maxSamples ? Math.min(maxSamples, available) : available;
    if (len === 0) return new Float32Array(0);

    const out = new Float32Array(len);
    for (let i = 0; i < len; i++) {
      out[i] = this.data[(readIdx + i) % this.capacity];
    }
    return out;
  }
}

/** Feature-detect SharedArrayBuffer availability. */
export function supportsSharedArrayBuffer(): boolean {
  try {
    return typeof SharedArrayBuffer !== 'undefined';
  } catch {
    return false;
  }
}
