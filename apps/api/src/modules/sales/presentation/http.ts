import { z } from "zod";
import type { Express } from "express";
import type { CreateSaleRequest } from "@legacy-nexus/contracts";
import type { SqliteDb } from "../../../infrastructure/sqlite/database";
import { toNumber } from "../../../shared/http";
import { createSale, getSalesByUser } from "../application/create-sale";
import { SqliteSalesRepository } from "../infrastructure/sqlite-sales-repository";

const saleSchema = z.object({
  userId: z.number().int().positive(),
  customerType: z.string().min(1),
  items: z
    .array(
      z.object({
        productId: z.number().int().positive(),
        qty: z.number().int().positive(),
        warehouseId: z.number().int().positive().optional()
      })
    )
    .min(1)
});

export function registerSalesRoutes(app: Express, db: SqliteDb): void {
  const repo = new SqliteSalesRepository(db);

  app.post("/api/sales", (req, res, next) => {
    try {
      const input = saleSchema.parse(req.body) as CreateSaleRequest;
      const result = createSale(repo, input);
      res.status(201).json(result);
    } catch (error) {
      next(error);
    }
  });

  app.get("/api/sales/by-user/:userId", (req, res, next) => {
    try {
      const userId = toNumber(req.params.userId, "userId");
      const rows = getSalesByUser(repo, userId);
      res.json(rows);
    } catch (error) {
      next(error);
    }
  });
}
