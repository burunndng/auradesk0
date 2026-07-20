// services/geminiLiveService.ts
// Gemini Live API for bidirectional voice chat
// Uses WebSocket-based multimodal streaming with audio input/output
// Reference: https://ai.google.dev/gemini-api/docs/live

/**
 * Message types for Gemini Live API WebSocket protocol
 */
interface LiveSetupMessage {
  setup: {
    model: string;
    generationConfig?: {
      responseModalities?: string[];
      speechConfig?: {
        voiceConfig?: {
          prebuiltVoiceConfig?: {
            voiceName: string;
          };
        };
      };
    };
    systemInstruction?: {
      parts: Array<{ text: string }>;
    };
    realtimeInputConfig?: {
      automaticActivityDetection?: {
        disabled: boolean;
      };
    };
  };
}

interface LiveClientContentMessage {
  clientContent: {
    turns: Array<{
      role: 'user';
      parts: Array<{
        text?: string;
        inlineData?: {
          mimeType: string;
          data: string; // base64 audio
        };
      }>;
    }>;
    turnComplete: boolean;
  };
}

interface LiveRealtimeInputMessage {
  realtimeInput: {
    mediaChunks: Array<{
      mimeType: string;
      data: string; // base64 audio chunk
    }>;
  };
}

interface LiveServerContentPart {
  text?: string;
  inlineData?: {
    mimeType: string;
    data: string; // base64 audio
  };
}

interface LiveServerContentMessage {
  serverContent: {
    modelTurn?: {
      parts: LiveServerContentPart[];
    };
    turnComplete?: boolean;
  };
}

interface LiveSetupCompleteMessage {
  setupComplete: Record<string, never>;
}

interface LiveToolCallMessage {
  toolCall: {
    functionCalls: Array<{
      name: string;
      args: Record<string, unknown>;
      id: string;
    }>;
  };
}

interface LiveToolCallCancellationMessage {
  toolCallCancellation: {
    ids: string[];
  };
}

type LiveServerMessage =
  | LiveSetupCompleteMessage
  | LiveServerContentMessage
  | LiveToolCallMessage
  | LiveToolCallCancellationMessage;

/**
 * Configuration for Gemini Live session
 */
export interface GeminiLiveConfig {
  systemInstruction?: string;
  voiceName?: string; // Default: "Puck" (therapeutic, calm)
  onAudioReceived?: (audioData: ArrayBuffer) => void;
  onTextReceived?: (text: string) => void;
  onSetupComplete?: () => void;
  onError?: (error: Error) => void;
  onClose?: () => void;
}

/**
 * Model identifier for Gemini Live API
 */
const GEMINI_LIVE_MODEL = 'gemini-2.5-flash-native-audio-preview-12-2025';

/**
 * Audio configuration constants
 * Gemini Live API requirements:
 * - Input: 16-bit PCM, 16kHz, mono
 * - Output: 24kHz, mono
 */
export const AUDIO_CONFIG = {
  INPUT_SAMPLE_RATE: 16000,
  INPUT_CHANNELS: 1,
  INPUT_BIT_DEPTH: 16,
  OUTPUT_SAMPLE_RATE: 24000,
  OUTPUT_CHANNELS: 1,
  MIME_TYPE: 'audio/pcm',
} as const;

/**
 * Gemini Live API WebSocket client for bidirectional voice chat
 */
export class GeminiLiveClient {
  private ws: WebSocket | null = null;
  private config: GeminiLiveConfig;
  private isSetupComplete = false;
  private reconnectAttempts = 0;
  private readonly maxReconnectAttempts = 3;
  private audioQueue: ArrayBuffer[] = [];
  private isProcessingAudio = false;

  constructor(config: GeminiLiveConfig) {
    this.config = config;
  }

  /**
   * Connect to Gemini Live API WebSocket endpoint
   */
  async connect(): Promise<void> {
    // Fetch the Gemini Live API key from the server-side proxy so it is never
    // baked into the client bundle. The proxy reads GEMINI_LIVE_API_KEY from
    // the Vercel environment (no VITE_ prefix).
    // SECURITY NOTE: The key is still transmitted to the browser at runtime so
    // the client can open the WS directly — this is a known limitation of the
    // Gemini Live BidiGenerateContent WebSocket API which Vercel serverless
    // functions cannot fully proxy. A zero-trust fix (Phase 2.5) requires a
    // persistent WS-capable server (Fly.io / Deno Deploy).
    let apiKey: string;
    try {
      const proxyRes = await fetch('/api/gemini-live-proxy', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'get_key' }),
      });
      if (!proxyRes.ok) {
        throw new Error(`Proxy returned ${proxyRes.status}`);
      }
      const data = await proxyRes.json() as { apiKey?: string };
      if (!data.apiKey) {
        throw new Error('No apiKey in proxy response');
      }
      apiKey = data.apiKey;
    } catch (err) {
      throw new Error(`Gemini Live API key fetch failed: ${String(err)}`);
    }

    const wsUrl = `wss://generativelanguage.googleapis.com/ws/google.ai.generativelanguage.v1alpha.GenerativeService.BidiGenerateContent?key=${apiKey}`;

    return new Promise((resolve, reject) => {
      try {
        this.ws = new WebSocket(wsUrl);

        this.ws.onopen = () => {
          console.log('[GeminiLive] WebSocket connection opened');
          this.sendSetup();
          this.reconnectAttempts = 0;
        };

        this.ws.onmessage = (event) => {
          this.handleMessage(event.data);
          if (this.isSetupComplete) {
            resolve();
          }
        };

        this.ws.onerror = (event) => {
          console.error('[GeminiLive] WebSocket error:', event);
          const error = new Error('WebSocket connection error');
          this.config.onError?.(error);
          reject(error);
        };

        this.ws.onclose = (event) => {
          console.log('[GeminiLive] WebSocket closed:', event.code, event.reason);
          this.isSetupComplete = false;

          // Attempt reconnection if not intentional close
          if (event.code !== 1000 && this.reconnectAttempts < this.maxReconnectAttempts) {
            this.reconnectAttempts++;
            console.log(`[GeminiLive] Reconnecting... (attempt ${this.reconnectAttempts}/${this.maxReconnectAttempts})`);
            setTimeout(() => this.connect(), 1000 * this.reconnectAttempts);
          } else {
            this.config.onClose?.();
          }
        };
      } catch (error) {
        reject(error instanceof Error ? error : new Error('Failed to create WebSocket'));
      }
    });
  }

  /**
   * Send setup message to configure the session
   */
  private sendSetup(): void {
    const setupMessage: LiveSetupMessage = {
      setup: {
        model: `models/${GEMINI_LIVE_MODEL}`,
        generationConfig: {
          responseModalities: ['AUDIO'],
          speechConfig: {
            voiceConfig: {
              prebuiltVoiceConfig: {
                voiceName: this.config.voiceName || 'Puck',
              },
            },
          },
        },
        // Enable server-side VAD so Gemini starts responding as soon as
        // end-of-speech is detected, without waiting for turnComplete.
        realtimeInputConfig: {
          automaticActivityDetection: {
            disabled: false,
          },
        },
      },
    };

    // Add system instruction if provided
    if (this.config.systemInstruction) {
      setupMessage.setup.systemInstruction = {
        parts: [{ text: this.config.systemInstruction }],
      };
    }

    this.send(setupMessage);
  }

  /**
   * Handle incoming WebSocket messages
   */
  private handleMessage(data: string): void {
    try {
      const message: LiveServerMessage = JSON.parse(data);

      // Setup complete
      if ('setupComplete' in message) {
        console.log('[GeminiLive] Setup complete');
        this.isSetupComplete = true;
        this.config.onSetupComplete?.();
        return;
      }

      // Server content (audio or text response)
      if ('serverContent' in message) {
        const parts = message.serverContent.modelTurn?.parts || [];

        for (const part of parts) {
          // Audio response
          if (part.inlineData?.mimeType.startsWith('audio/')) {
            const audioData = this.base64ToArrayBuffer(part.inlineData.data);
            this.audioQueue.push(audioData);
            this.processAudioQueue();
          }

          // Text response
          if (part.text) {
            this.config.onTextReceived?.(part.text);
          }
        }
        return;
      }

      // Tool call (not used in voice practice sessions)
      if ('toolCall' in message) {
        console.log('[GeminiLive] Tool call received (not supported):', message.toolCall);
        return;
      }

      // Tool call cancellation
      if ('toolCallCancellation' in message) {
        console.log('[GeminiLive] Tool call cancelled:', message.toolCallCancellation);
        return;
      }
    } catch (error) {
      console.error('[GeminiLive] Error parsing message:', error);
      this.config.onError?.(error instanceof Error ? error : new Error('Failed to parse server message'));
    }
  }

  /**
   * Process audio queue sequentially to avoid overlapping playback
   */
  private async processAudioQueue(): Promise<void> {
    if (this.isProcessingAudio || this.audioQueue.length === 0) {
      return;
    }

    this.isProcessingAudio = true;

    while (this.audioQueue.length > 0) {
      const audioData = this.audioQueue.shift();
      if (audioData) {
        this.config.onAudioReceived?.(audioData);
      }
    }

    this.isProcessingAudio = false;
  }

  /**
   * Send audio chunk to Gemini (realtime streaming)
   * @param audioData PCM audio data (16-bit, 16kHz, mono)
   */
  sendAudio(audioData: ArrayBuffer): void {
    if (!this.isSetupComplete) {
      console.warn('[GeminiLive] Cannot send audio before setup complete');
      return;
    }

    const base64Audio = this.arrayBufferToBase64(audioData);
    const message: LiveRealtimeInputMessage = {
      realtimeInput: {
        mediaChunks: [
          {
            mimeType: AUDIO_CONFIG.MIME_TYPE,
            data: base64Audio,
          },
        ],
      },
    };

    this.send(message);
  }

  /**
   * Send text message to Gemini
   */
  sendText(text: string): void {
    if (!this.isSetupComplete) {
      console.warn('[GeminiLive] Cannot send text before setup complete');
      return;
    }

    const message: LiveClientContentMessage = {
      clientContent: {
        turns: [
          {
            role: 'user',
            parts: [{ text }],
          },
        ],
        turnComplete: true,
      },
    };

    this.send(message);
  }

  /**
   * Send message via WebSocket
   */
  private send(message: LiveSetupMessage | LiveClientContentMessage | LiveRealtimeInputMessage): void {
    if (!this.ws || this.ws.readyState !== WebSocket.OPEN) {
      console.error('[GeminiLive] WebSocket not open, cannot send message');
      return;
    }

    try {
      this.ws.send(JSON.stringify(message));
    } catch (error) {
      console.error('[GeminiLive] Error sending message:', error);
      this.config.onError?.(error instanceof Error ? error : new Error('Failed to send message'));
    }
  }

  /**
   * Disconnect from WebSocket
   */
  disconnect(): void {
    if (this.ws) {
      this.ws.close(1000, 'Client initiated disconnect');
      this.ws = null;
    }
    this.isSetupComplete = false;
    this.audioQueue = [];
    this.isProcessingAudio = false;
  }

  /**
   * Check if client is connected and ready
   */
  isReady(): boolean {
    return this.ws !== null && this.ws.readyState === WebSocket.OPEN && this.isSetupComplete;
  }

  /**
   * Convert ArrayBuffer to base64 string
   */
  private arrayBufferToBase64(buffer: ArrayBuffer): string {
    const bytes = new Uint8Array(buffer);
    let binary = '';
    for (let i = 0; i < bytes.byteLength; i++) {
      binary += String.fromCharCode(bytes[i]);
    }
    return btoa(binary);
  }

  /**
   * Convert base64 string to ArrayBuffer
   */
  private base64ToArrayBuffer(base64: string): ArrayBuffer {
    const binaryString = atob(base64);
    const bytes = new Uint8Array(binaryString.length);
    for (let i = 0; i < binaryString.length; i++) {
      bytes[i] = binaryString.charCodeAt(i);
    }
    return bytes.buffer;
  }
}
