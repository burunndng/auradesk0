export const commonGLSL = /* glsl */ `
precision highp float;

#define PI 3.14159265359
#define TAU 6.28318530718

uniform float uTime;
uniform float uDose;
uniform float uSpeed;
uniform float uComplexity;
uniform float uSymmetry;
uniform float uTrail;
uniform int uPalette;
uniform int uPlanform;
uniform vec2 uMouse;
uniform float uReactivity;
uniform vec2 uResolution;

uniform float uBass;
uniform float uMid;
uniform float uTreble;
uniform float uLevel;
uniform float uBeat;
uniform float uFlux;
uniform float uCentroid;
uniform float uAudioOn;
uniform vec4 uBands0;
uniform vec4 uBands1;
uniform float uDissonance;
uniform float uBeatPulse;
uniform float uBeatPhase;
uniform float uBloomT;
uniform vec2 uStereo;
uniform float uHueShift;
uniform float uPulse;
uniform float uPulseRate;
uniform float uVoid;
uniform float uFlicker;
uniform float uFlickerHz;
uniform float uTone;
uniform float uAscension;
uniform float uAsc;
uniform float uRay;
uniform float uChoreo;
uniform float uScope;
uniform float uCine;
uniform int uWall;
uniform float uWallScale;
uniform sampler2D uSpectrum;
uniform sampler2D uWaveform;
uniform sampler2D uState;

mat2 rot(float a) { float c = cos(a), s = sin(a); return mat2(c, -s, s, c); }
vec2 cdiv(vec2 a, vec2 b) { float d = dot(b, b) + 1e-9; return vec2(a.x * b.x + a.y * b.y, a.y * b.x - a.x * b.y) / d; }
float hash21(vec2 p) { p = fract(p * vec2(123.34, 345.45)); p += dot(p, p + 34.345); return fract(p.x * p.y); }
float vnoise(vec2 p) {
  vec2 i = floor(p), f = fract(p);
  float a = hash21(i), b = hash21(i + vec2(1, 0));
  float c = hash21(i + vec2(0, 1)), d = hash21(i + vec2(1, 1));
  vec2 u = f * f * (3.0 - 2.0 * f);
  return mix(mix(a, b, u.x), mix(c, d, u.x), u.y);
}
float fbm(vec2 p, int oct) {
  float s = 0.0, a = 0.5;
  mat2 m = mat2(1.6, 1.2, -1.2, 1.6);
  for (int i = 0; i < 8; i++) {
    if (i >= oct) break;
    s += a * vnoise(p);
    p = m * p + vec2(1.7, 9.2);
    a *= 0.5;
  }
  return s;
}
vec2 fold(vec2 p, float n) {
  float a = atan(p.y, p.x), r = length(p);
  a = mod(a, TAU / n);
  a = abs(a - PI / n);
  return r * vec2(cos(a), sin(a));
}
int octaves() { return int(mix(3.0, 7.0, uComplexity)); }

vec3 oklab2lin(vec3 L) {
  float l_ = L.x + 0.3963377774 * L.y + 0.2158037573 * L.z;
  float m_ = L.x - 0.1055613458 * L.y - 0.0638541728 * L.z;
  float s_ = L.x - 0.0894841775 * L.y - 1.2914855480 * L.z;
  float l = l_ * l_ * l_, m = m_ * m_ * m_, s = s_ * s_ * s_;
  return vec3(
    4.0767416621 * l - 3.3077115913 * m + 0.2309699292 * s,
    -1.2684380046 * l + 2.6097574011 * m - 0.3413193965 * s,
    -0.0041960863 * l - 0.7034186147 * m + 1.7076147010 * s
  );
}
vec3 oklch(float L, float C, float h) {
  return max(oklab2lin(vec3(L, C * cos(h), C * sin(h))), 0.0);
}
vec3 PAL(float t, int id) {
  t = fract(t);
  float Lw = 0.5 + 0.34 * cos(t * TAU - 1.0);
  if (id == 0) return oklch(Lw, 0.17, t * TAU);
  if (id == 1) return oklch(mix(0.30, 0.86, t), 0.18, mix(0.45, 5.70, t));
  if (id == 2) return oklch(mix(0.14, 0.96, t), mix(0.08, 0.21, t), mix(0.10, 1.60, t));
  if (id == 3) return oklch(mix(0.16, 0.88, t), 0.15, mix(3.20, 4.85, t));
  if (id == 4) return oklch(mix(0.22, 0.90, t), 0.16, mix(5.0, 1.6, 0.5 + 0.5 * cos(t * TAU)));
  if (id == 5) return oklch(Lw * 1.08, 0.23, t * TAU);
  if (id == 6) return oklch(mix(0.03, 0.92, pow(t, 1.6)), 0.06 + 0.10 * t, mix(0.7, 1.1, t));
  if (id == 7) return oklch(mix(0.05, 0.78, t), mix(0.10, 0.24, t), mix(4.7, 6.0, t));
  return oklch(mix(0.03, 0.90, pow(t, 1.3)), mix(0.10, 0.25, t), mix(0.02, 0.95, t));
}
vec3 hueShift(vec3 c, float a) {
  const vec3 k = vec3(0.57735);
  float ca = cos(a);
  return c * ca + cross(k, c) * sin(a) + k * dot(k, c) * (1.0 - ca);
}
vec3 aces(vec3 x) {
  return clamp((x * (2.51 * x + 0.03)) / (x * (2.43 * x + 0.59) + 0.14), 0.0, 1.0);
}
vec2 warpToMouse(vec2 p) {
  vec2 m = (uMouse - 0.5) * 2.0;
  m.x *= uResolution.x / uResolution.y;
  vec2 d = p - m;
  float r = length(d) + 0.001;
  return p - normalize(d) * 0.25 * exp(-r * 1.6);
}
vec3 applyPostFX(vec3 col) {
  col = hueShift(col, uHueShift);
  float flicker = uFlicker * 0.22 * (0.5 + 0.5 * sin(uTime * TAU * uFlickerHz));
  col *= 1.0 + flicker;
  float pulse = uPulse * (0.5 + 0.5 * sin(uTime * uPulseRate));
  col *= 1.0 + pulse;
  col = mix(col, vec3(0.0), uVoid);
  col = mix(col, aces(col), uCine);
  col = aces(col);
  return col;
}

// ── 3D rotation matrices ──────────────────────────────────────────────────
mat3 rotX(float a) { float c=cos(a),s=sin(a); return mat3(1,0,0,0,c,-s,0,s,c); }
mat3 rotY(float a) { float c=cos(a),s=sin(a); return mat3(c,0,s,0,1,0,-s,0,c); }
mat3 rotZ(float a) { float c=cos(a),s=sin(a); return mat3(c,-s,0,s,c,0,0,0,1); }

// ── SDF primitives ────────────────────────────────────────────────────────
float sdBox(vec3 p, vec3 b) {
  vec3 q = abs(p) - b;
  return length(max(q, 0.0)) + min(max(q.x, max(q.y, q.z)), 0.0);
}

// ── Mandelbox helpers ─────────────────────────────────────────────────────
void boxFold(inout vec3 z, float lim) {
  z = clamp(z, -lim, lim) * 2.0 - z;
}
float sphereFold(vec3 z, inout float dr) {
  float r2 = dot(z, z);
  float minR2 = 0.25;  // fixed inner radius
  float FixedF2 = 1.0;
  if (r2 < minR2) { float t = FixedF2 / minR2; z *= t; dr *= t; }
  else if (r2 < FixedF2) { float t = FixedF2 / r2; z *= t; dr *= t; }
  return r2;
}

// ── Fractal iteration kernels (return DE + orbit trap color data) ─────────
// Each returns DE estimate; writes orbitTrap = (min orbit distance, iteration blend, angle) for coloring.

float mandelbulbDE(vec3 pos, float power, int iters, out vec3 orbitTrap) {
  vec3 z = pos;
  float dr = 1.0;
  float r = 0.0;
  orbitTrap = vec3(1e10);
  for (int i = 0; i < 32; i++) {
    if (i >= iters) break;
    r = length(z);
    if (r > 4.0) break;

    // Spherical to polar
    float theta = acos(z.z / (r + 1e-10));
    float phi = atan(z.y, z.x);

    // Scale and rotate
    float zr = pow(r, power);
    theta *= power;
    phi *= power;

    // Back to cartesian
    z = zr * vec3(sin(theta)*cos(phi), sin(theta)*sin(phi), cos(theta)) + pos;

    // Orbit trap
    orbitTrap = min(orbitTrap, abs(vec3(z.x, z.y, z.z)));
    dr = pow(r, power - 1.0) * power * dr + 1.0;
  }
  return 0.5 * log(r) * r / dr;
}

float quatJuliaDE(vec3 pos, vec4 c, int iters, out vec3 orbitTrap) {
  vec4 z = vec4(pos, 0.0);
  float md2 = 1.0;
  float mz2 = dot(z, z);
  orbitTrap = vec3(1e10);
  for (int i = 0; i < 32; i++) {
    if (i >= iters) break;
    // Quaternion multiplication: z = z*z + c
    vec4 zc = vec4(
      z.x*z.x - z.y*z.y - z.z*z.z - z.w*z.w,
      2.0*z.x*z.y,
      2.0*z.x*z.z,
      2.0*z.x*z.w
    ) + c;
    z = zc;

    mz2 = dot(z, z);
    orbitTrap = min(orbitTrap, abs(vec3(z.x, z.y, z.z)));
    md2 *= 4.0 * mz2;
    if (mz2 > 256.0) break;
  }
  return 0.5 * sqrt(mz2 / md2) * log(mz2);
}

float mandelboxDE(vec3 z, float scale, int iters, out vec3 orbitTrap) {
  vec3 offset = z;
  float dr = 1.0;
  float r2;
  orbitTrap = vec3(1e10);
  for (int i = 0; i < 32; i++) {
    if (i >= iters) break;
    boxFold(z, 1.0);
    r2 = sphereFold(z, dr);
    z = z * scale + offset;
    dr = dr * abs(scale) + 1.0;
    orbitTrap = min(orbitTrap, abs(vec3(z.x, z.y, z.z)));
  }
  r2 = dot(z, z);
  return abs(z.x - offset.x) / abs(dr);
}

// ── Simulation helpers ────────────────────────────────────────────────────
float hash31(vec3 p) {
  p = fract(p * vec3(123.34, 345.45, 567.89));
  p += dot(p, p.yzx + 43.456);
  return fract(p.x * p.y * p.z);
}

float hash33(vec3 p) {
  p = fract(p * vec3(0.1031, 0.1030, 0.0973));
  p += dot(p, p.yxz + 33.33);
  return fract((p.x + p.y) * p.z);
}

vec2 laplacian9(sampler2D tex, vec2 uv, vec2 texel) {
  vec2 s = texture(tex, uv).rg;
  vec2 sum = vec2(0.0);
  sum += texture(tex, uv + vec2(-texel.x, 0)).rg * 0.2;
  sum += texture(tex, uv + vec2( texel.x, 0)).rg * 0.2;
  sum += texture(tex, uv + vec2(0, -texel.y)).rg * 0.2;
  sum += texture(tex, uv + vec2(0,  texel.y)).rg * 0.2;
  sum += texture(tex, uv + vec2(-texel.x, -texel.y)).rg * 0.05;
  sum += texture(tex, uv + vec2( texel.x, -texel.y)).rg * 0.05;
  sum += texture(tex, uv + vec2(-texel.x,  texel.y)).rg * 0.05;
  sum += texture(tex, uv + vec2( texel.x,  texel.y)).rg * 0.05;
  return sum - s; // ∇² ≈ sum(neighbors) - center*8, but normalized: weights sum=1, so ∇²≈ sum-s
}

vec4 blur3x3(sampler2D tex, vec2 uv, vec2 texel) {
  vec4 sum = vec4(0.0);
  for (int y = -1; y <= 1; y++) {
    for (int x = -1; x <= 1; x++) {
      sum += texture(tex, uv + vec2(float(x), float(y)) * texel);
    }
  }
  return sum / 9.0;
}
`;
