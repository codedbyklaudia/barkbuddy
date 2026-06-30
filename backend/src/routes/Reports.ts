import { Router, Response } from "express";
import pool from "../db";
import { authenticate, AuthRequest } from "../middleware/auth";

const router = Router();

// POST /api/reports
router.post("/", authenticate, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { target_type, target_id, reason, details } = req.body;

    if (!target_type || !target_id || !reason) {
      res.status(400).json({ message: "Missing required fields" });
      return;
    }

    if (target_type !== "post" && target_type !== "comment") {
      res.status(400).json({ message: "Invalid target type" });
      return;
    }

    await pool.query(
      `INSERT INTO forum_reports (target_type, target_id, reporter_id, reason, details, created_at)
       VALUES ($1, $2, $3, $4, $5, NOW())`,
      [target_type, target_id, req.user!.userId, reason, details || null]
    );

    res.status(201).json({ message: "Report submitted" });
  } catch (err) {
    console.error("POST /reports error:", err);
    res.status(500).json({ message: "Failed to submit report" });
  }
});

export default router;