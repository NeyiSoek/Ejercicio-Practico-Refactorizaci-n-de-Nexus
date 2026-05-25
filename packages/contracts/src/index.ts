export type UserSession = {
  userId: number;
  username: string;
  isAdmin: boolean;
};

export type LoginRequest = {
  username: string;
  password: string;
};

export type ProductDto = {
  id: number;
  sku: string | null;
  name: string | null;
  price: number | null;
  category: string | null;
  supplierId: number | null;
  deletedAt: string | null;
};

export type SaleItemInput = {
  productId: number;
  qty: number;
  warehouseId?: number;
};

export type CreateSaleRequest = {
  userId: number;
  customerType: string;
  items: SaleItemInput[];
};

export type CreateSaleResponse = {
  saleId: number;
  subtotal: number;
  iva: number;
  total: number;
};

export type SalesReportRow = {
  saleId: number;
  createdAt: string;
  username: string;
  customerType: string;
  subtotal: number;
  total: number;
};

export type ApiError = {
  error: string;
};
