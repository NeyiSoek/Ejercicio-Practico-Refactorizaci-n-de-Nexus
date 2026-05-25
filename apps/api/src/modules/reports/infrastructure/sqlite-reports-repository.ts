import type { SalesReportRow } from "@legacy-nexus/contracts";
import type { SqliteDb } from "../../../infrastructure/sqlite/database";
import type { ReportsRepository } from "../application/ports";

type RawMonthly = {
  sale_id: number;
  created_at: string;
  username: string;
  customer_type: string;
  subtotal: number;
  total: string;
};

function roundMoney(value: number): number {
  return Math.round(value * 100) / 100;
}

export class SqliteReportsRepository implements ReportsRepository {
  constructor(private readonly db: SqliteDb) {}

  monthly(year: number, month: number): SalesReportRow[] {
    const rows = this.db
      .prepare(
        `
        SELECT sale_id, created_at, username, customer_type, subtotal, total
        FROM (
          SELECT
            s.id AS sale_id,
            s.created_at,
            u.username,
            s.customer_type,
            s.subtotal,
            s.total,
            CASE
              WHEN instr(s.created_at, '/') > 0 THEN substr(s.created_at, 7, 4) || '-' || substr(s.created_at, 4, 2) || '-' || substr(s.created_at, 1, 2)
              ELSE substr(s.created_at, 1, 10)
            END AS normalized_date
          FROM sales s
          JOIN users u ON u.id = s.user_id
          WHERE s.status IN ('completed', 'COMPLETED', 'done')
        )
        WHERE substr(normalized_date, 1, 4) = ?
          AND substr(normalized_date, 6, 2) = ?
        ORDER BY sale_id DESC
      `
      )
      .all(String(year), String(month).padStart(2, "0")) as RawMonthly[];

    return rows.map((row) => ({
      saleId: row.sale_id,
      createdAt: row.created_at,
      username: row.username,
      customerType: row.customer_type,
      subtotal: row.subtotal,
      total: Number(row.total)
    }));
  }

  monthlyTotal(year: number, month: number): number {
    const rows = this.monthly(year, month);
    return roundMoney(rows.reduce((acc, row) => acc + row.total, 0));
  }
}
