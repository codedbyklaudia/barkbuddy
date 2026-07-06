import { Router, Request, Response } from 'express';
import { Pool } from 'pg';
import { Resend } from 'resend';
import crypto from 'crypto';
import { authenticate, AuthRequest } from '../middleware/auth'; // your existing JWT middleware

const router = Router();
const resend = new Resend(process.env.RESEND_API_KEY);

export default function accountRoutes(pool: Pool) {

  // POST /api/account/schedule-deletion
  router.post('/schedule-deletion', authenticate, async (req: Request, res: Response) => {
    const userId = (req as AuthRequest).user?.userId;

    try {
      const restoreToken = crypto.randomBytes(32).toString('hex');
      const deletionAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000); // +30 days
      const tokenExpiry = new Date(deletionAt.getTime() + 24 * 60 * 60 * 1000); // token valid 31 days

      const { rows } = await pool.query(
        `UPDATE users 
         SET deletion_scheduled_at = $1,
             restore_token = $2,
             restore_token_expires_at = $3
         WHERE id = $4
         RETURNING email, name`,
        [deletionAt, restoreToken, tokenExpiry, userId]
      );

      if (rows.length === 0) return res.status(404).json({ error: 'User not found' });

      const { email, name } = rows[0];
      const restoreUrl = `${process.env.API_URL}/api/account/restore?token=${restoreToken}`;
      const deletionDate = deletionAt.toLocaleDateString('en-GB', {
        day: 'numeric', month: 'long', year: 'numeric'
      });

      await resend.emails.send({
        from: 'BarkBuddy <paws@barkbuddy.org.uk>',
        to: email,
        subject: 'Your BarkBuddy account is scheduled for deletion',
        html: `
          <div style="font-family: sans-serif; max-width: 560px; margin: 0 auto;">
            <h2 style="color: #5B3F8C;">We're sad to see you go, ${name} 🐾</h2>
            <p>Your BarkBuddy account has been scheduled for deletion on <strong>${deletionDate}</strong>.</p>
            <p>If you change your mind, you have 30 days to restore it. Just click the button below:</p>
            <a href="${restoreUrl}"
               style="display:inline-block;background:#5B3F8C;color:#fff;padding:12px 24px;
                      border-radius:8px;text-decoration:none;font-weight:bold;margin:16px 0;">
              Restore my account
            </a>
            <p style="color:#888;font-size:13px;">
              If you didn't request this, please 
              <a href="${restoreUrl}">click here immediately</a> to restore your account and 
              then change your password.
            </p>
            <p style="color:#888;font-size:13px;">
              After ${deletionDate}, your account and all data will be permanently deleted 
              and cannot be recovered.
            </p>
            <hr style="border:none;border-top:1px solid #eee;margin:24px 0;"/>
            <p style="color:#aaa;font-size:12px;">BarkBuddy · barkbuddy.org.uk</p>
          </div>
        `
      });

      return res.status(200).json({ 
        message: 'Deletion scheduled',
        deletionDate 
      });

    } catch (err) {
      console.error('schedule-deletion error:', err);
      return res.status(500).json({ error: 'Failed to schedule deletion' });
    }
  });

  // GET /api/account/restore?token=xxx  (web link from email)
  router.get('/restore', async (req: Request, res: Response) => {
    const { token } = req.query;
    if (!token || typeof token !== 'string') {
      return res.redirect(`${process.env.APP_BASE_URL}/login?error=link-invalid`);
    }

    try {
      const { rows } = await pool.query(
        `UPDATE users
         SET deletion_scheduled_at = NULL,
             restore_token = NULL,
             restore_token_expires_at = NULL
         WHERE restore_token = $1
           AND restore_token_expires_at > NOW()
         RETURNING email, name`,
        [token]
      );

      if (rows.length === 0) {
        return res.redirect(`${process.env.APP_BASE_URL}/login?error=link-expired`);
      }

      const { email, name } = rows[0];

      // Confirmation email
      await resend.emails.send({
        from: 'BarkBuddy <paws@barkbuddy.org.uk>',
        to: email,
        subject: 'Your BarkBuddy account has been restored 🐾',
        html: `
          <div style="font-family: sans-serif; max-width: 560px; margin: 0 auto;">
            <h2 style="color: #5B3F8C;">Welcome back, ${name}! 🐾</h2>
            <p>Your BarkBuddy account has been successfully restored. Everything is just as you left it.</p>
            <a href="${process.env.APP_BASE_URL}/login"
               style="display:inline-block;background:#5B3F8C;color:#fff;padding:12px 24px;
                      border-radius:8px;text-decoration:none;font-weight:bold;margin:16px 0;">
              Log in to BarkBuddy
            </a>
            <hr style="border:none;border-top:1px solid #eee;margin:24px 0;"/>
            <p style="color:#aaa;font-size:12px;">BarkBuddy · barkbuddy.org.uk</p>
          </div>
        `
      });
return res.redirect(`${process.env.APP_BASE_URL}/login?restored=true`);

    } catch (err) {
      console.error('restore error:', err);
      return res.redirect(`${process.env.APP_BASE_URL}/login?error=server`);
    }
  });

  return router;
}