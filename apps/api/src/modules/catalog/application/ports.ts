import type { ProductDto } from "@legacy-nexus/contracts";

export interface ProductRepository {
  listActive(search?: string): ProductDto[];
  getById(id: number): ProductDto | null;
}
