import type { Express } from "express";
import type { SqliteDb } from "../../../infrastructure/sqlite/database";
import { toNumber } from "../../../shared/http";
import { monthlyReport, monthlyTotal } from "../application/reports";
import { SqliteReportsRepository } from "../infrastructure/sqlite-reports-repository";

export function registerReportRoutes(app: Express, db: SqliteDb): void {
  const repo = new SqliteReportsRepository(db);

  app.get("/api/reports/monthly", (req, res, next) => {
    try {
      const year = toNumber(String(req.query.year ?? "2025"), "year");
      const month = toNumber(String(req.query.month ?? "1"), "month");
      const rows = monthlyReport(repo, year, month);
      res.json(rows);
    } catch (error) {
      next(error);
    }
  });

  app.get("/api/reports/total", (req, res, next) => {
    try {
      const year = toNumber(String(req.query.year ?? "2025"), "year");
      const month = toNumber(String(req.query.month ?? "1"), "month");
      const payload = monthlyTotal(repo, year, month);
      res.json(payload);
    } catch (error) {
      next(error);
    }
  });
}
