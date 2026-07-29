# AuraDesk Music Visualization

AuraDesk is a music visualization desktop environment featuring multiple modes and integrations.

## Music-Viz Integration

The music-viz system has been updated with:

- **BLISS App**: Now correctly links to [ENTHEA](https://elder-plinius.github.io/ENTHEA/) for music visualization
- **Crisp Menus**: High-fidelity, mobile-friendly menus with reduced blur
- **Audio Engine**: Native Web Audio API with real-time spectrum analysis
- **Visualization Modes**: SPECTRO (spectral), FLUID, NEBULA, and adaptive rendering

## Recent Changes

### BLISS App
- Updated to point to ENTHEA for music visualization
- Added responsive bar component with playback controls
- Crisp menu system replacing blurry overlays
- Mobile-optimized interface

### Music-Viz Renderer
- New WebGL/Canvas-based visualizer
- Multiple rendering modes: SPECTRO, FLUID, NEBULA, PARTICLES
- Audio-reactive effects with real-time FFT analysis
- Adaptive resolution and quality settings

### Audio Store
- Centralized Web Audio API management
- Frequency band separation (bass/mid/treble)
- Real-time audio analysis hooks
- Volume and playback controls

## Features

- **Browser-based DAW** with psychedelic visuals
- **ENTHEA integration** for advanced music visualization
- **Multiple visualization modes** powered by GPU/OpenGL
- **Mobile-friendly responsive design**
- **Crisp, high-fidelity UI** with minimal blur
- **Real-time audio processing** with 4096FFT analysis

## Usage

1. Launch BLISS from the desktop
2. Use the control bar for playback
3. Switch between visualization modes
4. Adjust volume and settings
5. Experience the ENTHEA-inspired visualizer

## Supported Platforms

- Desktop (Electron, web)
- Mobile (responsive design)
- Linux, Windows, macOS

## Technologies

- React with TypeScript
- Web Audio API
- WebGL/HTML Canvas
- GPU-accelerated rendering
- ENTHEA (external music-viz)
- Tailwind CSS
- GSAP animations

## License

Modified AuraDesk project with ENTHEA integration.
For licensing information, see individual component licenses.