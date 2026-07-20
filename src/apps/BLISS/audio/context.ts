let ctx: AudioContext | null = null;

export function getContext(): AudioContext {
  if (!ctx) {
    throw new Error('AudioContext not initialized. Call initAudio() on user gesture first.');
  }
  return ctx;
}

export async function initAudio(): Promise<AudioContext> {
  if (ctx) {
    if (ctx.state === 'suspended') {
      await ctx.resume();
    }
    return ctx;
  }

  // Create AudioContext with low-latency interactive hint
  const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
  ctx = new AudioContextClass({
    latencyHint: 'interactive',
    sampleRate: 44100
  });

  if (ctx.state === 'suspended') {
    await ctx.resume();
  }

  return ctx;
}

export function suspendAudio() {
  if (ctx && ctx.state === 'running') {
    ctx.suspend();
  }
}
