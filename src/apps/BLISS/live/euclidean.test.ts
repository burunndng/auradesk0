import { describe, it, expect } from 'vitest';
import { euclidean, countHits } from './euclidean';

describe('euclidean — distribution', () => {
  it('produces exactly `hits` pulses', () => {
    for (const [h, n] of [[0, 16], [1, 16], [4, 16], [5, 8], [3, 12], [7, 7]] as const) {
      expect(countHits(euclidean(h, n))).toBe(Math.min(h, n));
    }
  });

  it('returns an array of the requested length', () => {
    expect(euclidean(4, 16)).toHaveLength(16);
    expect(euclidean(3, 8)).toHaveLength(8);
  });

  it('edge cases: 0 hits → all false, all hits → all true', () => {
    expect(euclidean(0, 8).every(v => v === false)).toBe(true);
    expect(euclidean(8, 8).every(v => v === true)).toBe(true);
  });

  it('clamps hits > length down to length', () => {
    expect(countHits(euclidean(20, 8))).toBe(8);
  });

  it('length 0 → empty array', () => {
    expect(euclidean(4, 0)).toEqual([]);
  });
});

describe('euclidean — canonical phase (downbeat)', () => {
  it('first pulse always lands on index 0 (when hits > 0)', () => {
    for (const [h, n] of [[1, 16], [3, 8], [5, 16], [7, 12], [4, 16]] as const) {
      expect(euclidean(h, n)[0]).toBe(true);
    }
  });

  it('four-on-the-floor: euclid(4,16) → hits on 0,4,8,12', () => {
    const p = euclidean(4, 16);
    expect(p.map((v, i) => (v ? i : -1)).filter(i => i >= 0)).toEqual([0, 4, 8, 12]);
  });

  it('single hit: euclid(1,16) → downbeat only', () => {
    const p = euclidean(1, 16);
    expect(p[0]).toBe(true);
    expect(countHits(p)).toBe(1);
  });
});

describe('euclidean — evenness', () => {
  // The signature property of a Euclidean rhythm: the gaps between
  // consecutive pulses differ by at most 1 (measured across the wrap).
  it('max gap variance is <= 1', () => {
    for (const [h, n] of [[1, 16], [3, 8], [5, 16], [7, 12]] as const) {
      const p = euclidean(h, n);
      const indices = p.map((v, i) => (v ? i : -1)).filter(i => i >= 0);
      const gaps: number[] = [];
      for (let i = 1; i < indices.length; i++) gaps.push(indices[i] - indices[i - 1]);
      gaps.push((n + indices[0] - indices[indices.length - 1]) % n);
      if (gaps.length >= 2) {
        expect(Math.max(...gaps) - Math.min(...gaps)).toBeLessThanOrEqual(1);
      }
    }
  });

  it('classic tresillo: euclid(3,8) → [T,F,F,T,F,T,F,F]', () => {
    expect(euclidean(3, 8)).toEqual([
      true, false, false, true,
      false, true, false, false,
    ]);
  });
});

describe('euclidean — rotation', () => {
  const base = euclidean(3, 8); // [T,F,F,T,F,T,F,F]

  it('rotation 0 leaves the canonical pattern unchanged', () => {
    expect(euclidean(3, 8, 0)).toEqual(base);
  });

  it('positive rotation shifts pulses later (rightward)', () => {
    // +1 → last element wraps to front
    expect(euclidean(3, 8, 1)).toEqual([base[7], ...base.slice(0, 7)]);
  });

  it('negative rotation shifts pulses earlier (leftward)', () => {
    // -1 → first element wraps to back
    expect(euclidean(3, 8, -1)).toEqual([...base.slice(1), base[0]]);
  });

  it('rotation wraps (length === identity)', () => {
    expect(euclidean(5, 16, 16)).toEqual(euclidean(5, 16, 0));
    expect(euclidean(5, 16, 32)).toEqual(euclidean(5, 16, 0));
    expect(euclidean(5, 16, -16)).toEqual(euclidean(5, 16, 0));
  });

  it('large rotation is normalised', () => {
    expect(euclidean(5, 16, 17)).toEqual(euclidean(5, 16, 1));
  });
});
