/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        display: ['Cormorant', 'Georgia', 'serif'],
        body: ['Spectral', 'Georgia', 'serif'],
        mono: ['"IBM Plex Mono"', 'ui-monospace', 'monospace'],
      },
      colors: {
        bg: '#0f0c09',
        surface: '#171310',
        raised: '#1f1a14',
        ink: {
          DEFAULT: '#ece3d2',
          soft: '#b9ad97',
          faint: '#7d7363',
        },
        gilt: {
          DEFAULT: '#c89b3c',
          bright: '#e2bd6a',
          dim: '#7d6230',
        },
        oxblood: '#7a2a2a',
        edge: 'rgba(200,155,60,0.16)',
        'edge-strong': 'rgba(200,155,60,0.34)',
      },
      maxWidth: {
        reading: '62ch',
      },
    },
  },
  plugins: [],
}
