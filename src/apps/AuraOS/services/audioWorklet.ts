/**
 * AudioWorklet Processor for real-time voice chat audio processing
 * Runs in a separate thread for better performance than deprecated ScriptProcessorNode
 * Reference: https://developer.mozilla.org/en-US/docs/Web/API/AudioWorkletProcessor
 */

// AudioWorklet runs in its own global scope — standard TS types don't include these globals.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
declare const AudioWorkletProcessor: any;
// eslint-disable-next-line @typescript-eslint/no-explicit-any
declare function registerProcessor(name: string, processorCtor: any): void;

class VoiceChatProcessor extends AudioWorkletProcessor {
  private isRecording = false;

  // Handle messages from main thread to control recording state
  constructor() {
    super();

    // Listen for control messages from main thread
    this.port.onmessage = (event) => {
      if (event.data.type === 'SET_RECORDING') {
        this.isRecording = event.data.isRecording;
      }
    };
  }

  process(inputs: Float32Array[][], outputs: Float32Array[][], parameters: Record<string, Float32Array[]>): boolean {
    // Get input from microphone
    const input = inputs[0];

    if (!input || input.length === 0 || !this.isRecording) {
      return true; // Keep the processor alive
    }

    const channelData = input[0];

    // Convert Float32Array to Int16Array (PCM 16-bit)
    // This is required by Gemini Live API
    const int16Data = new Int16Array(channelData.length);
    for (let i = 0; i < channelData.length; i++) {
      // Clamp value to [-1, 1] range
      const sample = Math.max(-1, Math.min(1, channelData[i]));
      // Convert to 16-bit PCM
      int16Data[i] = sample < 0 ? sample * 0x8000 : sample * 0x7FFF;
    }

    // Send audio data to main thread
    this.port.postMessage({
      type: 'AUDIO_DATA',
      data: int16Data.buffer,
      frequencyData: null,
    }, [int16Data.buffer]); // Transfer ownership of buffer

    return true; // Keep processor alive
  }
}

// Register the processor
registerProcessor('voice-chat-processor', VoiceChatProcessor);
