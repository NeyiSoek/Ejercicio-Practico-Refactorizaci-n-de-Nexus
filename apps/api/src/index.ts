import cors from "cors";
import express from "express";
import { config } from "./config";
import { createDatabase } from "./infrastructure/sqlite/database";
import { registerAuthRoutes } from "./modules/auth/presentation/http";
import { registerCatalogRoutes } from "./modules/catalog/presentation/http";
import { registerSalesRoutes } from "./modules/sales/presentation/http";
import { registerReportRoutes } from "./modules/reports/presentation/http";
import { HttpError } from "./shared/http";

const app = express();
app.use(cors());
app.use(express.json());

const db = createDatabase(config.dbPath, config.seedPath);

registerAuthRoutes(app, db);
registerCatalogRoutes(app, db);
registerSalesRoutes(app, db);
registerReportRoutes(app, db);

app.get("/api/health", (_req, res) => {
  const row = db.prepare("SELECT COUNT(*) AS c FROM users").get() as { c: number };
  res.json({ status: "ok", db: row.c > 0 ? "ready" : "empty" });
});

app.use((error: unknown, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  if (error instanceof HttpError) {
    return res.status(error.statusCode).json({ error: error.message });
  }
  return res.status(500).json({ error: "Unexpected server error" });
});

app.listen(config.port, () => {
  // eslint-disable-next-line no-console
  console.log(`API running on http://localhost:${config.port}`);
});
