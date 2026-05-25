import type { Express } from "express";
import type { SqliteDb } from "../../../infrastructure/sqlite/database";
import { toNumber } from "../../../shared/http";
import { getProduct, listProducts } from "../application/catalog";
import { SqliteProductRepository } from "../infrastructure/sqlite-product-repository";

export function registerCatalogRoutes(app: Express, db: SqliteDb): void {
  const repo = new SqliteProductRepository(db);

  app.get("/api/products", (req, res) => {
    const query = typeof req.query.q === "string" ? req.query.q : undefined;
    const rows = listProducts(repo, query);
    res.json(rows);
  });

  app.get("/api/products/:id", (req, res, next) => {
    try {
      const id = toNumber(req.params.id, "id");
      const row = getProduct(repo, id);
      res.json(row);
    } catch (error) {
      next(error);
    }
  });
}
