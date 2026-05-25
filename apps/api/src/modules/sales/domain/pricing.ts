import type { SaleItemInput } from "@legacy-nexus/contracts";

export type PriceMap = Record<number, number>;

function roundMoney(value: number): number {
  return Math.round(value * 100) / 100;
}

export function calculateSaleTotals(
  items: SaleItemInput[],
  prices: PriceMap,
  customerType: string
): { subtotal: number; iva: number; total: number } {
  const quantities = items.reduce((acc, item) => acc + item.qty, 0);
  const rawSubtotal = items.reduce((acc, item) => {
    const unitPrice = prices[item.productId] ?? 0;
    return acc + unitPrice * item.qty;
  }, 0);

  let discounted = rawSubtotal;
  if (quantities > 50) {
    discounted *= 0.9;
  } else if (quantities > 10) {
    discounted *= 0.95;
  }

  // Preserve legacy trigger behavior in the domain layer instead of SQL trigger coupling.
  if (customerType === "LEGACY_A") {
    discounted *= 0.85;
  }

  const iva = discounted * 0.16;
  const total = discounted + iva;

  return {
    subtotal: roundMoney(discounted),
    iva: roundMoney(iva),
    total: roundMoney(total)
  };
}
