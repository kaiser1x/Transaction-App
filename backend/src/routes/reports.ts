import { Router } from "express";
import { checkJwt } from "../middleware/auth.js";
import { requireAdmin } from "../middleware/requireAdmin.js";
import { query, queryOne } from "../db.js";
import type { Transaction } from "../types.js";
import type { RowDataPacket } from "mysql2/promise";

const router = Router();

function parsePaginationValue(
  value: unknown,
  fallback: number,
  { min = 0, max = Number.MAX_SAFE_INTEGER }: { min?: number; max?: number } = {}
): number {
  const parsed = Number(value);

  if (!Number.isInteger(parsed) || parsed < min) {
    return fallback;
  }

  return Math.min(parsed, max);
}

function buildFilters(query: Record<string, unknown>): {
  where: string;
  params: (string | number | boolean | null | Date)[];
} {
  const conditions: string[] = [];
  const params: (string | number | boolean | null | Date)[] = [];

  if (query["startDate"]) {
    conditions.push("t.created_at >= ?");
    params.push(String(query["startDate"]));
  }
  if (query["endDate"]) {
    conditions.push("t.created_at <= ?");
    params.push(String(query["endDate"]));
  }
  if (query["pageId"]) {
    conditions.push("t.page_id = ?");
    params.push(String(query["pageId"]));
  }
  if (query["status"]) {
    conditions.push("t.status = ?");
    params.push(String(query["status"]));
  }

  return {
    where: conditions.length ? `WHERE ${conditions.join(" AND ")}` : "",
    params,
  };
}

interface TransactionRow extends Transaction {
  page_title: string;
}

// GET /api/reports/transactions
router.get("/transactions", checkJwt, requireAdmin, async (req, res, next) => {
  try {
    const limit = parsePaginationValue(req.query["limit"], 50, { min: 1, max: 200 });
    const offset = parsePaginationValue(req.query["offset"], 0);
    const { where, params } = buildFilters(req.query as Record<string, unknown>);

    const rows = await query<TransactionRow>(
      `SELECT t.*, p.title AS page_title
       FROM transactions t
       JOIN payment_pages p ON t.page_id = p.id
       ${where}
       ORDER BY t.created_at DESC
       LIMIT ${limit} OFFSET ${offset}`,
      params
    );

    res.json(rows);
  } catch (err) {
    next(err);
  }
});

// GET /api/reports/summary
router.get("/summary", checkJwt, requireAdmin, async (req, res, next) => {
  try {
    const { where, params } = buildFilters(req.query as Record<string, unknown>);

    interface Summary extends RowDataPacket {
      total_count: number;
      success_count: number;
      failed_count: number;
      pending_count: number;
      total_collected: string;
      avg_amount: string;
    }

    const row = await queryOne<Summary>(
      `SELECT
        COUNT(*) AS total_count,
        SUM(status = 'success') AS success_count,
        SUM(status = 'failed')  AS failed_count,
        SUM(status = 'pending') AS pending_count,
        COALESCE(SUM(CASE WHEN status = 'success' THEN amount END), 0) AS total_collected,
        COALESCE(AVG(CASE WHEN status = 'success' THEN amount END), 0) AS avg_amount
       FROM transactions t
       ${where}`,
      params
    );

    res.json(row);
  } catch (err) {
    next(err);
  }
});

// GET /api/reports/by-gl
router.get("/by-gl", checkJwt, requireAdmin, async (req, res, next) => {
  try {
    interface GlRow extends RowDataPacket {
      gl_code: string;
      count: number;
      total: string;
    }

    const rows = await query<GlRow>(
      `SELECT gl_code, COUNT(*) AS count, SUM(amount) AS total
       FROM transactions
       WHERE status = 'success'
       GROUP BY gl_code
       ORDER BY total DESC`
    );
    res.json(rows);
  } catch (err) {
    next(err);
  }
});

// GET /api/reports/by-method
router.get("/by-method", checkJwt, requireAdmin, async (req, res, next) => {
  try {
    interface MethodRow extends RowDataPacket {
      payment_method: string;
      count: number;
      total: string;
    }

    const rows = await query<MethodRow>(
      `SELECT payment_method, COUNT(*) AS count, SUM(amount) AS total
       FROM transactions
       WHERE status = 'success'
       GROUP BY payment_method
       ORDER BY total DESC`
    );
    res.json(rows);
  } catch (err) {
    next(err);
  }
});

// GET /api/reports/export — CSV download
router.get("/export", checkJwt, requireAdmin, async (req, res, next) => {
  try {
    const { where, params } = buildFilters(req.query as Record<string, unknown>);

    const rows = await query<TransactionRow>(
      `SELECT t.id, t.created_at, p.title AS page_title,
              t.amount, t.payment_method, t.status,
              t.payer_name, t.payer_email, t.gl_code, t.stripe_intent_id
       FROM transactions t
       JOIN payment_pages p ON t.page_id = p.id
       ${where}
       ORDER BY t.created_at DESC`,
      params
    );

    const headers = [
      "id", "created_at", "page_title", "amount", "payment_method",
      "status", "payer_name", "payer_email", "gl_code", "stripe_intent_id",
    ];

    const csv = [
      headers.join(","),
      ...rows.map((r) =>
        headers
          .map((h) => {
            const val = r[h as keyof TransactionRow];
            return `"${String(val ?? "").replace(/"/g, '""')}"`;
          })
          .join(",")
      ),
    ].join("\n");

    res.setHeader("Content-Type", "text/csv");
    res.setHeader("Content-Disposition", "attachment; filename=transactions.csv");
    res.send(csv);
  } catch (err) {
    next(err);
  }
});

export default router;
