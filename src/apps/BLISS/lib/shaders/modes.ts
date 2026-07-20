import { commonGLSL } from './common';

const vert = `void main() { gl_Position = vec4(position.xy, 0.0, 1.0); }`;

export type VizMode = {
  name: string;
  vertex: string;
  fragment: string;
  simulate?: {
    init: string;
    step: string;
    substeps?: number;
  };
};

function frag(body: string) {
  return commonGLSL + `
void main() {
  vec2 uv = (gl_FragCoord.xy - 0.5 * uResolution) / min(uResolution.x, uResolution.y);
  float t = uTime * uSpeed;
  float ar = uAudioOn * uReactivity;
  vec3 col;
` + body + `
  col = applyPostFX(col);
  gl_FragColor = vec4(col, 1.0);
}`;
}

export const vizModes: VizMode[] = [
  // 0: NEURAL FIELD
  {
    name: 'Neural Field',
    vertex: vert,
    fragment: frag(`
      vec2 p = warpToMouse(uv);
      int oc = octaves();
      vec2 q = vec2(
        fbm(p + vec2(0.0, t * 0.12 + uBass * ar * 0.4), oc),
        fbm(p + vec2(5.2, 1.3) - t * 0.10, oc)
      );
      vec2 b = vec2(
        fbm(p + 4.0 * q + vec2(1.7, 9.2) + t * 0.15 + uMid * ar * 0.2, oc),
        fbm(p + 4.0 * q + vec2(8.3, 2.8), oc)
      );
      float f = fbm(p + 4.0 * b, oc);
      float stripe = sin(f * 18.0 + t * 0.8 + uBass * ar * 3.0);
      float spot = smoothstep(0.1, 0.3, abs(f - 0.5));
      col = PAL(fract(f + 0.18 * length(b) - 0.04 * t + uTreble * ar * 0.2), uPalette);
      col *= 0.35 + 0.85 * spot;
      col += PAL(fract(0.5 + stripe * 0.3), uPalette) * 0.15 * ar;
      col += col * uBeat * ar * 0.35;
    `),
  },

  // 1: SACRED GEOMETRY
  {
    name: 'Sacred Geometry',
    vertex: vert,
    fragment: frag(`
      vec2 p = warpToMouse(uv);
      float r = length(p) + 1e-3;
      float th = atan(p.y, p.x) + t * 0.08;
      float N = max(3.0, uSymmetry);
      float cnt = mix(28.0, 90.0, uComplexity);
      float golden = 2.39996323;
      float glow = 0.0;
      for (int i = 1; i <= 90; i++) {
        if (float(i) > cnt) break;
        float fi = float(i);
        vec2 c = 0.045 * sqrt(fi) * vec2(
          cos(fi * golden + t * 0.25 + uBass * ar * 2.0),
          sin(fi * golden + t * 0.25 + uBass * ar * 2.0)
        );
        glow += smoothstep(0.03, 0.0, length(p - fold(c, N)));
      }
      int oc = octaves();
      vec2 q = fold(rot(t * 0.08) * p * (1.0 + 0.18 * sin(t * 0.5 + uBeat * ar)), N);
      float pat = fbm(q * 3.0 + vec2(t * 0.18, 0.0), oc)
                + 0.5 * fbm(q * 6.0 - t * 0.1, oc);
      col = PAL(fract(pat + 0.12 * t + uBass * ar * 0.3), uPalette) * (0.5 + 0.6 * pat);
      col += PAL(fract(0.3 + t * 0.1), uPalette) * glow * 0.9;
      col += col * uBeat * ar * 0.4;
    `),
  },

  // 2: HYPERSPACE
  {
    name: 'Hyperspace',
    vertex: vert,
    fragment: frag(`
      vec2 p = warpToMouse(uv);
      float n = max(6.0, uSymmetry);
      vec2 q = fold(p, n);
      float r = length(p) + 0.08;
      float a = atan(q.y, q.x);
      float depth = 1.0 / r + t * 0.6;
      int oc = octaves();
      vec2 tp = vec2(a * 3.0, depth);
      float pat = fbm(tp * 2.0, oc) + 0.5 * fbm(tp * 5.0 - t, oc)
                + 0.5 * sin(depth * 6.0 + a * n);
      col = PAL(fract(pat * 0.6 + depth * 0.08 - t * 0.1 + uBass * ar * 0.3), uPalette);
      col *= 0.4 + 1.2 * smoothstep(0.0, 0.5, r);
      col += PAL(fract(t * 0.2), uPalette) * exp(-r * 5.0) * 1.2;
      col += col * uBeat * ar * 0.5;
    `),
  },

  // 3: QUASICRYSTAL
  {
    name: 'Quasicrystal',
    vertex: vert,
    fragment: frag(`
      vec2 p = warpToMouse(uv) * mix(3.0, 8.0, uComplexity);
      float N = clamp(floor(uSymmetry), 3.0, 12.0);
      float v = 0.0;
      float ph = t * 0.5 + uBass * ar * 4.0;
      for (int i = 0; i < 12; i++) {
        if (float(i) >= N) break;
        float a = PI * float(i) / N;
        v += cos(p.x * cos(a) + p.y * sin(a) + ph);
      }
      v /= N;
      float band = 0.5 + 0.5 * cos(v * PI * 4.0 + t + uBeat * ar);
      col = PAL(fract(v * 0.6 + 0.1 * t + uCentroid * 0.3), uPalette) * (0.35 + 0.95 * band);
      col += col * uBeat * ar * 0.3;
    `),
  },

  // 4: CYMATICS
  {
    name: 'Cymatics',
    vertex: vert,
    fragment: frag(`
      vec2 p = warpToMouse(uv);
      float n = floor(mix(2.0, 9.0, uComplexity)) + floor(uMid * ar * 5.0);
      float m = floor(mix(1.0, 7.0, uComplexity)) + floor(uTreble * ar * 5.0);
      float f = cos(n * PI * p.x * 0.5) * cos(m * PI * p.y * 0.5)
              - cos(m * PI * p.x * 0.5) * cos(n * PI * p.y * 0.5);
      f += 0.3 * sin(t * 0.5 + uBeat * ar * 0.5) * cos((n + m) * PI * length(p) * 0.4);
      float nodal = smoothstep(0.07, 0.0, abs(f));
      col = PAL(fract(0.5 + 0.25 * f + 0.08 * t + uBass * ar * 0.2), uPalette) * (0.12 + nodal * 1.1);
      col += vec3(0.9, 0.85, 0.7) * nodal * 0.4;
    `),
  },

  // 5: WAVEFORM / OSCILLOSCOPE
  {
    name: 'Waveform',
    vertex: vert,
    fragment: frag(`
      vec2 q = uv * 2.4;
      q = rot(t * 0.03) * q;
      float r = length(q), a = atan(q.y, q.x);
      float s = abs(fract(a / TAU) * 2.0 - 1.0);
      vec2 wv = texture(uWaveform, vec2(s, 0.5)).rg * 2.0 - 1.0;
      float w = 0.011 + 0.6 / uResolution.y;
      float dL = abs(r - (0.98 + wv.x * 0.52));
      float dR = abs(r - (0.60 + wv.y * 0.30));
      vec3 cL = PAL(fract(s * 0.6 + 0.10 * t + uCentroid * 0.3), uPalette);
      vec3 cR = PAL(fract(s * 0.6 + 0.5 + 0.10 * t), uPalette);
      col = cL * smoothstep(w, 0.0, dL) * 1.1 + cL * smoothstep(0.05, 0.0, dL) * 0.10;
      col += cR * smoothstep(w, 0.0, dR) * 0.9 + cR * smoothstep(0.05, 0.0, dR) * 0.08;
      col += vec3(0.85, 0.9, 1.05) * smoothstep(0.03, 0.0, r) * (0.35 + uLevel * ar * 0.9);
      col *= 0.9 + uLevel * ar * 0.4;
    `),
  },

  // 6: ATOMIC BEAT
  {
    name: 'Atomic Beat',
    vertex: vert,
    fragment: frag(`
      vec2 p = warpToMouse(uv) * 1.15;
      float r = length(p) + 1e-4;
      float c = p.y / r;
      int nA = 2, lA = 1;
      int nB = (uComplexity > 0.55) ? 4 : 3;
      int lB = (uSymmetry > 7.0) ? 3 : 2;
      if (nB <= lB) nB = lB + 1;
      float angA, angB;
      if (lA == 0) angA = 1.0; else if (lA == 1) angA = c;
      else if (lA == 2) angA = 0.5 * (3.0 * c * c - 1.0); else angA = 0.5 * c * (5.0 * c * c - 3.0);
      if (lB == 0) angB = 1.0; else if (lB == 1) angB = c;
      else if (lB == 2) angB = 0.5 * (3.0 * c * c - 1.0); else angB = 0.5 * c * (5.0 * c * c - 3.0);
      float rhoA = 2.0 * r / float(nA);
      float rhoB = 2.0 * r / float(nB);
      float psiA = pow(rhoA, float(lA)) * exp(-0.5 * rhoA) * angA;
      float psiB = pow(rhoB, float(lB)) * exp(-0.5 * rhoB) * angB * 0.55;
      float w = clamp(0.30 + 0.55 * uCentroid, 0.05, 0.95);
      float wa = sqrt(1.0 - w), wb = sqrt(w);
      float omega = 1.10 + uBass * ar * 2.6 + uBands0.y * 1.6;
      float beatPhase = t * omega + uBeat * ar * PI;
      float re = wa * psiA + wb * psiB * cos(beatPhase);
      float im = wb * psiB * sin(beatPhase);
      float dens = re * re + im * im;
      float phase = atan(im, re);
      float gain = mix(1.6, 4.6, uComplexity);
      float lum = pow(clamp(dens * gain, 0.0, 1.0), 0.62);
      col = PAL(fract(phase / TAU + 0.12 * r - 0.05 * t + 0.30 * uCentroid), uPalette) * lum;
      col += PAL(fract(0.5 + phase / TAU), uPalette) * smoothstep(0.55, 1.0, lum) * (0.35 + 0.5 * uFlux * ar);
      float node = smoothstep(0.0, 0.045, sqrt(dens));
      col *= mix(1.0, node, 0.6 + 0.4 * uFlux * ar);
      col *= smoothstep(0.0, 0.06, r);
      col = max(col, 0.0);
    `),
  },

  // 7: VORTEX FIELD
  {
    name: 'Vortex Field',
    vertex: vert,
    fragment: frag(`
      vec2 p = warpToMouse(uv);
      p = rot(t * 0.03) * p;
      float scale = mix(2.0, 5.0, uComplexity) + uBass * ar * 1.0;
      vec2 g = p * scale;
      const vec2 b1 = vec2(1.0, 0.0), b2 = vec2(0.5, 0.8660254);
      const mat2 Binv = mat2(1.1547, 0.0, -0.5774, 1.1547);
      vec2 base = floor(Binv * g);
      float phase = 0.0, amp = 1.0, nearest = 1e9;
      for (int j = -1; j <= 1; j++) {
        for (int i = -1; i <= 1; i++) {
          vec2 cell = base + vec2(float(i), float(j));
          vec2 v = cell.x * b1 + cell.y * b2;
          v += 0.10 * vec2(sin(t * 0.5 + cell.x * 1.7 + uBands0.w * ar),
                            cos(t * 0.4 + cell.y * 2.1));
          vec2 d = g - v;
          float dl = length(d);
          phase += atan(d.y, d.x);
          amp *= tanh(dl * 1.7);
          nearest = min(nearest, dl);
        }
      }
      float fringe = 0.5 + 0.5 * cos(phase - t * 2.0 + uCentroid * 3.0);
      col = PAL(fract(phase / TAU + uCentroid * 0.3 + 0.04 * t), uPalette) * (0.2 + 0.85 * amp);
      col += PAL(fract(0.5 + 0.1 * t), uPalette) * pow(fringe, 4.0) * amp * 0.4;
      col += vec3(0.7, 0.85, 1.0) * exp(-nearest * nearest * 6.0) * (0.3 + 0.7 * uBeatPulse * ar);
      col = max(col, 0.0);
    `),
  },

  // ────────────────────────────────────────────────────────────────────────────
  // 8: PSYCHEDECURIO — after Vovosunt (Shadertoy 3llGzH "Psychedelic Curiosity")
  //     Grid of blinking, wandering eyes. Macros alias iTime/iResolution/iMouse to
  //     BLISS uniforms so the original function bodies stay intact. Gentle audio
  //     coupling: bass/level nudge blink timing, beat adds a soft glow.
  // ────────────────────────────────────────────────────────────────────────────
  {
    name: 'Psychedelic',
    vertex: vert,
    fragment: commonGLSL + `
float eyeTime;
#define iResolution uResolution
#define iTime eyeTime
#define iMouse vec3(uMouse*uResolution.xy, 0.0)

vec3 pal(in float t, in vec3 a, in vec3 b, in vec3 c, in vec3 d){
  return a + b*cos(6.28318*(c*t+d));
}
vec3 pal1(in float t){
  return pal(t, vec3(0.5,0.5,0.5), vec3(0.5,0.5,0.5), vec3(1.0,1.0,1.0), vec3(0.0,0.33,0.67));
}
float rand(vec3 v){ return fract(cos(dot(v,vec3(13.46543,67.1132,123.546123)))*43758.5453); }
float rand(vec2 v){ return fract(sin(dot(v,vec2(5.11543,71.3177)))*43758.5453); }
float rand(float v){ return fract(sin(v*71.3132)*43758.5453); }
vec2 rand2(vec2 v){
  return vec2(fract(sin(dot(v,vec2(5.11543,71.3132)))*43758.5453),
              fract(sin(dot(v,vec2(7.3113,21.5723)))*31222.1234));
}
vec2 pcRotate(vec2 st, float angle){
  float c=cos(angle), s=sin(angle);
  return mat2(c,-s,s,c)*st;
}

#define PC_SMOOTH (16.0/uResolution.x)
#define S(x) smoothstep(-PC_SMOOTH, PC_SMOOTH, x)
#define SR(x,y) smoothstep(-PC_SMOOTH*y, PC_SMOOTH*y, x)
#define scalex 5.0
#define scaley 5.0
#define scx (scalex*6.2831853)

vec3 eye(vec2 fst, vec2 cst, vec2 mouse){
  float mouseDown = clamp(iMouse.z, 0.0, 1.0);
  float noise = rand(cst);
  float nt = iTime*2.0*(noise+0.8) + noise*100.0;
  float fnt = floor(nt);
  vec2 noise2 = rand2(cst + vec2(fnt));
  vec2 noise22 = rand2(cst + vec2(fnt+1.0));
  float pinoise = noise2.x*6.2831853;
  float pinoise2 = noise22.x*6.2831853;
  float move = 1.0 - (cos(fract(nt)*3.14159265)+1.0)/2.0;
  move = pow(move,4.0);
  float eyeOpen = (sin(iTime*2.0 + noise*100.0)+1.0)/2.0;
  eyeOpen = mix(eyeOpen, 0.0, mouseDown);
  eyeOpen = 1.0 - pow(eyeOpen, 3.0);
  float col = (sin(fst.x)+1.0)/2.0;
  float col2 = col*eyeOpen + fst.y*2.1 - 0.1;
  col = col*eyeOpen - fst.y*2.1 - 0.1;
  float cs2 = S(min(col-0.1, col2-0.1));
  col = S(min(col, col2));
  float grad = min(eyeOpen*1.2, 1.0);
  vec2 loc = vec2(fract(fst.x/3.14159265/2.0 + 6.2831853) - 0.53, fst.y*uResolution.y/uResolution.x);
  vec2 pin2 = mix(vec2(cos(pinoise),sin(pinoise))*((noise2.y+1.0)/2.0),
                  vec2(cos(pinoise2),sin(pinoise2))*((noise22.y+1.0)/2.0), move);
  pin2 *= 0.25;
  pin2 = mix(pin2, mouse, max(mouseDown-0.05, 0.0));
  float lloc = length(loc);
  float irisn = mix(1.0, mix(noise2.x, noise22.x, move), 0.25);
  float iris = length(loc - pin2*(0.5-lloc));
  float irisWhite = length(loc - pin2*(0.2-lloc));
  float irisDark = SR(length(loc - pin2*(0.4-lloc)) - 0.05*irisn, 0.5);
  float irisShadow = SR(-irisWhite + 0.07, 15.0);
  irisWhite = SR(-irisWhite + 0.03, 1.4);
  vec3 irisColor = irisDark*pal1(irisShadow + nt/10.0);
  irisColor = max(irisColor, irisWhite*0.9);
  vec3 baseCol = vec3(SR(-lloc+0.25, 15.0));
  baseCol = baseCol + 0.25*pal1(baseCol.x + nt/10.0);
  vec3 finCol = mix(baseCol, irisColor, S(-iris + 0.15));
  finCol = mix(pal1(noise + nt/10.0)*grad, finCol, cs2);
  finCol = min(finCol, col);
  return finCol;
}

void main(){
  float t = uTime*uSpeed; float ar = uAudioOn*uReactivity;
  eyeTime = t*(1.0 + uBass*ar*0.3 + uLevel*ar*0.2);
  vec2 st = gl_FragCoord.xy/uResolution.xy;
  vec2 mouse = (iMouse.xy)/uResolution.xy;
  float fsty = fract(st.y*scaley) - 0.5;
  float fsty2 = fract(st.y*scaley + 0.5) - 0.5;
  float csty = floor(st.y*scaley);
  float csty2 = floor(st.y*scaley + 0.5);
  float cstx = floor(st.x*scalex);
  float cstx2 = floor(st.x*scalex + 0.5);
  vec2 cst = vec2(cstx, csty);
  vec2 cst2 = vec2(cstx2, csty2 + 1234.0);
  vec2 fst = vec2(st.x*scx - 0.5*3.14159265, fsty);
  vec2 fst2 = vec2(st.x*scx + 0.5*3.14159265, fsty2);
  vec2 m1 = mouse - vec2((cstx+0.5)/scalex, (csty+0.5)/scaley);
  vec2 m2 = mouse - vec2((cstx2+0.5)/scalex, (csty2+0.5)/scaley);
  vec3 col = eye(fst, cst, m1);
  vec3 col2 = eye(fst2, cst2, m2);
  col = max(col, col2);
  col += 0.1*(rand(gl_FragCoord.xy/3.0 + iTime) - 0.5);
  col += col*uBeatPulse*ar*0.15;
  col = applyPostFX(col);
  gl_FragColor = vec4(col, 1.0);
}
`,
  },

  // ────────────────────────────────────────────────────────────────────────────
  // 9: 3D FRACTAL RAYMARCH (Mandelbulb / Quaternion Julia / Mandelbox)
  // ────────────────────────────────────────────────────────────────────────────
  {
    name: 'Fractal 3D',
    vertex: vert,
    fragment: commonGLSL + `
// Quaternion multiply
vec4 qmul(vec4 a, vec4 b) {
  return vec4(
    a.x*b.x - a.y*b.y - a.z*b.z - a.w*b.w,
    a.x*b.y + a.y*b.x + a.z*b.w - a.w*b.z,
    a.x*b.z - a.y*b.w + a.z*b.x + a.w*b.y,
    a.x*b.w + a.y*b.z - a.z*b.y + a.w*b.x
  );
}

void main() {
  vec2 uv = (gl_FragCoord.xy - 0.5 * uResolution) / min(uResolution.x, uResolution.y);
  float t = uTime * uSpeed;
  float ar = uAudioOn * uReactivity;
  vec3 col;

  // Camera: orbiting sphere
  float camDist = 3.5 - uBass * ar * 0.5;
  float camAngle = t * 0.15;
  float camPitch = 0.3 + 0.15 * sin(t * 0.08);
  vec3 camPos = vec3(
    camDist * cos(camAngle) * cos(camPitch),
    camDist * sin(camPitch) + 0.3 * sin(t * 0.12),
    camDist * sin(camAngle) * cos(camPitch)
  );
  // Mouse warp camera target
  vec2 mOff = (uMouse - 0.5) * 2.0;
  mOff.x *= uResolution.x / uResolution.y;
  vec3 camTarget = vec3(mOff * 0.8, 0.0);

  // Camera basis
  vec3 fwd = normalize(camTarget - camPos);
  vec3 right = normalize(cross(fwd, vec3(0.0, 1.0, 0.0)));
  vec3 up = cross(right, fwd);
  vec3 rd = normalize(uv.x * right + uv.y * up + 1.6 * fwd);

  // Fractal type from symmetry slider: 3-4 → Mandelbulb, 5-6 → Julia, 7+ → Mandelbox
  int fType = int(uSymmetry);

  // Fractal parameters
  float power = mix(4.0, 9.0, uComplexity) + uBass * ar * 2.0;
  int maxIters = int(mix(8.0, 24.0, uComplexity));
  int maxSteps = 80;
  vec4 qC = vec4(
    -0.8 + 0.3 * sin(t * 0.2),
    0.2 + 0.2 * cos(t * 0.15 + uTreble * ar),
    0.15 * sin(t * 0.18 + uMid * ar),
    0.1 * cos(t * 0.22)
  );
  float mbScale = mix(2.0, 3.0, uComplexity) + 0.5 * sin(t * 0.1 + uBass * ar);

  // Raymarch
  float tDist = 0.0;
  float glow = 0.0;
  float minDist = 1e10;
  vec3 orbTrap = vec3(1e10);
  bool hit = false;
  vec3 p;

  for (int i = 0; i < 80; i++) {
    if (i >= maxSteps) break;
    p = camPos + rd * tDist;
    // Rotate slowly
    p = rotY(t * 0.08) * p;
    p = rotX(t * 0.05 + 0.3) * p;

    float de;
    vec3 trap;
    if (fType <= 4) {
      de = mandelbulbDE(p, power, maxIters, trap);
    } else if (fType <= 6) {
      de = quatJuliaDE(p, qC, maxIters, trap);
    } else {
      de = mandelboxDE(p, mbScale, maxIters, trap);
    }
    orbTrap = min(orbTrap, trap);
    minDist = min(minDist, de);
    glow += 0.06 * (1.0 - smoothstep(0.0, 0.15, de));

    if (de < 0.0005) { hit = true; break; }
    if (tDist > 20.0) break;
    tDist += de;
  }

  if (hit) {
    // Estimate normal via gradient
    vec3 e = vec3(0.001, 0.0, 0.0);
    vec3 n;
    vec3 t1, t2;
    if (fType <= 4) {
      float d1 = mandelbulbDE(p+e.xyy, power, maxIters, t1);
      float d2 = mandelbulbDE(p-e.xyy, power, maxIters, t2);
      n.x = d1 - d2;
      d1 = mandelbulbDE(p+e.yxy, power, maxIters, t1);
      d2 = mandelbulbDE(p-e.yxy, power, maxIters, t2);
      n.y = d1 - d2;
      d1 = mandelbulbDE(p+e.yyx, power, maxIters, t1);
      d2 = mandelbulbDE(p-e.yyx, power, maxIters, t2);
      n.z = d1 - d2;
    } else if (fType <= 6) {
      float d1 = quatJuliaDE(p+e.xyy, qC, maxIters, t1);
      float d2 = quatJuliaDE(p-e.xyy, qC, maxIters, t2);
      n.x = d1 - d2;
      d1 = quatJuliaDE(p+e.yxy, qC, maxIters, t1);
      d2 = quatJuliaDE(p-e.yxy, qC, maxIters, t2);
      n.y = d1 - d2;
      d1 = quatJuliaDE(p+e.yyx, qC, maxIters, t1);
      d2 = quatJuliaDE(p-e.yyx, qC, maxIters, t2);
      n.z = d1 - d2;
    } else {
      float d1 = mandelboxDE(p+e.xyy, mbScale, maxIters, t1);
      float d2 = mandelboxDE(p-e.xyy, mbScale, maxIters, t2);
      n.x = d1 - d2;
      d1 = mandelboxDE(p+e.yxy, mbScale, maxIters, t1);
      d2 = mandelboxDE(p-e.yxy, mbScale, maxIters, t2);
      n.y = d1 - d2;
      d1 = mandelboxDE(p+e.yyx, mbScale, maxIters, t1);
      d2 = mandelboxDE(p-e.yyx, mbScale, maxIters, t2);
      n.z = d1 - d2;
    }
    n = normalize(n);
    // Lighting
    vec3 lightDir = normalize(vec3(0.577, 0.577, 0.577));
    float diff = max(dot(n, lightDir), 0.0);
    float fresnel = pow(1.0 + dot(rd, n), 3.0);
    // AO from iteration count / orbit trap
    float ao = 1.0 - 0.5 * smoothstep(0.0, 2.0, length(orbTrap));
    // Color from orbit trap
    col = PAL(fract(orbTrap.x * 0.4 + 0.1 * t + uTreble * ar * 0.3), uPalette);
    col *= 0.15 + 0.85 * diff * ao;
    col += PAL(fract(0.5 + orbTrap.y * 0.3), uPalette) * fresnel * 0.35;
    col *= 0.8 + 0.4 * uBeatPulse * ar;
  } else {
    // Background glow / fog
    col = PAL(fract(t * 0.05 + 0.3), uPalette) * glow * 0.15;
    col += PAL(fract(0.7 + t * 0.03), uPalette) * 0.03;
  }

  // Distance fog
  col *= exp(-tDist * 0.06);
  col = max(col, 0.0);

  col = applyPostFX(col);
  gl_FragColor = vec4(col, 1.0);
}
`,
  },

  // ────────────────────────────────────────────────────────────────────────────
  // 10: CIRCLE PATTERN — after Inigo Quilez (Shadertoy lss3Df)
  //     2D superellipsoid circle pattern driven by value noise. iChannel1 noise
  //     replaced by procedural vnoise; fwidth (derivatives) replaced by a
  //     resolution-based AA width. Complexity drives speed, beat boosts glow.
  // ────────────────────────────────────────────────────────────────────────────
  {
    name: 'Circle Pattern',
    vertex: vert,
    fragment: commonGLSL + `
float cirTime;
#define NUM 9.0
#define fwidthq(a) (1.2/uResolution.y)

float cirMap(in vec2 x, float tt){
  return vnoise(2.5*x - sin(6.2831*tt/15.0 + vec2(1.5,0.0)));
}

float shapes(in vec2 uv, in float r, in float e){
  float p = pow(32.0, r - 0.5);
  float l = pow(pow(abs(uv.x),p) + pow(abs(uv.y),p), 1.0/p);
  float d = l - pow(r,0.6) - e*0.2 + 0.05;
  float fw = fwidthq(d)*0.5;
  fw *= 1.0 + 10.0*e;
  return (r)*smoothstep(fw,-fw,d)*(1.0-0.2*e)*(0.4 + 0.6*smoothstep(-fw,fw,abs(l-r*0.8+0.05)-0.1));
}

void main(){
  float t = uTime*uSpeed; float ar = uAudioOn*uReactivity; vec3 col = vec3(0.0);
  cirTime = t*(1.0 + uComplexity*0.6);
  vec2 qq = gl_FragCoord.xy/uResolution.xy;
  vec2 uv = gl_FragCoord.xy/uResolution.xx;
  uv *= 1.5;
  float time = 11.0 + (cirTime + 0.8*sin(cirTime))/1.8;
  uv += 0.01*vnoise(12.0*uv + 0.1*time);
  vec2 pq, st; vec3 coo;
  // teal
  pq = floor(uv*NUM)/NUM;
  st = fract(uv*NUM)*2.0 - 1.0;
  coo = (vec3(0.5,0.7,0.7) + 0.3*sin(10.0*pq.x)*sin(13.0*pq.y))*0.6;
  col += 1.0*coo*shapes(st, cirMap(pq,time), 0.0);
  col += 0.6*coo*shapes(st, cirMap(pq,time), 1.0);
  // orange
  pq = floor(uv*NUM+0.5)/NUM;
  st = fract(uv*NUM+0.5)*2.0 - 1.0;
  coo = (vec3(1.0,0.5,0.3) + 0.3*sin(10.0*pq.y)*cos(11.0*pq.x))*1.0;
  col += 1.0*coo*shapes(st, 1.0-cirMap(pq,time), 0.0);
  col += 0.4*coo*shapes(st, 1.0-cirMap(pq,time), 1.0);
  col *= pow(16.0*qq.x*qq.y*(1.0-qq.x)*(1.0-qq.y), 0.05);
  col *= 0.85 + uLevel*ar*0.45;
  col += col*uBeatPulse*ar*0.25;
  col = applyPostFX(col);
  gl_FragColor = vec4(col, 1.0);
}
`,
  },

  // ────────────────────────────────────────────────────────────────────────────
  // 11: MENGER TUNNEL — after Shane (Shadertoy 4scXzn "Winding Menger Tunnel")
  //     Sinusoidal Menger tunnel + interwoven tubing + glowing screens. The
  //     original iChannel0 texture (tri-planar limestone) is replaced by procedural
  //     value-noise; uMouse gives look-around. Gentle audio: bass nudges flight
  //     speed, treble glows screens, beat adds a soft global glow.
  // ────────────────────────────────────────────────────────────────────────────
  {
    name: 'Menger Tunnel',
    vertex: vert,
    fragment: commonGLSL + `
float mengerTime;

float mhash(float n){ return fract(cos(n)*45758.5453); }
float shpn2(vec2 x){
  vec2 i=floor(x), f=fract(x); vec2 u=f*f*(3.0-2.0*f);
  return mix(mix(hash21(i), hash21(i+vec2(1.0,0.0)), u.x),
             mix(hash21(i+vec2(0.0,1.0)), hash21(i+vec2(1.0,1.0)), u.x), u.y);
}
// Tri-planar procedural noise (replaces iChannel0 limestone texture).
vec3 tex3D(sampler2D tx, in vec3 p, in vec3 n){
  n = max(abs(n), 0.001); n /= (n.x+n.y+n.z);
  return vec3(shpn2(p.yz*3.0)*n.x + shpn2(p.zx*3.0)*n.y + shpn2(p.xy*3.0)*n.z);
}
float sminP(float a, float b, float s){
  float h = clamp(0.5+0.5*(b-a)/s, 0.0, 1.0);
  return mix(b,a,h) - s*h*(1.0-h);
}
vec2 mPath(in float x){
  return vec2(cos(x*0.25)*1.8 + cos(x*0.15)*1.5, sin(x*0.25)*1.2 + sin(x*0.15));
}
vec3 camPath(float tt){ return vec3(mPath(tt), tt); }

float Menger(in vec3 q){
  float s = 4.0;
  vec3 p = abs(fract(q/s)*s - s*0.5);
  float d = min(max(p.x,p.y), min(max(p.y,p.z), max(p.x,p.z))) - s/3.0;
  s /= 2.0;
  p = abs(fract(q/s)*s - s*0.5);
  d = max(d, min(max(p.x,p.y), min(max(p.y,p.z), max(p.x,p.z))) - s/3.0);
  s /= 3.0;
  p = abs(fract(q/s)*s - s*0.5);
  d = max(d, min(max(p.x,p.y), min(max(p.y,p.z), max(p.x,p.z))) - s/3.0);
  return min(d, q.y + 0.8);
}
float tubing(in vec3 p){
  p = fract(p/2.0)*2.0 - 1.0;
  float x1 = sminP(length(p.xy), sminP(length(p.yz), length(p.xz), 0.25), 0.25) - 0.5;
  p = abs(fract(p*2.0)*0.5 - 0.25);
  float x2 = min(p.x, min(p.y, p.z)) - 0.025;
  return max(abs(x1), abs(x2)) - 0.0175;
}
float objID;
float mmap(in vec3 p){
  p.xy -= mPath(p.z);
  float tube = tubing(p);
  float walls = Menger(p);
  p += vec3(sign(p.x)*(-0.11 + sin(p.z*6.28318 + 1.5708)*0.05), 0.0, 0.0);
  vec3 q = abs(mod(p + vec3(0.0,0.5,0.0), vec3(1.0,1.0,2.0)) - vec3(0.5,0.5,1.0));
  float screen = max(max(q.y,q.z)-0.22, q.x-0.05);
  screen = max(screen, max(abs(p.x)-0.5, abs(p.y)-0.22));
  objID = 1.0 + step(tube, walls) + step(screen, tube)*step(screen, walls)*2.0;
  return min(min(tube, walls), screen);
}
vec3 calcNormal(in vec3 p){
  vec2 e = vec2(0.0025, -0.0025);
  return normalize(e.xyy*mmap(p+e.xyy) + e.yyx*mmap(p+e.yyx) + e.yxy*mmap(p+e.yxy) + e.xxx*mmap(p+e.xxx));
}
float calcAO(in vec3 pos, in vec3 nor){
  float sca = 2.0, occ = 0.0;
  for(int i=0;i<5;i++){
    float hr = 0.01 + float(i)*0.5/4.0;
    float dd = mmap(nor*hr + pos);
    occ += (hr-dd)*sca; sca *= 0.7;
  }
  return clamp(1.0-occ, 0.0, 1.0);
}
vec3 texBump(sampler2D tx, in vec3 p, in vec3 n, float bf){
  const vec2 e = vec2(0.002, 0.0);
  mat3 m = mat3(tex3D(tx, p-e.xyy, n), tex3D(tx, p-e.yxy, n), tex3D(tx, p-e.yyx, n));
  vec3 g = vec3(0.299,0.587,0.114)*m;
  g = (g - dot(tex3D(tx, p, n), vec3(0.299,0.587,0.114)))/e.x; g -= n*dot(n,g);
  return normalize(n + g*bf);
}
vec3 rotHue(vec3 p, float a){
  vec2 cs = sin(vec2(1.570796, 0.0) + a);
  mat3 hr = mat3(0.299,0.587,0.114, 0.299,0.587,0.114, 0.299,0.587,0.114)
          + mat3(0.701,-0.587,-0.114, -0.299,0.413,-0.114, -0.300,-0.588,0.886)*cs.x
          + mat3(0.168,0.330,-0.497, -0.328,0.035,0.292, 1.250,-1.050,-0.203)*cs.y;
  return clamp(p*hr, 0.0, 1.0);
}
float dotPattern(vec2 p){
  vec2 fp = abs(fract(p)-0.5)*2.0;
  fp = pow(fp, vec2(8.0));
  float r = max(1.0 - pow(fp.x+fp.y, 1.0), 0.0);
  p = floor(p);
  float c = dot(sin(p/4.0 - cos(p.yx/0.2 + mengerTime/4.0)), vec2(0.5));
  c = fract(c*7.0);
  return c*r;
}

void main(){
  float t = uTime*uSpeed; float ar = uAudioOn*uReactivity; vec3 col;
  mengerTime = t*(1.0 + uBass*ar*0.3);
  vec2 u = (gl_FragCoord.xy - uResolution.xy*0.5)/uResolution.y;
  vec3 ro = camPath(mengerTime*1.5);
  vec3 lk = camPath(mengerTime*1.5 + 0.1);
  vec3 lp = camPath(mengerTime*1.5 + 2.0) + vec3(0.0, 2.0, 0.0);
  float FOV = 1.57;
  vec3 fwd = normalize(lk-ro);
  vec3 rgt = normalize(vec3(fwd.z, 0.0, -fwd.x));
  vec3 up = cross(fwd, rgt);
  vec3 rd = normalize(fwd + FOV*(u.x*rgt + u.y*up));
  vec2 a = sin(vec2(1.5707963, 0.0) - camPath(lk.z).x/12.0);
  mat2 rM = mat2(a, -a.y, a.x);
  rd.xy = rd.xy*rM;
  vec2 ms = 2.0*uMouse - 1.0;
  a = sin(vec2(1.5707963, 0.0) - ms.x);
  rM = mat2(a, -a.y, a.x);
  rd.xz = rd.xz*rM;
  a = sin(vec2(1.5707963, 0.0) - ms.y);
  rM = mat2(a, -a.y, a.x);
  rd.yz = rd.yz*rM;

  const float FAR = 50.0;
  float t2 = 0.0, h;
  for(int i=0;i<80;i++){
    h = mmap(ro+rd*t2);
    if(abs(h)<0.001*(t2*0.75+0.25) || t2>FAR) break;
    t2 += h*0.75;
  }
  col = vec3(0.0);
  if(t2<FAR){
    float ts = 2.0;
    float saveObjID = objID;
    vec3 pos = ro + rd*t2;
    vec3 pOffs = pos - vec3(camPath(pos.z).xy, 0.0);
    vec3 nor = calcNormal(pos);
    if(saveObjID<2.5) nor = texBump(uSpectrum, pOffs*ts, nor, 0.002 + step(saveObjID,1.5)*0.012);
    col = tex3D(uSpectrum, pOffs*ts, nor);
    col = smoothstep(-0.3, 0.8, col)*vec3(1.0, 0.8, 0.7);
    float spot = max(2.0 - length(pOffs.xy - vec2(0.0,1.0)), 0.0)*(sin(pOffs.z*3.14159+1.5708)*0.5+0.5);
    spot = smoothstep(0.25, 1.0, spot);
    float occ = calcAO(pos, nor);
    vec3 li = normalize(lp - pos);
    float dif = clamp(dot(nor, li), 0.0, 1.0);
    float spe = pow(max(dot(reflect(-li, nor), -rd), 0.0), 8.0);
    float spe2 = 0.0;
    vec3 rCol = vec3(0.0);
    if(saveObjID>1.5){
      col = vec3(1.0)*dot(col*0.7+0.2, vec3(0.299,0.587,0.114));
      rCol = tex3D(uSpectrum, (pOffs + reflect(rd, nor))*ts, nor);
      col += rCol*0.25 + spot*0.125;
      spe2 = spe*spe*0.25;
      if(saveObjID<2.5) dif = pow(dif, 2.0)*1.25;
    }
    if(saveObjID>2.5){
      float c = dotPattern(pOffs.zy*36.0+0.5);
      col = vec3(min(c*1.5,1.0), pow(c,2.5), pow(c,12.0));
      col = mix(col.zyx, col, sin(dot(pos, vec3(0.333))*3.14159*6.0)*0.34+0.66);
      float id = mhash(dot(floor(pOffs + vec3(0.0,0.5,0.5)), vec3(7.0,157.0,113.0)));
      col = rotHue(col, floor(id*12.0)/12.0*3.14159);
      col += rCol*rCol*0.5;
      dif += 0.5;
      spe += 0.25;
      col *= 1.0 + uTreble*ar*0.5;
    }
    col *= (dif + 0.25 + spot*0.5 + vec3(0.25,0.3,0.5)*spe) + spe2;
    col *= occ;
  }
  col = mix(min(col,1.0), vec3(0.0), 1.0 - exp(-t2*t2/FAR/FAR*15.0));
  col += col*uBeatPulse*ar*0.12;
  col = applyPostFX(col);
  gl_FragColor = vec4(col, 1.0);
}
`,
  },

  // ────────────────────────────────────────────────────────────────────────────
  // 12: SYNTHWAVE SUNSET — after stduhpf (Shadertoy tsScRK)
  //     Raymarched neon terrain. The original's iChannel0 sound-texture sampling
  //     is replaced by BLISS's live FFT (uSpectrum) so the grid literally
  //     vibrates with the spectrum; bass drives flight speed, beat drives the sun.
  // ────────────────────────────────────────────────────────────────────────────
  {
    name: 'Synthwave',
    vertex: vert,
    fragment: commonGLSL + `
// ── globals ──────────────────────────────────────────────────────────────
float jTime;
float sh21(vec2 co){ return fract(sin(dot(co.xy,vec2(1.9898,7.233)))*45758.5433); }
float samp(float p2, float p1){ return smoothstep(p2,p1,abs(p2)); }
float spow512(float a){ a*=a;a*=a;a*=a;a*=a;a*=a;a*=a;a*=a;a*=a; return a*a; }
float spow1d5(float a){ return a*sqrt(a); }
// FFT-bin audio sample (replaces iChannel0 sound texture), with mirror wrap
float asample(vec2 c){
  float x = fract(c.x);
  x = mix(x, 1.0-x, mod(floor(c.x),2.0));
  return texture(uSpectrum, vec2(x,0.5)).r;
}
float shash(vec2 uv){
  float a = smoothstep(1.0,8.0,abs(uv.x));
  float w = a>0.0 ? (1.0-0.4*spow512(0.51+0.49*sin((0.02*(uv.y+0.5*uv.x)-jTime)*2.0))) : 0.0;
  return (a>0.0 ? a*spow1d5(sh21(uv))*w : 0.0)
       - asample(vec2((uv.x*29.0+uv.y)*0.03125,1.0)) * ar * 0.15;
}
float sedge(float dx, vec2 da, vec2 db, vec2 uv){
  uv.x += 5.0;
  vec3 c = fract((floor(vec3(uv,uv.x+uv.y)+vec3(0.5)))*(vec3(0.0,1.0,2.0)+0.61803398875));
  float a1 = asample(vec2(c.y,0.0))>0.6 ? 0.15 : 1.0;
  float a2 = asample(vec2(c.x,0.0))>0.6 ? 0.15 : 1.0;
  float a3 = asample(vec2(c.z,0.0))>0.6 ? 0.15 : 1.0;
  return min(min((1.0-dx)*db.y*a3, da.x*a2), da.y*a1);
}
vec2 trinoise(vec2 uv){
  const float sq = sqrt(3.0/2.0);
  uv.x *= sq; uv.y -= 0.5*uv.x;
  vec2 d = fract(uv); uv -= d;
  bool c = dot(d,vec2(1.0))>1.0;
  vec2 dd = 1.0-d;
  vec2 da = c?dd:d, db = c?d:dd;
  float nn = shash(uv+(c?1.0:0.0));
  float n2 = shash(uv+vec2(1.0,0.0));
  float n3 = shash(uv+vec2(0.0,1.0));
  float nmid = mix(n2,n3,d.y);
  float ns = mix(nn, c?n2:n3, da.y);
  float dx = da.x/db.y;
  return vec2(mix(ns,nmid,dx), sedge(dx,da,db,uv+d));
}
vec2 swmap(vec3 p){ vec2 n = trinoise(p.xz); return vec2(p.y-2.0*n.x, n.y); }
vec3 swgrad(vec3 p){
  const vec2 e = vec2(0.005,0.0);
  float a = swmap(p).x;
  return vec3(swmap(p+e.xyy).x-a, swmap(p+e.yxy).x-a, swmap(p+e.yyx).x-a)/e.x;
}
vec2 swintersect(vec3 ro, vec3 rd){
  float d=0.0, h=0.0;
  for(int i=0;i<96;i++){
    vec3 p = ro+d*rd;
    vec2 s = swmap(p); h = s.x;
    d += h*0.5;
    if(abs(h)<0.003*d) return vec2(d,s.y);
    if(d>150.0 || p.y>2.0) break;
  }
  return vec2(-1.0);
}
void saddsun(vec3 rd, vec3 ld, inout vec3 col){
  float sun = smoothstep(0.21,0.2,distance(rd,ld));
  if(sun>0.0){
    float yd = rd.y-ld.y;
    float a = sin(3.1*exp(-yd*14.0));
    sun *= smoothstep(-0.8,0.0,a);
    col = mix(col, vec3(1.0,0.8,0.4)*0.75, sun);
  }
}
float starnoise(vec3 rd){
  float c = 0.0;
  vec3 p = normalize(rd)*300.0;
  for(int i=0;i<4;i++){
    float fi = float(i);
    vec3 q = fract(p)-0.5;
    vec3 id = floor(p);
    float c2 = smoothstep(0.5,0.0,length(q));
    c2 *= step(sh21(id.xz/id.y), 0.06-fi*fi*0.005);
    c += c2;
    p = p*0.6 + 0.5*p*mat3(0.6,0.0,0.8, 0.0,1.0,0.0, -0.8,0.0,0.6);
  }
  c *= c;
  float g = dot(sin(rd*10.512), cos(rd.yzx*10.512));
  c *= smoothstep(-3.14,-0.9,g)*0.5 + 0.5*smoothstep(-0.3,1.0,g);
  return c*c;
}
vec3 gsky(vec3 rd, vec3 ld, bool mask){
  float haze = exp2(-5.0*(abs(rd.y)-0.2*dot(rd,ld)));
  float st = mask ? starnoise(rd)*(1.0-min(haze,1.0)) : 0.0;
  vec3 back = vec3(0.4,0.1,0.7)*(1.0 - 0.5*asample(vec2(0.5+0.05*rd.x/rd.y,0.0))
        *exp2(-0.1*abs(length(rd.xz)/rd.y))
        *max(sign(rd.y),0.0));
  vec3 skycol = clamp(mix(back, vec3(0.7,0.1,0.4), haze)+st, 0.0, 1.0);
  if(mask) saddsun(rd,ld,skycol);
  return skycol;
}
void main(){
  vec2 uv = (2.0*gl_FragCoord.xy - uResolution.xy)/uResolution.y;
  float t = uTime*uSpeed; float ar = uAudioOn*uReactivity; vec3 col;
  float jt = mod(t - fract(sh21(gl_FragCoord.xy)+t)*0.25*0.016, 4000.0);
  jTime = jt;
  float spd = 10.0*(1.0 + uBass*ar*0.4);
  vec3 ro = vec3(0.0, 1.0, -20000.0 + jt*spd);
  vec3 rd = normalize(vec3(uv, 4.0/3.0));
  vec2 hit = swintersect(ro,rd);
  float d = hit.x;
  vec3 ld = normalize(vec3(0.0, 0.125+0.05*sin(0.1*jt)+uBeat*ar*0.04, 1.0));
  vec3 sky = gsky(rd, ld, d<0.0);
  if(d>0.0){
    vec3 fog = exp2(-d*vec3(0.14,0.1,0.28));
    vec3 p = ro+d*rd;
    vec3 n = normalize(swgrad(p));
    float diff = dot(n,ld)+0.1*n.y;
    vec3 gc = PAL(fract(0.55+0.08*t+uMid*ar*0.1), uPalette)*0.45*diff;
    vec3 rfd = reflect(rd,n);
    gc = mix(gc, gsky(rfd,ld,true), 0.05+0.95*pow(max(1.0+dot(rd,n),0.0),5.0));
    gc = mix(gc, PAL(fract(0.92+uTreble*ar*0.15), uPalette), smoothstep(0.05,0.0,hit.y));
    col = mix(sky, gc, fog);
  } else {
    col = sky;
  }
  col = clamp(col,0.0,1.0);
  col += col*uBeatPulse*ar*0.15;
  col = applyPostFX(col);
  gl_FragColor = vec4(col,1.0);
}
`,
  },

  // ────────────────────────────────────────────────────────────────────────────
  // 13: TRUCHET TENTACLES — after WAHa_06x36 (Shadertoy ldfGWn)
  //     Raymarched 3D truchet lattice. Original cubemap reflection replaced by a
  //     procedural PAL env; camera bob on bass, palette tint, beat glow.
  // ────────────────────────────────────────────────────────────────────────────
  {
    name: 'Truchet',
    vertex: vert,
    fragment: commonGLSL + `
#define TRU_ITER 48
float trand(vec3 r){ return fract(sin(dot(r.xy,vec2(1.38984*sin(r.z),1.13233*cos(r.z))))*653758.5453); }
float truchetarc(vec3 pos){
  float r = length(pos.xy);
  return pow(pow(abs(r-0.5),8.0)+pow(abs(pos.z-0.5),8.0),0.125)-0.1;
}
float truchetcell(vec3 pos){
  return min(min(truchetarc(pos),
                 truchetarc(vec3(pos.z,1.0-pos.x,pos.y))),
                 truchetarc(vec3(1.0-pos.y,1.0-pos.z,pos.x)));
}
float distfunc(vec3 pos){
  vec3 cp = fract(pos); vec3 gp = floor(pos);
  float rnd = trand(gp);
  if(rnd<0.125) return truchetcell(cp);
  else if(rnd<0.25) return truchetcell(vec3(cp.x,1.0-cp.y,cp.z));
  else if(rnd<0.375) return truchetcell(vec3(1.0-cp.x,cp.y,cp.z));
  else if(rnd<0.5) return truchetcell(vec3(1.0-cp.x,1.0-cp.y,cp.z));
  else if(rnd<0.625) return truchetcell(vec3(cp.y,cp.x,1.0-cp.z));
  else if(rnd<0.75) return truchetcell(vec3(cp.y,1.0-cp.x,1.0-cp.z));
  else if(rnd<0.875) return truchetcell(vec3(1.0-cp.y,cp.x,1.0-cp.z));
  else return truchetcell(vec3(1.0-cp.y,1.0-cp.x,1.0-cp.z));
}
vec3 trugrad(vec3 pos){
  const float eps = 0.0001;
  float mid = distfunc(pos);
  return vec3(distfunc(pos+vec3(eps,0.0,0.0))-mid,
              distfunc(pos+vec3(0.0,eps,0.0))-mid,
              distfunc(pos+vec3(0.0,0.0,eps))-mid);
}
void main(){
  vec2 coords = (2.0*gl_FragCoord.xy - uResolution.xy)/length(uResolution.xy);
  float t = uTime*uSpeed; float ar = uAudioOn*uReactivity; vec3 col;
  float a = t/3.0;
  mat3 m = mat3(0.0,1.0,0.0, -sin(a),0.0,cos(a), cos(a),0.0,sin(a));
  m*=m; m*=m;
  vec3 ray_dir = m*normalize(vec3(2.0*coords, -1.0+dot(coords,coords)));
  float tt = t/3.0;
  vec3 ray_pos = vec3(
    2.0*(sin(tt+sin(2.0*tt)/2.0)/2.0+0.5),
    2.0*(sin(tt-sin(2.0*tt)/2.0-1.5707963)/2.0+0.5) + uBass*ar*0.15,
    2.0*((-2.0*(tt-sin(4.0*tt)/4.0)/3.14159265)+1.0));
  float it = float(TRU_ITER);
  for(int j=0;j<TRU_ITER;j++){
    float dist = distfunc(ray_pos);
    ray_pos += dist*ray_dir;
    if(abs(dist)<0.001){ it = float(j); break; }
  }
  vec3 normal = normalize(trugrad(ray_pos));
  float ao = 1.0 - it/float(TRU_ITER);
  float what = pow(max(0.0,dot(normal,-ray_dir)),2.0);
  float light = ao*what*1.4;
  vec3 base = (cos(ray_pos/2.0)+2.0)/3.0;
  base = mix(base, PAL(fract(ray_pos.x*0.08 + t*0.08 + uCentroid*0.2), uPalette), 0.55);
  vec3 reflected = reflect(ray_dir,normal);
  reflected = reflected*reflected*reflected;
  vec3 rn = normalize(reflected);
  float eh = rn.y*0.5+0.5;
  vec3 env = mix(PAL(fract(0.55+0.05*t),uPalette), PAL(fract(0.15+0.03*t),uPalette), eh);
  vec3 sp = fract(rn*40.0)-0.5;
  env += vec3(step(0.97, 1.0-length(sp))) * (0.6+0.4*sin(t*3.0+length(sp)*20.0));
  col = base*light + 0.12*env;
  col += col*uBeatPulse*ar*0.2;
  float vignette = pow(max(0.0,1.0-length(coords)),0.3);
  col *= vignette;
  col = applyPostFX(col);
  gl_FragColor = vec4(col,1.0);
}
`,
  },

  // ────────────────────────────────────────────────────────────────────────────
  // 14: KALEIDO BLOOM — after kishimisu (Shadertoy mtyGWy)
  //     The classic intro fractal-fold bloom, expanded: bass folds the space,
  //     mids sharpen the sine lobes, palette drives color, beat boosts glow.
  // ────────────────────────────────────────────────────────────────────────────
  {
    name: 'Kaleido Bloom',
    vertex: vert,
    fragment: frag(`
      col = vec3(0.0);
      vec2 uv0 = uv;
      vec2 u2 = uv;
      float layers = mix(3.0, 6.0, uComplexity);
      for (int ii = 0; ii < 6; ii++) {
        if (float(ii) >= layers) break;
        float i = float(ii);
        u2 = fract(u2 * (1.5 + uBass * ar * 0.25)) - 0.5;
        float d = length(u2) * exp(-length(uv0));
        vec3 cc = PAL(fract(length(uv0) + i * 0.4 + t * 0.4 + uTreble * ar * 0.15), uPalette);
        d = sin(d * (8.0 + uMid * ar * 5.0) + t) / 8.0;
        d = abs(d);
        d = pow(0.01 / (d + 1e-5), 1.2);
        col += cc * d;
      }
      col *= 1.0 + uBeatPulse * ar * 0.3;
    `),
  },

  // ────────────────────────────────────────────────────────────────────────────
  // 15: MANDALBULB VOL — after EvilRyu (Shadertoy MdXSWn)
  //     Cinematic mandelbulb with soft shadows, ambient, specular + halo.
  //     Bass morphs the power, beat nudges camera, treble shifts palette.
  // ────────────────────────────────────────────────────────────────────────────
  {
    name: 'Mandalbulb Vol',
    vertex: vert,
    fragment: commonGLSL + `
float mb_power;
float mb_pixel;
float mbt;

void mb_ry(inout vec3 p, float a){
  float c=cos(a), s=sin(a); vec3 q=p;
  p.x = c*q.x + s*q.z;
  p.z = -s*q.x + c*q.z;
}
vec3 mb_de(vec3 p){
  p.xyz = p.xzy;
  vec3 z = p;
  float power = mb_power;
  float r, theta, phi;
  float dr = 1.0;
  float t0 = 1.0;
  for(int i=0;i<7;i++){
    r = length(z);
    if(r>2.0) continue;
    theta = atan(z.y/(z.x+1e-9));
    phi = asin(clamp(z.z/(r+1e-6), -1.0, 1.0));
    dr = pow(r, power-1.0)*dr*power + 1.0;
    r = pow(r, power);
    theta *= power; phi *= power;
    z = r*vec3(cos(theta)*cos(phi), sin(theta)*cos(phi), sin(phi)) + p;
    t0 = min(t0, r);
  }
  return vec3(0.5*log(r+1e-6)*r/(dr+1e-6), t0, 0.0);
}
vec3 mb_scene(vec3 p){
  mb_ry(p, mbt*0.2 + uBeat*uAudioOn*uReactivity*0.1);
  return mb_de(p);
}
float mb_softshadow(vec3 ro, vec3 rd, float k){
  float akuma=1.0, h=0.0;
  float t = 0.01;
  for(int i=0;i<24;i++){
    h = mb_scene(ro+rd*t).x;
    if(h<0.001) return 0.02;
    akuma = min(akuma, k*h/t);
    t += clamp(h, 0.01, 2.0);
  }
  return akuma;
}
vec3 mb_nor(vec3 pos){
  vec3 eps = vec3(0.001, 0.0, 0.0);
  return normalize(vec3(
    mb_scene(pos+eps.xyy).x - mb_scene(pos-eps.xyy).x,
    mb_scene(pos+eps.yxy).x - mb_scene(pos-eps.yxy).x,
    mb_scene(pos+eps.yyx).x - mb_scene(pos-eps.yyx).x));
}
vec3 mb_intersect(vec3 ro, vec3 rd){
  float t=1.0, res_t=0.0, max_error=1000.0;
  vec3 c, res_c = vec3(0.0);
  float d=1.0, pd=100.0, os=0.0, stp=0.0, error=1000.0;
  for(int i=0;i<40;i++){
    if(!(error < mb_pixel*0.5 || t>20.0)){
      c = mb_scene(ro+rd*t);
      d = c.x;
      if(d>os){ os=0.4*d*d/pd; stp=d+os; pd=d; }
      else { stp=-os; os=0.0; pd=100.0; d=1.0; }
      error = d/t;
      if(error<max_error){ max_error=error; res_t=t; res_c=c; }
      t += stp;
    }
  }
  if(t>20.0) res_t=-1.0;
  return vec3(res_t, res_c.y, res_c.z);
}
void main(){
  vec2 q = gl_FragCoord.xy/uResolution.xy;
  vec2 uv = -1.0 + 2.0*q;
  uv.x *= uResolution.x/uResolution.y;
  float t = uTime*uSpeed; float ar = uAudioOn*uReactivity; vec3 col;
  mbt = t;
  mb_power = 8.0 + uBass*ar*1.5;
  mb_pixel = 1.0/(uResolution.x*3.0);

  float stime = 0.7 + 0.3*sin(t*0.4);
  float ctime = 0.7 + 0.3*cos(t*0.4);
  vec3 ta = vec3(0.0);
  vec3 ro = vec3(0.0, 3.0*stime*ctime, 3.0*(1.0-stime*ctime));
  ro += vec3(0.3*sin(t*0.7), uBeat*ar*0.2, 0.0);
  vec3 cf = normalize(ta-ro);
  vec3 cs = normalize(cross(cf, vec3(0.0,1.0,0.0)));
  vec3 cu = normalize(cross(cs,cf));
  vec3 rd = normalize(uv.x*cs + uv.y*cu + 3.0*cf);

  vec3 sundir = normalize(vec3(0.1, 0.8, 0.6));
  vec3 sun = vec3(1.64, 1.27, 0.99);
  vec3 skycolor = vec3(0.6, 1.5, 1.0);
  vec3 bg = exp(uv.y-2.0)*vec3(0.4, 1.6, 1.0);
  float halo = clamp(dot(normalize(vec3(-ro.x,-ro.y,-ro.z)), rd), 0.0, 1.0);
  col = bg + vec3(1.0,0.8,0.4)*pow(halo, 17.0);

  vec3 res = mb_intersect(ro, rd);
  if(res.x > 0.0){
    vec3 p = ro + res.x*rd;
    vec3 n = mb_nor(p);
    float shadow = mb_softshadow(p, sundir, 10.0);
    float dif = max(0.0, dot(n, sundir));
    float sky = 0.6 + 0.4*max(0.0, dot(n, vec3(0.0,1.0,0.0)));
    float bac = max(0.3 + 0.7*dot(vec3(-sundir.x,-1.0,-sundir.z), n), 0.0);
    float spe = max(0.0, pow(clamp(dot(sundir, reflect(rd,n)),0.0,1.0), 10.0));
    vec3 lin = 4.5*sun*dif*shadow;
    lin += 0.8*bac*sun;
    lin += 0.6*sky*skycolor*shadow;
    lin += 3.0*spe*shadow;
    float oy = pow(clamp(res.y,0.0,1.0), 0.55);
    vec3 tint = PAL(fract(oy*0.5 + 0.15*t + uTreble*ar*0.2), uPalette);
    col = lin*vec3(0.9,0.8,0.6)*0.25*tint;
    col = mix(col, bg, 1.0-exp(-0.001*res.x*res.x));
  }
  col = pow(clamp(col,0.0,1.0), vec3(0.45));
  col *= 0.6 + 0.4*col*col*(3.0-2.0*col);
  col *= 0.5 + 0.5*pow(16.0*q.x*q.y*(1.0-q.x)*(1.0-q.y), 0.7);
  col = max(col, 0.0);
  col = applyPostFX(col);
  gl_FragColor = vec4(col, 1.0);
}
`,
  },

  // ────────────────────────────────────────────────────────────────────────────
  // 16: SEASCAPE — after Alexander Alekseev / TDM (Shadertoy Ms2SD1)
  //     The canonical raymarched ocean. Bass swells the waves, mids/treble add
  //     chop, level boosts flight speed, beat bobs the camera, palette tints water.
  // ────────────────────────────────────────────────────────────────────────────
  {
    name: 'Seascape',
    vertex: vert,
    fragment: commonGLSL + `
#define SEA_NUM_STEPS 8
#define SEA_EPS_NRM (0.1 / uResolution.x)
float seaTime; float seaHeight; float seaChoppy;

float sea_hash(vec2 p){ float h=dot(p,vec2(127.1,311.7)); return fract(sin(h)*43758.5453123); }
float sea_noise(vec2 p){
  vec2 i=floor(p), f=fract(p);
  vec2 u=f*f*(3.0-2.0*f);
  return -1.0+2.0*mix(mix(sea_hash(i+vec2(0.0,0.0)),sea_hash(i+vec2(1.0,0.0)),u.x),
                      mix(sea_hash(i+vec2(0.0,1.0)),sea_hash(i+vec2(1.0,1.0)),u.x),u.y);
}
float sea_octave(vec2 uv, float choppy){
  uv += sea_noise(uv);
  vec2 wv = 1.0-abs(sin(uv));
  vec2 swv = abs(cos(uv));
  wv = mix(wv,swv,wv);
  return pow(1.0-pow(wv.x*wv.y,0.65), choppy);
}
float seamap(vec3 p){
  float freq=0.16, amp=seaHeight, choppy=seaChoppy;
  vec2 uv=p.xz; uv.x*=0.75;
  float d, h=0.0;
  for(int i=0;i<3;i++){
    d = sea_octave((uv+seaTime*0.8)*freq, choppy);
    d += sea_octave((uv-seaTime*0.8)*freq, choppy);
    h += d*amp;
    uv *= mat2(1.6,1.2,-1.2,1.6); freq*=1.9; amp*=0.22;
    choppy = mix(choppy,1.0,0.2);
  }
  return p.y - h;
}
float seamap_d(vec3 p){
  float freq=0.16, amp=seaHeight, choppy=seaChoppy;
  vec2 uv=p.xz; uv.x*=0.75;
  float d, h=0.0;
  for(int i=0;i<5;i++){
    d = sea_octave((uv+seaTime*0.8)*freq, choppy);
    d += sea_octave((uv-seaTime*0.8)*freq, choppy);
    h += d*amp;
    uv *= mat2(1.6,1.2,-1.2,1.6); freq*=1.9; amp*=0.22;
    choppy = mix(choppy,1.0,0.2);
  }
  return p.y - h;
}
float sea_heightMapTracing(vec3 ori, vec3 dir, out vec3 p){
  float tm=0.0, tx=1000.0;
  float hx = seamap(ori+dir*tx);
  if(hx>0.0){ p = ori+dir*tx; return tx; }
  float hm = seamap(ori+dir*tm);
  float tmid = 0.0;
  for(int i=0;i<SEA_NUM_STEPS;i++){
    tmid = mix(tm,tx, hm/(hm-hx));
    p = ori+dir*tmid;
    float hmid = seamap(p);
    if(hmid<0.0){ tx=tmid; hx=hmid; } else { tm=tmid; hm=hmid; }
  }
  return tmid;
}
vec3 sea_getNormal(vec3 p, float eps){
  vec3 n;
  n.y = seamap_d(p);
  n.x = seamap_d(vec3(p.x+eps,p.y,p.z)) - n.y;
  n.z = seamap_d(vec3(p.x,p.y,p.z+eps)) - n.y;
  n.y = eps;
  return normalize(n);
}
float sea_diffuse(vec3 n, vec3 l, float pp){ return pow(dot(n,l)*0.4+0.6, pp); }
float sea_specular(vec3 n, vec3 l, vec3 e, float s){
  float nrm = dot(n+reflect(-l,n), e);
  return pow(max(nrm,0.0), s)/4.0;
}
vec3 sea_skyColor(vec3 e){
  e.y = max(e.y,0.0);
  return vec3(pow(1.0-e.y,2.0), 1.0-e.y, 0.6+(1.0-e.y)*0.4);
}
vec3 sea_getColor(vec3 p, vec3 n, vec3 l, vec3 eye, vec3 dist){
  float fresnel = clamp(1.0-dot(n,-eye),0.0,1.0);
  fresnel = pow(fresnel,3.0)*0.5;
  vec3 reflected = sea_skyColor(reflect(eye,n));
  vec3 refracted = vec3(0.0,0.09,0.18) + sea_diffuse(n,l,80.0)*vec3(0.8,0.9,0.6)*0.6*0.12;
  vec3 color = mix(refracted, reflected, fresnel);
  float atten = max(1.0-dot(dist,dist)*0.001, 0.0);
  color += vec3(0.8,0.9,0.6)*0.6*(p.y-seaHeight)*0.15*atten;
  color += vec3(sea_specular(n,l,eye,60.0));
  return color;
}
mat3 sea_fromEuler(vec3 ang){
  vec2 a1=vec2(sin(ang.x),cos(ang.x));
  vec2 a2=vec2(sin(ang.y),cos(ang.y));
  vec2 a3=vec2(sin(ang.z),cos(ang.z));
  return mat3(
    a1.y*a3.y+a1.x*a2.x*a3.x, a1.y*a2.x*a3.x+a1.x*a3.y, -a2.y*a3.x,
    -a2.y*a1.x, a2.y*a1.y, a2.x,
    a3.y*a1.x*a2.x+a1.y*a3.x, a3.x*a1.x-a1.y*a2.x*a3.y, a2.y*a3.y);
}
void main(){
  vec2 uv = gl_FragCoord.xy/uResolution.xy;
  uv = uv*2.0-1.0;
  uv.x *= uResolution.x/uResolution.y;
  float t = uTime*uSpeed; float ar = uAudioOn*uReactivity; vec3 col;
  seaTime = t*(0.3 + uLevel*ar*0.5);
  seaHeight = 0.6 + uBass*ar*0.6;
  seaChoppy = 4.0 + uMid*ar*3.0 + uTreble*ar*2.0;
  vec3 ang = vec3(sin(t*0.9)*0.15, sin(t*0.3)*0.1+0.18 + uBeat*ar*0.05, sin(t*0.5)*0.1);
  vec3 ori = vec3(0.0, 3.5 + uBeatPulse*ar*0.5, seaTime*5.0);
  vec3 dir = normalize(vec3(uv.xy,-2.0));
  dir.z += length(uv)*0.15;
  dir = normalize(dir)*sea_fromEuler(ang);
  vec3 p;
  sea_heightMapTracing(ori,dir,p);
  vec3 dist = p-ori;
  vec3 n = sea_getNormal(p, dot(dist,dist)*SEA_EPS_NRM);
  vec3 light = normalize(vec3(0.0,1.0,0.8));
  vec3 seaCol = sea_getColor(p,n,light,dir,dist);
  seaCol *= mix(vec3(1.0), PAL(fract(0.6+0.07*t+uCentroid*0.2),uPalette)*1.4, 0.25*ar+0.05);
  col = mix(sea_skyColor(dir), seaCol, pow(smoothstep(0.0,-0.05,dir.y),0.3));
  col += col*uBeatPulse*ar*0.1;
  col = pow(col, vec3(0.75));
  col = applyPostFX(col);
  gl_FragColor = vec4(col,1.0);
}
`,
  },
];
