/**
 * Generate a Euclidean rhythm: `hits` pulses distributed as evenly as
 * possible across `length` steps, optionally rotated by `rotation`.
 *
 * Uses the additive Bresenham accumulator, then canonicalises the phase
 * so the first pulse always lands on the downbeat (index 0) — this is
 * what a musician typing `euclid kick 4` expects (four on the floor).
 *
 * `rotation` shifts pulses later in time when positive (rightward),
 * earlier when negative. Returns a boolean[] of length `length`.
 */
export function euclidean(hits: number, length: number, rotation = 0): boolean[] {
  if (length <= 0) return [];
  const h = Math.max(0, Math.min(Math.floor(hits), Math.floor(length)));
  const pattern: boolean[] = new Array(length).fill(false);
  if (h === 0) return pattern;
  if (h === length) return pattern.fill(true);

  // Bresenham even distribution.
  let bucket = 0;
  for (let i = 0; i < length; i++) {
    bucket += h;
    if (bucket >= length) {
      bucket -= length;
      pattern[i] = true;
    }
  }

  // Canonicalise phase: rotate so the first pulse sits on the downbeat.
  const firstHit = pattern.indexOf(true);
  if (firstHit > 0) {
    const shifted = [...pattern.slice(firstHit), ...pattern.slice(0, firstHit)];
    for (let i = 0; i < length; i++) pattern[i] = shifted[i];
  }

  return rotateRight(pattern, rotation, length);
}

// Positive rotation = pulses move later (rightward); negative = earlier.
function rotateRight<T>(arr: T[], rotation: number, length: number): T[] {
  if (rotation === 0 || length === 0) return arr;
  const shift = ((Math.floor(rotation) % length) + length) % length;
  if (shift === 0) return arr;
  const start = (length - shift) % length;
  return [...arr.slice(start), ...arr.slice(0, start)];
}
