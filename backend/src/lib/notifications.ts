import { initializeApp, getApps, cert } from "firebase-admin/app";
import { getMessaging } from "firebase-admin/messaging";
import { ServiceAccount } from "firebase-admin/app";
import pool from "../db";

// Initialise once — fix escaped newlines in private key
if (!getApps().length) {
    try {
        const serviceAccountJson = process.env.FIREBASE_SERVICE_ACCOUNT!
            .replace(/\\n/g, '\n');

        initializeApp({
            credential: cert(
                JSON.parse(serviceAccountJson) as ServiceAccount
            ),
        });
        console.log("✅ Firebase Admin initialised");
    } catch (err) {
        console.error("❌ Firebase Admin init FAILED:", err);
    }
}

export async function sendToUser(
    userId: string,
    title: string,
    body: string,
    channel: string,
    type: string,
    data: Record<string, string> = {}
): Promise<void> {
    try {
        const result = await pool.query(
            "SELECT fcm_token FROM users WHERE id = $1",
            [userId]
        );
        const token = result.rows[0]?.fcm_token;

        console.log(`📬 sendToUser → userId=${userId} hasToken=${!!token}`);

        if (!token) {
            console.log("⚠️ No FCM token for user — skipping");
            return;
        }

        const response = await getMessaging().send({
            token,
            notification: { title, body },
            data: { channel, type, ...data },
            android: {
                priority: "high",
                notification: { channelId: channel },
            },
        });

        console.log("✅ FCM sent successfully:", response);

    } catch (err: any) {
        console.error("❌ FCM send error:", err?.message || err);

        // Clear stale/expired token so we don't keep trying
        if (
            err?.code === "messaging/registration-token-not-registered" ||
            err?.code === "messaging/invalid-registration-token"
        ) {
            console.log("🗑 Clearing stale FCM token for user:", userId);
            await pool.query(
                "UPDATE users SET fcm_token = NULL WHERE id = $1",
                [userId]
            );
        }
    }
}