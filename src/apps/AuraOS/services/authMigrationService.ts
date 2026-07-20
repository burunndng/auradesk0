import { supabase } from './supabaseClient';

const MIGRATION_FLAG_PREFIX = 'aura-migration-complete-';

export async function migrateGuestDataToAccount(userId: string): Promise<void> {
  const migrationKey = `${MIGRATION_FLAG_PREFIX}${userId}`;
  if (localStorage.getItem(migrationKey)) return; // already migrated

  try {
    // Migrate insights
    const insightsRaw = localStorage.getItem('integratedInsights') || localStorage.getItem('aura-insights');
    if (insightsRaw) {
      try {
        const insights = JSON.parse(insightsRaw);
        if (Array.isArray(insights) && insights.length > 0) {
          // Only migrate items that don't have a valid UUID user_id (i.e., guest data)
          const guestInsights = insights.filter((i: Record<string, unknown>) => {
            const uid = i.user_id as string | undefined;
            return !uid || !/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(uid);
          });
          if (guestInsights.length > 0) {
            await supabase.from('integrated_insights')
              .insert(guestInsights.map((i: Record<string, unknown>) => ({ ...i, user_id: userId })) as any);
          }
        }
      } catch { /* corrupted — skip */ }
    }

    // Mark complete (do NOT migrate coach conversations — privacy requirement)
    localStorage.setItem(migrationKey, 'true');
  } catch (err) {
    console.error('[authMigration] Migration failed:', err);
    // Non-fatal — don't throw, just log
  }
}
