import type { SalesReportRow } from "@legacy-nexus/contracts";

export interface ReportsRepository {
  monthly(year: number, month: number): SalesReportRow[];
  monthlyTotal(year: number, month: number): number;
}
