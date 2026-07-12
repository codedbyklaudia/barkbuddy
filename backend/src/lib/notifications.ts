import { initializeApp, getApps, cert } from "firebase-admin/app";
import { getMessaging } from "firebase-admin/messaging";
import { ServiceAccount } from "firebase-admin/app";
import pool from "../db";

// Initialise once — fix escaped newlines in private key
if (!getApps().length) {
    try {
        let raw = process.env.FIREBASE_SERVICE_ACCOUNT!;

        // Remove real line breaks that Render may have introduced
        // then fix the private key's escaped newlines
        raw = raw
            .replace(/\r\n/g, '\\n')  // Windows line endings
            .replace(/\r/g, '\\n')     // old Mac line endings
            .replace(/\n/g, '\\n');    // Unix line endings — but only OUTSIDE the JSON string

        // Better approach — parse then fix the private key separately
        // First try direct parse
        let parsed: any;
        try {
            parsed = JSON.parse(raw);
        } catch {
            // If that fails, try extracting and fixing the private key manually
            const fixedRaw = raw.replace(
                /"private_key"\s*:\s*"([\s\S]*?)(?<!\\)"/,
                (_match: string, key: string) => {
                    const fixedKey = key
                        .replace(/\r\n/g, '\\n')
                        .replace(/\r/g, '\\n')
                        .replace(/\n/g, '\\n');
                    return `"private_key":"${fixedKey}"`;
                }
            );
            parsed = JSON.parse(fixedRaw);
        }

        console.log("✅ JSON parsed — project_id:", parsed.project_id);
        initializeApp({ credential: cert(parsed as ServiceAccount) });
        console.log("✅ Firebase Admin initialised successfully");
    } catch (err: any) {
        console.error("❌ Firebase Admin init FAILED:", err?.message);
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