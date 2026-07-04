import cron from 'node-cron';
import { Pool } from 'pg';

export function startDeletionCron(pool: Pool) {
  cron.schedule('0 2 * * *', async () => {
    console.log('[cron] Checking for expired account deletions...');
    try {
      const { rows } = await pool.query(
        `DELETE FROM users
         WHERE deletion_scheduled_at IS NOT NULL
           AND deletion_scheduled_at <= NOW()
         RETURNING id, email`
      );
      if (rows.length > 0) {
        console.log(`[cron] Deleted ${rows.length} accounts:`, rows.map(r => r.email));
      }
    } catch (err) {
      console.error('[cron] Deletion job failed:', err);
    }
  });
}