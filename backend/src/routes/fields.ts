import { Router } from "express";
import { randomUUID } from "crypto";
import { checkJwt } from "../middleware/auth.js";
import { requireAdmin } from "../middleware/requireAdmin.js";
import { query, execute } from "../db.js";
import type { CustomField } from "../types.js";

interface FieldBody {
  label?: string;
  field_type?: string;
  options?: unknown;
  required?: boolean;
  placeholder?: string;
  helper_text?: string;
  display_order?: number;
}

const router = Router({ mergeParams: true });

// GET /api/pages/:pageId/fields
router.get("/", checkJwt, requireAdmin, async (req, res, next) => {
  try {
    const fields = await query<CustomField>(
      "SELECT * FROM custom_fields WHERE page_id = ? ORDER BY display_order ASC",
      [String(req.params["pageId"] ?? "")]
    );
    res.json(fields);
  } catch (err) {
    next(err);
  }
});

// POST /api/pages/:pageId/fields
router.post("/", checkJwt, requireAdmin, async (req, res, next) => {
  try {
    const body = req.body as FieldBody;

    if (!body.label || !body.field_type) {
      res.status(400).json({ error: "label and field_type are required" });
      return;
    }

    const existing = await query<CustomField>(
      "SELECT id FROM custom_fields WHERE page_id = ?",
      [String(req.params["pageId"] ?? "")]
    );
    if (existing.length >= 10) {
      res.status(400).json({ error: "Maximum of 10 custom fields per page" });
      return;
    }

    const id = randomUUID();
    await execute(
      `INSERT INTO custom_fields
        (id, page_id, label, field_type, options, required, placeholder, helper_text, display_order)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        id,
        String(req.params["pageId"] ?? ""),
        body.label,
        body.field_type,
        body.options != null ? JSON.stringify(body.options) : null,
        body.required ? 1 : 0,
        body.placeholder ?? null,
        body.helper_text ?? null,
        body.display_order ?? existing.length,
      ]
    );

    res.status(201).json({ id });
  } catch (err) {
    next(err);
  }
});

// PUT /api/pages/:pageId/fields/:fieldId
router.put("/:fieldId", checkJwt, requireAdmin, async (req, res, next) => {
  try {
    const body = req.body as FieldBody;

    await execute(
      `UPDATE custom_fields SET
        label = ?, field_type = ?, options = ?, required = ?,
        placeholder = ?, helper_text = ?, display_order = ?
       WHERE id = ? AND page_id = ?`,
      [
        body.label ?? null,
        body.field_type ?? null,
        body.options != null ? JSON.stringify(body.options) : null,
        body.required ? 1 : 0,
        body.placeholder ?? null,
        body.helper_text ?? null,
        body.display_order ?? 0,
        String(req.params["fieldId"] ?? ""),
        String(req.params["pageId"] ?? ""),
      ]
    );
    res.json({ ok: true });
  } catch (err) {
    next(err);
  }
});

// DELETE /api/pages/:pageId/fields/:fieldId
router.delete("/:fieldId", checkJwt, requireAdmin, async (req, res, next) => {
  try {
    await execute(
      "DELETE FROM custom_fields WHERE id = ? AND page_id = ?",
      [String(req.params["fieldId"] ?? ""), String(req.params["pageId"] ?? "")]
    );
    res.status(204).send();
  } catch (err) {
    next(err);
  }
});

// PATCH /api/pages/:pageId/fields/reorder — body: [{ id, display_order }]
router.patch("/reorder", checkJwt, requireAdmin, async (req, res, next) => {
  try {
    const updates = req.body as { id: string; display_order: number }[];
    for (const { id, display_order } of updates) {
      await execute(
        "UPDATE custom_fields SET display_order = ? WHERE id = ? AND page_id = ?",
        [display_order, id, String(req.params["pageId"] ?? "")]
      );
    }
    res.json({ ok: true });
  } catch (err) {
    next(err);
  }
});

export default router;
