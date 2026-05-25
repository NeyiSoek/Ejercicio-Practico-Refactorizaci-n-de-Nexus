import type { CreateSaleResponse, SaleItemInput } from "@legacy-nexus/contracts";

export type ProductPrice = {
  productId: number;
  unitPrice: number;
};

export interface SalesRepository {
  getProductPrices(productIds: number[]): ProductPrice[];
  createSale(input: {
    userId: number;
    customerType: string;
    subtotal: number;
    total: number;
    items: SaleItemInput[];
  }): CreateSaleResponse;
  listSalesByUser(userId: number): Array<{
    id: number;
    user_id: number;
    customer_type: string;
    subtotal: number;
    total: string;
    status: string;
    created_at: string;
  }>;
}
