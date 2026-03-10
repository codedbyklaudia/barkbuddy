// ═══════════════════════════════════════════════════════════════════════════════
// FILE: src/api/routes/dogs.ts (or add to your existing dogs router)
// PURPOSE: Backend endpoints for managing extra/secondary dogs
// ═══════════════════════════════════════════════════════════════════════════════

import { Router, Request, Response } from "express";
import { pool } from "../db";
import { authenticate, AuthRequest } from "../middleware/auth";

const router = Router();

// ─── GET /api/dogs - Get all dogs for current user (main + extra) ──────────────
router.get("/", authenticate, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user!.userId;

    // Get main dog (from users table)
    const mainDogResult = await pool.query(
      `SELECT id, name, gender, breed, dob, life_stage AS "lifeStage", 
              personality, avatar_url AS "avatarUrl"
       FROM dogs 
       WHERE user_id = $1 AND is_main = true`,
      [userId]
    );

    // Get extra dogs
    const extraDogsResult = await pool.query(
      `SELECT id, name, gender, breed, dob, life_stage AS "lifeStage", 
              personality, avatar_url AS "avatarUrl"
       FROM dogs 
       WHERE user_id = $1 AND is_main = false
       ORDER BY created_at DESC`,
      [userId]
    );

    res.json({
      mainDog: mainDogResult.rows[0] || null,
      extraDogs: extraDogsResult.rows,
    });
  } catch (err) {
    console.error("GET /dogs error:", err);
    res.status(500).json({ message: "Failed to fetch dogs" });
  }
});

// ─── POST /api/dogs - Create extra dog ───────────────────────────────────────
router.post("/", authenticate, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user!.userId;
    const { name, breed, gender, dob, lifeStage, personality } = req.body;

    if (!name || !gender || !lifeStage) {
      res.status(400).json({ message: "Missing required fields" });
      return;
    }

    const result = await pool.query(
      `INSERT INTO dogs (user_id, name, breed, gender, dob, life_stage, personality, is_main, created_at, updated_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, false, NOW(), NOW())
       RETURNING id, name, gender, breed, dob, life_stage AS "lifeStage", 
                 personality, avatar_url AS "avatarUrl"`,
      [userId, name, breed || null, gender, dob || null, lifeStage, JSON.stringify(personality || [])]
    );

    res.status(201).json({ dog: result.rows[0] });
  } catch (err) {
    console.error("POST /dogs error:", err);
    res.status(500).json({ message: "Failed to create dog" });
  }
});

// ─── PATCH /api/dogs/:id - Update extra dog ─────────────────────────────────
router.patch("/:id", authenticate, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user!.userId;
    const { id } = req.params;
    const { name, breed, gender, dob, lifeStage, personality } = req.body;

    // Verify ownership
    const checkResult = await pool.query(
      "SELECT user_id FROM dogs WHERE id = $1",
      [id]
    );

    if (checkResult.rows.length === 0) {
      res.status(404).json({ message: "Dog not found" });
      return;
    }

    if (checkResult.rows[0].user_id !== userId) {
      res.status(403).json({ message: "Not authorized" });
      return;
    }

    // Build dynamic update
    const updates: string[] = [];
    const values: any[] = [];
    let paramCount = 1;

    if (name !== undefined) {
      updates.push(`name = $${paramCount}`);
      values.push(name);
      paramCount++;
    }
    if (breed !== undefined) {
      updates.push(`breed = $${paramCount}`);
      values.push(breed);
      paramCount++;
    }
    if (gender !== undefined) {
      updates.push(`gender = $${paramCount}`);
      values.push(gender);
      paramCount++;
    }
    if (dob !== undefined) {
      updates.push(`dob = $${paramCount}`);
      values.push(dob);
      paramCount++;
    }
    if (lifeStage !== undefined) {
      updates.push(`life_stage = $${paramCount}`);
      values.push(lifeStage);
      paramCount++;
    }
    if (personality !== undefined) {
      updates.push(`personality = $${paramCount}`);
      values.push(JSON.stringify(personality));
      paramCount++;
    }

    if (updates.length === 0) {
      res.status(400).json({ message: "No updates provided" });
      return;
    }

    updates.push(`updated_at = NOW()`);
    values.push(id);

    const result = await pool.query(
      `UPDATE dogs 
       SET ${updates.join(", ")}
       WHERE id = $${paramCount}
       RETURNING id, name, gender, breed, dob, life_stage AS "lifeStage", 
                 personality, avatar_url AS "avatarUrl"`,
      values
    );

    res.json({ dog: result.rows[0] });
  } catch (err) {
    console.error("PATCH /dogs/:id error:", err);
    res.status(500).json({ message: "Failed to update dog" });
  }
});

// ─── DELETE /api/dogs/:id - Delete extra dog ────────────────────────────────
router.delete("/:id", authenticate, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user!.userId;
    const { id } = req.params;

    // Verify ownership and that it's not main dog
    const checkResult = await pool.query(
      "SELECT user_id, is_main FROM dogs WHERE id = $1",
      [id]
    );

    if (checkResult.rows.length === 0) {
      res.status(404).json({ message: "Dog not found" });
      return;
    }

    if (checkResult.rows[0].user_id !== userId) {
      res.status(403).json({ message: "Not authorized" });
      return;
    }

    if (checkResult.rows[0].is_main) {
      res.status(400).json({ message: "Cannot delete main dog" });
      return;
    }

    await pool.query("DELETE FROM dogs WHERE id = $1", [id]);

    res.status(204).send();
  } catch (err) {
    console.error("DELETE /dogs/:id error:", err);
    res.status(500).json({ message: "Failed to delete dog" });
  }
});

export default router;