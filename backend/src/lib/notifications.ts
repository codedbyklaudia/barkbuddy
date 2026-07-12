import { initializeApp, getApps, cert } from "firebase-admin/app";
import { getMessaging } from "firebase-admin/messaging";
import { ServiceAccount } from "firebase-admin/app";
import pool from "../db";

// Initialise once
if (!getApps().length) {
    initializeApp({
        credential: cert(
            JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT!) as ServiceAccount
        ),
    });
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
        if (!token) return;

        await getMessaging().send({
            token,
            notification: { title, body },
            data: { channel, type, ...data },
            android: {
                priority: "high",
                notification: { channelId: channel },
            },
        });
    } catch (err) {
        console.error("sendToUser error:", err);
    }
}