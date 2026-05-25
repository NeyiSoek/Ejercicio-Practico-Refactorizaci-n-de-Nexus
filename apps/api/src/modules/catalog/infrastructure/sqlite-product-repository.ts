import type { ProductDto } from "@legacy-nexus/contracts";
import type { SqliteDb } from "../../../infrastructure/sqlite/database";
import type { ProductRepository } from "../application/ports";

type ProductRow = {
  id: number;
  sku: string | null;
  name: string | null;
  price: number | null;
  category: string | null;
  supplier_id: number | null;
  deleted_at: string | null;
};

function mapRow(row: ProductRow): ProductDto {
  return {
    id: row.id,
    sku: row.sku,
    name: row.name,
    price: row.price,
    category: row.category,
    supplierId: row.supplier_id,
    deletedAt: row.deleted_at
  };
}

export class SqliteProductRepository implements ProductRepository {
  constructor(private readonly db: SqliteDb) {}

  listActive(search?: string): ProductDto[] {
    if (search && search.trim().length > 0) {
      const rows = this.db
        .prepare(
          "SELECT id, sku, name, price, category, supplier_id, deleted_at FROM products WHERE deleted_at IS NULL AND name LIKE ? ORDER BY id DESC"
        )
        .all(`%${search.trim()}%`) as ProductRow[];
      return rows.map(mapRow);
    }

    const rows = this.db
      .prepare(
        "SELECT id, sku, name, price, category, supplier_id, deleted_at FROM products WHERE deleted_at IS NULL ORDER BY id DESC"
      )
      .all() as ProductRow[];
    return rows.map(mapRow);
  }

  getById(id: number): ProductDto | null {
    const row = this.db
      .prepare(
        "SELECT id, sku, name, price, category, supplier_id, deleted_at FROM products WHERE id = ? AND deleted_at IS NULL"
      )
      .get(id) as ProductRow | undefined;

    return row ? mapRow(row) : null;
  }
}
