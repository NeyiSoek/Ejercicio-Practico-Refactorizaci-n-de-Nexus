import type { ReportsRepository } from "./ports";

export function monthlyReport(repo: ReportsRepository, year: number, month: number) {
  return repo.monthly(year, month);
}

export function monthlyTotal(repo: ReportsRepository, year: number, month: number) {
  return { total: repo.monthlyTotal(year, month) };
}
