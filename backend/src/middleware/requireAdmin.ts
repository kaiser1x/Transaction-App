import type { Request, Response, NextFunction } from "express";
import { queryOne } from "../db.js";
import type { User } from "../types.js";

export async function requireAdmin(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  const auth0Id = req.auth?.payload["sub"];
  if (!auth0Id) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }

  const user = await queryOne<User>(
    "SELECT id, role FROM users WHERE auth0_id = ?",
    [auth0Id]
  );

  if (!user || user.role !== "admin") {
    res.status(403).json({ error: "Forbidden" });
    return;
  }

  next();
}
