export const vertexShader = `
  varying vec2 vUv;
  varying vec3 vPosition;
  
  void main() {
    vUv = uv;
    vPosition = position;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

export const fragmentShader = `
  uniform float uTime;
  uniform vec3 uModuleColor;
  uniform vec3 uVoidBase;
  uniform vec3 uPrevColor;
  uniform float uTransitionProgress;
  uniform float uIntensity;
  uniform vec2 uResolution;

  varying vec2 vUv;
  varying vec3 vPosition;

  // Hash base 3D
  float hash(vec3 p) {
    p = fract(p * 0.3183099 + vec3(0.1, 0.1, 0.1));
    p *= 17.0;
    return fract(p.x * p.y * p.z * (p.x + p.y + p.z));
  }

  // 3D Simplex noise approximation
  float noise(vec3 x) {
    vec3 p = floor(x);
    vec3 f = fract(x);
    f = f * f * (3.0 - 2.0 * f);

    return mix(
      mix(mix(hash(p + vec3(0,0,0)), hash(p + vec3(1,0,0)), f.x),
          mix(hash(p + vec3(0,1,0)), hash(p + vec3(1,1,0)), f.x), f.y),
      mix(mix(hash(p + vec3(0,0,1)), hash(p + vec3(1,0,1)), f.x),
          mix(hash(p + vec3(0,1,1)), hash(p + vec3(1,1,1)), f.x), f.y), f.z);
  }

  // 5-Octave FBM
  float fbm(vec3 x) {
    float v = 0.0;
    float a = 0.5;
    vec3 shift = vec3(100.0);
    for (int i = 0; i < 5; ++i) {
      v += a * noise(x);
      x = x * 2.0 + shift;
      a *= 0.5;
    }
    return v;
  }

  // Breathing function
  float voidBreath(float time) {
    return 0.85 + 0.15 * sin(time * 0.25) * sin(time * 0.17 + 1.0);
  }

  // Sacred Geometry - Seed of Life mask
  float circleMask(vec2 uv, vec2 center, float radius, float thickness) {
    float d = length(uv - center);
    return smoothstep(thickness, 0.0, abs(d - radius));
  }

  float seedOfLife(vec2 uv, float thickness) {
    float m = 0.0;
    float r = 0.15;
    m += circleMask(uv, vec2(0.0), r, thickness);
    for(int i = 0; i < 6; i++) {
      float angle = float(i) * 3.14159265359 / 3.0;
      vec2 offset = vec2(cos(angle), sin(angle)) * r;
      m += circleMask(uv, offset, r, thickness);
    }
    return m;
  }

  // Metatron hint lines
  float lineMask(vec2 uv, float angle, float thickness) {
    vec2 dir = vec2(cos(angle), sin(angle));
    float d = abs(dot(uv, vec2(-dir.y, dir.x)));
    return smoothstep(thickness, 0.0, d);
  }

  float metatronHints(vec2 uv, float thickness) {
    float m = 0.0;
    for(int i = 0; i < 6; i++) {
        float angle = float(i) * 3.14159265359 / 6.0;
        m += lineMask(uv, angle, thickness);
    }
    float distSq = dot(uv, uv);
    return m * smoothstep(0.15, 0.0, distSq);
  }

  // 2D Rotation
  mat2 rot(float a) {
    float s = sin(a);
    float c = cos(a);
    return mat2(c, -s, s, c);
  }

  void main() {
    vec2 p = vUv * 2.0 - 1.0;
    // Aspect ratio correction for geometry and radial aura
    p.x *= uResolution.x / max(uResolution.y, 1.0);
    
    vec3 currentColor = mix(uPrevColor, uModuleColor, uTransitionProgress);
    float breath = voidBreath(uTime);

    // Layer 1 - Void Base + Ripple
    float baseNoise = fbm(vec3(vUv * 4.0, uTime * 0.1));
    vec3 col = uVoidBase + vec3(baseNoise * 0.03);

    // Layer 2 - Module Aura
    float dist = length(p);
    float auraNoise = fbm(vec3(p * 2.0, uTime * 0.05));
    float auraFalloff = exp(-dist * 2.5);
    float aura = auraFalloff * (0.8 + 0.2 * auraNoise) * breath;
    col += currentColor * aura * uIntensity;

    // Layer 3 - Sacred Geometry
    vec2 geomUv1 = p * rot(uTime * 0.03); // seed of life ~210s
    float sol = seedOfLife(geomUv1, 0.003);
    
    vec2 geomUv2 = p * rot(uTime * -0.05); // metatron ~125s
    float meta = metatronHints(geomUv2, 0.001);

    col += sol * currentColor * 0.08 * breath * uIntensity;
    col += meta * currentColor * 0.15 * breath * uIntensity;

    // Layer 4 - Luminance drift
    float driftNoise = fbm(vec3(vUv * 10.0, uTime * 0.2));
    float drift = driftNoise * driftNoise; // squared noise for soft falloff
    col += vec3(drift * 0.008);

    // Layer 5 - Edge Vignette (30% darkening at edges)
    float vignette = mix(0.7, 1.0, smoothstep(0.9, 0.3, dist));
    col *= vignette;

    // Layer 6 - Vertical gradient
    col *= mix(0.6, 1.0, vUv.y);

    gl_FragColor = vec4(clamp(col, 0.0, 1.0), 1.0);
  }
`;
