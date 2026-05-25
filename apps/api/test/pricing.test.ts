import { describe, expect, it } from "vitest";
import { calculateSaleTotals } from "../src/modules/sales/domain/pricing";

describe("calculateSaleTotals", () => {
  it("applies medium volume discount and iva", () => {
    const result = calculateSaleTotals(
      [{ productId: 1, qty: 11 }],
      { 1: 100 },
      "NORMAL"
    );

    expect(result.subtotal).toBe(1045);
    expect(result.iva).toBe(167.2);
    expect(result.total).toBe(1212.2);
  });

  it("applies LEGACY_A extra discount", () => {
    const result = calculateSaleTotals(
      [{ productId: 1, qty: 10 }],
      { 1: 100 },
      "LEGACY_A"
    );

    expect(result.subtotal).toBe(850);
    expect(result.total).toBe(986);
  });
});
