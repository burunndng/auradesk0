// services/geminiAudioService.ts
// Gemini 2.5 Flash audio synthesis service for text-to-speech
// Calls are routed through /api/gemini-audio-proxy to keep GEMINI_API_KEY server-side.

interface GeminiVoiceConfig {
  voiceName?: string; // One of 30 prebuilt voices (default: "Kore")
}

/**
 * Generate audio using Gemini 2.5 Flash with audio response modality.
 * Routes through /api/gemini-audio-proxy to keep API key server-side.
 *
 * @param text The text to synthesize
 * @param voiceConfig Optional voice configuration (voiceName)
 * @returns ArrayBuffer containing the PCM audio data (24kHz, mono)
 */
export async function generateAudioWithGemini(
  text: string,
  voiceConfig?: GeminiVoiceConfig
): Promise<ArrayBuffer> {
  // Available voices: Zephyr, Puck, Charon, Kore, Fenrir, Leda, Orus, Aoede, Callirrhoe,
  // Autonoe, Enceladus, Iapetus, Umbriel, Algieba, Despina, Erinome, Algenib, Rasalgethi,
  // Laomedeia, Achernar, Alnilam, Schedar, Gacrux, Pulcherrima, Achird, Zubenelgenubi,
  // Vindemiatrix, Sadachbia, Sadaltager, Sulafat
  const voiceName = voiceConfig?.voiceName || 'Kore';

  try {
    const response = await fetch('/api/gemini-audio-proxy', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text, voiceName, model: 'gemini-2.5-flash' }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(
        `Gemini audio proxy error: ${response.status}. ${(errorData as any)?.details || response.statusText
        }`
      );
    }

    const data = await response.json() as { audioData: string; mimeType: string };

    if (!data.audioData) {
      throw new Error('No audio data returned from Gemini audio proxy.');
    }

    // Decode base64 to ArrayBuffer (PCM audio at 24kHz, mono)
    const binaryString = atob(data.audioData);
    const bytes = new Uint8Array(binaryString.length);
    for (let i = 0; i < binaryString.length; i++) {
      bytes[i] = binaryString.charCodeAt(i);
    }

    return bytes.buffer;
  } catch (error) {
    console.error('[GeminiAudio] Error generating audio:', error);
    if (error instanceof Error) throw error;
    throw new Error('Failed to synthesize audio with Gemini. Please try again.');
  }
}

/**
 * Helper function to convert ArrayBuffer to base64 string
 * @param buffer The ArrayBuffer to convert
 * @returns Base64 encoded string
 */
export function arrayBufferToBase64(buffer: ArrayBuffer): string {
  const bytes = new Uint8Array(buffer);
  let binary = '';
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}

/**
 * Helper function to convert base64 string to ArrayBuffer
 * @param base64 The base64 string to convert
 * @returns ArrayBuffer
 */
export function base64ToArrayBuffer(base64: string): ArrayBuffer {
  const binaryString = atob(base64);
  const bytes = new Uint8Array(binaryString.length);
  for (let i = 0; i < binaryString.length; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes.buffer;
}
