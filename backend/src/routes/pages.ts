import { Router } from "express";
import { randomUUID } from "crypto";
import { checkJwt } from "../middleware/auth.js";
import { requireAdmin } from "../middleware/requireAdmin.js";
import { query, queryOne, execute } from "../db.js";
import type { CustomField, PaymentPage, User } from "../types.js";

interface PageBody {
  slug?: string;
  title?: string;
  description?: string;
  header_msg?: string;
  footer_msg?: string;
  brand_color?: string;
  logo_url?: string;
  amount_mode?: string;
  fixed_amount?: number;
  min_amount?: number;
  max_amount?: number;
  gl_codes?: unknown;
  email_template?: string;
}

const router = Router();

// GET /api/pages — list all pages for the logged-in admin
router.get("/", checkJwt, requireAdmin, async (req, res, next) => {
  try {
    const auth0Id = req.auth?.payload["sub"] as string;
    const user = await queryOne<User>(
      "SELECT id FROM users WHERE auth0_id = ?",
      [auth0Id]
    );
    const pages = await query<PaymentPage>(
      "SELECT * FROM payment_pages WHERE created_by = ? ORDER BY created_at DESC",
      [user?.id ?? ""]
    );
    res.json(pages);
  } catch (err) {
    next(err);
  }
});

// GET /api/pages/available — list active pages for authenticated payer users
router.get("/available", checkJwt, async (_req, res, next) => {
  try {
    const pages = await query<PaymentPage>(
      "SELECT * FROM payment_pages WHERE is_active = TRUE ORDER BY updated_at DESC"
    );
    res.json(pages);
  } catch (err) {
    next(err);
  }
});

// POST /api/pages — create a payment page
router.post("/", checkJwt, requireAdmin, async (req, res, next) => {
  try {
    const auth0Id = req.auth?.payload["sub"] as string;
    const user = await queryOne<User>(
      "SELECT id FROM users WHERE auth0_id = ?",
      [auth0Id]
    );
    if (!user) {
      res.status(404).json({ error: "User not found" });
      return;
    }

    const body = req.body as PageBody;

    if (!body.slug || !body.title || !body.amount_mode) {
      res.status(400).json({ error: "slug, title, and amount_mode are required" });
      return;
    }

    const id = randomUUID();
    await execute(
      `INSERT INTO payment_pages
        (id, slug, title, description, header_msg, footer_msg,
         brand_color, logo_url, amount_mode, fixed_amount, min_amount, max_amount,
         gl_codes, email_template, created_by)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        id,
        body.slug,
        body.title,
        body.description ?? null,
        body.header_msg ?? null,
        body.footer_msg ?? null,
        body.brand_color ?? "#1a56db",
        body.logo_url ?? null,
        body.amount_mode,
        body.fixed_amount ?? null,
        body.min_amount ?? null,
        body.max_amount ?? null,
        body.gl_codes != null ? JSON.stringify(body.gl_codes) : null,
        body.email_template ?? null,
        user.id,
      ]
    );

    const page = await queryOne<PaymentPage>(
      "SELECT * FROM payment_pages WHERE id = ?",
      [id]
    );
    res.status(201).json(page);
  } catch (err) {
    next(err);
  }
});

// GET /api/pages/:slug — public route for payer view
router.get("/:slug", async (req, res, next) => {
  try {
    const page = await queryOne<PaymentPage>(
      "SELECT * FROM payment_pages WHERE slug = ? AND is_active = TRUE",
      [String(req.params["slug"] ?? "")]
    );
    if (!page) {
      res.status(404).json({ error: "Page not found or inactive" });
      return;
    }

    const fields = await query<CustomField>(
      "SELECT * FROM custom_fields WHERE page_id = ? ORDER BY display_order ASC",
      [page.id]
    );

    res.json({ ...page, custom_fields: fields });
  } catch (err) {
    next(err);
  }
});

// PUT /api/pages/:id — full update
router.put("/:id", checkJwt, requireAdmin, async (req, res, next) => {
  try {
    const body = req.body as PageBody;

    await execute(
      `UPDATE payment_pages SET
        slug = ?, title = ?, description = ?, header_msg = ?, footer_msg = ?,
        brand_color = ?, logo_url = ?, amount_mode = ?,
        fixed_amount = ?, min_amount = ?, max_amount = ?,
        gl_codes = ?, email_template = ?
       WHERE id = ?`,
      [
        body.slug ?? null,
        body.title ?? null,
        body.description ?? null,
        body.header_msg ?? null,
        body.footer_msg ?? null,
        body.brand_color ?? "#1a56db",
        body.logo_url ?? null,
        body.amount_mode ?? null,
        body.fixed_amount ?? null,
        body.min_amount ?? null,
        body.max_amount ?? null,
        body.gl_codes != null ? JSON.stringify(body.gl_codes) : null,
        body.email_template ?? null,
        String(req.params["id"] ?? ""),
      ]
    );

    const page = await queryOne<PaymentPage>(
      "SELECT * FROM payment_pages WHERE id = ?",
      [String(req.params["id"] ?? "")]
    );
    res.json(page);
  } catch (err) {
    next(err);
  }
});

// PATCH /api/pages/:id/toggle — enable / disable
router.patch("/:id/toggle", checkJwt, requireAdmin, async (req, res, next) => {
  try {
    await execute(
      "UPDATE payment_pages SET is_active = NOT is_active WHERE id = ?",
      [String(req.params["id"] ?? "")]
    );
    const page = await queryOne<PaymentPage>(
      "SELECT * FROM payment_pages WHERE id = ?",
      [String(req.params["id"] ?? "")]
    );
    res.json(page);
  } catch (err) {
    next(err);
  }
});

// DELETE /api/pages/:id
router.delete("/:id", checkJwt, requireAdmin, async (req, res, next) => {
  try {
    await execute("DELETE FROM payment_pages WHERE id = ?", [
      String(req.params["id"] ?? ""),
    ]);
    res.status(204).send();
  } catch (err) {
    next(err);
  }
});

export default router;
