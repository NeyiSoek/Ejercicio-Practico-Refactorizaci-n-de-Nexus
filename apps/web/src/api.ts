import type {
  CreateSaleRequest,
  CreateSaleResponse,
  LoginRequest,
  ProductDto,
  SalesReportRow,
  UserSession
} from "@legacy-nexus/contracts";

const API_BASE = import.meta.env.VITE_API_BASE ?? "http://localhost:5001";

async function http<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(`${API_BASE}${path}`, {
    headers: {
      "Content-Type": "application/json",
      ...(init?.headers ?? {})
    },
    ...init
  });

  const payload = (await response.json()) as T | { error: string };
  if (!response.ok) {
    const message = (payload as { error?: string }).error ?? "Request error";
    throw new Error(message);
  }

  return payload as T;
}

export const api = {
  login(input: LoginRequest) {
    return http<UserSession>("/api/login", {
      method: "POST",
      body: JSON.stringify(input)
    });
  },
  listProducts(search: string) {
    const query = search.trim().length > 0 ? `?q=${encodeURIComponent(search)}` : "";
    return http<ProductDto[]>(`/api/products${query}`);
  },
  createSale(input: CreateSaleRequest) {
    return http<CreateSaleResponse>("/api/sales", {
      method: "POST",
      body: JSON.stringify(input)
    });
  },
  listSalesByUser(userId: number) {
    return http<
      Array<{
        id: number;
        created_at: string;
        total: string;
        customer_type: string;
        status: string;
      }>
    >(`/api/sales/by-user/${userId}`);
  },
  monthlyReport(year: number, month: number) {
    return http<SalesReportRow[]>(`/api/reports/monthly?year=${year}&month=${month}`);
  },
  monthlyTotal(year: number, month: number) {
    return http<{ total: number }>(`/api/reports/total?year=${year}&month=${month}`);
  }
};
