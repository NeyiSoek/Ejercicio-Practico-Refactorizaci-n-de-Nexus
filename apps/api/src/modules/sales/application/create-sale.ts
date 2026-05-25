import type { CreateSaleRequest, CreateSaleResponse } from "@legacy-nexus/contracts";
import { HttpError } from "../../../shared/http";
import { calculateSaleTotals } from "../domain/pricing";
import type { SalesRepository } from "./ports";

export function createSale(repo: SalesRepository, input: CreateSaleRequest): CreateSaleResponse {
  if (input.items.length === 0) {
    throw new HttpError(400, "items must not be empty");
  }

  for (const item of input.items) {
    if (item.qty <= 0) {
      throw new HttpError(400, "qty must be positive");
    }
  }

  const ids = [...new Set(input.items.map((item) => item.productId))];
  const prices = repo.getProductPrices(ids);
  const priceMap: Record<number, number> = {};
  for (const row of prices) {
    priceMap[row.productId] = row.unitPrice;
  }

  for (const id of ids) {
    if (typeof priceMap[id] !== "number") {
      throw new HttpError(400, `unknown product_id: ${id}`);
    }
  }

  const totals = calculateSaleTotals(input.items, priceMap, input.customerType);
  return repo.createSale({
    userId: input.userId,
    customerType: input.customerType,
    subtotal: totals.subtotal,
    total: totals.total,
    items: input.items
  });
}

export function getSalesByUser(repo: SalesRepository, userId: number) {
  return repo.listSalesByUser(userId);
}
