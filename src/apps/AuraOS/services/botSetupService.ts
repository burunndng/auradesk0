/**
 * Bot Setup Service
 *
 * Handles initialization of the AI Coach bot user with proper metadata.
 * Calls the backend API endpoint: /api/initialize-bot
 *
 * The backend API securely calls the Supabase Edge Function with the
 * server-side secret key, keeping the key out of client-side code.
 *
 * This service runs once during app initialization to ensure the bot user
 * has the correct metadata for identification as an AI system user.
 */

/**
 * Initialize bot metadata via backend API
 * Sets is_bot and bot_type in user_metadata
 *
 * @param botUserId - UUID of the bot user
 * @returns true if metadata update successful or already set
 */
export const initializeBotMetadata = async (botUserId: string): Promise<boolean> => {
  try {
    if (!botUserId) {
      console.warn('[botSetupService] Missing botUserId');
      return false;
    }

    // Call backend API endpoint (secret key is server-side only)
    const response = await fetch('/api/initialize-bot', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        botUserId,
      }),
    });

    if (!response.ok) {
      const text = await response.text();
      console.warn(
        `[botSetupService] Failed to update bot metadata: ${response.status}`,
        text
      );
      return false;
    }

    console.log('[botSetupService] Bot metadata initialized successfully');
    return true;
  } catch (err) {
    console.error('[botSetupService] Error initializing bot metadata:', err);
    return false;
  }
};
