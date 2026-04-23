import { Router } from "express";
import { randomUUID } from "crypto";
import { checkJwt } from "../middleware/auth.js";
import { queryOne, execute } from "../db.js";
import type { User } from "../types.js";

const router = Router();

interface SyncBody {
  email?: string;
  name?: string;
}

// POST /api/auth/sync — upsert user from Auth0 JWT on every login
router.post("/sync", checkJwt, async (req, res, next) => {
  try {
    const auth0Id = req.auth?.payload["sub"] as string;
    const body = req.body as SyncBody;
    const email =
      (req.auth?.payload["email"] as string | undefined) ??
      body.email;
    const name =
      (req.auth?.payload["name"] as string | undefined) ??
      body.name;

    const existing = await queryOne<User>(
      "SELECT * FROM users WHERE auth0_id = ?",
      [auth0Id]
    );

    if (existing) {
      await execute(
        "UPDATE users SET email = ?, name = ? WHERE auth0_id = ?",
        [email ?? existing.email, name ?? existing.name, auth0Id]
      );
    } else {
      await execute(
        "INSERT INTO users (id, auth0_id, email, name, role) VALUES (?, ?, ?, ?, 'payer')",
        [randomUUID(), auth0Id, email ?? "", name ?? null]
      );
    }

    const user = await queryOne<User>(
      "SELECT * FROM users WHERE auth0_id = ?",
      [auth0Id]
    );

    res.json(user);
  } catch (err) {
    next(err);
  }
});

// GET /api/auth/me — return current user profile
router.get("/me", checkJwt, async (req, res, next) => {
  try {
    const auth0Id = req.auth?.payload["sub"] as string;
    const user = await queryOne<User>(
      "SELECT * FROM users WHERE auth0_id = ?",
      [auth0Id]
    );
    if (!user) {
      res.status(404).json({ error: "User not found" });
      return;
    }
    res.json(user);
  } catch (err) {
    next(err);
  }
});

export default router;
