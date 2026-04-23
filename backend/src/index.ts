import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { testConnection } from "./db.js";
import { errorHandler } from "./middleware/errorHandler.js";
import authRouter from "./routes/auth.js";
import pagesRouter from "./routes/pages.js";
import fieldsRouter from "./routes/fields.js";
import paymentsRouter from "./routes/payments.js";
import webhooksRouter from "./routes/webhooks.js";
import reportsRouter from "./routes/reports.js";

dotenv.config();

const app = express();
const PORT = process.env["PORT"] ?? 3000;

// Stripe webhooks must receive the raw body — register before express.json()
app.use("/api/webhooks", express.raw({ type: "application/json" }), webhooksRouter);

app.use(cors({ origin: process.env["FRONTEND_URL"] ?? "http://localhost:5173" }));
app.use(express.json());

app.get("/health", (_req, res) => {
  res.json({ status: "ok" });
});

app.use("/api/auth", authRouter);
app.use("/api/pages", pagesRouter);
app.use("/api/pages/:pageId/fields", fieldsRouter);
app.use("/api/payments", paymentsRouter);
app.use("/api/reports", reportsRouter);

app.use(errorHandler);

testConnection()
  .then(() => {
    console.log("Database connected");
    app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
  })
  .catch((err) => {
    console.error("Failed to connect to database:", err);
    process.exit(1);
  });
