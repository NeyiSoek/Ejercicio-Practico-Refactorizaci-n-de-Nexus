import type { CreateSaleResponse, SaleItemInput } from "@legacy-nexus/contracts";
import type { SqliteDb } from "../../../infrastructure/sqlite/database";
import type { ProductPrice, SalesRepository } from "../application/ports";

type SaleRow = {
  id: number;
  user_id: number;
  customer_type: string;
  subtotal: number;
  total: string;
  status: string;
  created_at: string;
};

function nowIso(): string {
  return new Date().toISOString();
}

export class SqliteSalesRepository implements SalesRepository {
  constructor(private readonly db: SqliteDb) {}

  getProductPrices(productIds: number[]): ProductPrice[] {
    if (productIds.length === 0) {
      return [];
    }

    const placeholders = productIds.map(() => "?").join(", ");
    const rows = this.db
      .prepare(`SELECT id AS productId, price AS unitPrice FROM products WHERE id IN (${placeholders}) AND deleted_at IS NULL`)
      .all(...productIds) as ProductPrice[];

    return rows;
  }

  createSale(input: {
    userId: number;
    customerType: string;
    subtotal: number;
    total: number;
    items: SaleItemInput[];
  }): CreateSaleResponse {
    const runInTx = this.db.transaction(() => {
      const sale = this.db
        .prepare(
          "INSERT INTO sales (user_id, customer_type, subtotal, total, status, last_touch_at, created_at) VALUES (?, ?, ?, ?, ?, ?, ?)"
        )
        .run(input.userId, input.customerType, input.subtotal, String(input.total), "completed", nowIso(), nowIso());

      const saleId = Number(sale.lastInsertRowid);

      const itemStmt = this.db.prepare(
        "INSERT INTO sale_items (sale_id, product_id, qty, unit_price) VALUES (?, ?, ?, ?)"
      );
      const updateStockStmt = this.db.prepare(
        "UPDATE inventory_stock SET quantity = quantity - ? WHERE product_id = ? AND warehouse_id = ?"
      );

      const priceMap = this.getProductPrices(input.items.map((item) => item.productId)).reduce<Record<number, number>>(
        (acc, row) => {
          acc[row.productId] = row.unitPrice;
          return acc;
        },
        {}
      );

      for (const item of input.items) {
        itemStmt.run(saleId, item.productId, item.qty, priceMap[item.productId]);
        updateStockStmt.run(item.qty, item.productId, item.warehouseId ?? 1);
      }

      return {
        saleId,
        subtotal: input.subtotal,
        iva: Math.round((input.total - input.subtotal) * 100) / 100,
        total: input.total
      };
    });

    return runInTx();
  }

  listSalesByUser(userId: number): SaleRow[] {
    return this.db
      .prepare(
        "SELECT id, user_id, customer_type, subtotal, total, status, created_at FROM sales WHERE user_id = ? AND status = 'completed' ORDER BY id DESC"
      )
      .all(userId) as SaleRow[];
  }
}
