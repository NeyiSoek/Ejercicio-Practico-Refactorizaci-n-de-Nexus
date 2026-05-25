import { HttpError } from "../../../shared/http";
import type { ProductRepository } from "./ports";

export function listProducts(repo: ProductRepository, search?: string) {
  return repo.listActive(search);
}

export function getProduct(repo: ProductRepository, id: number) {
  const found = repo.getById(id);
  if (!found) {
    throw new HttpError(404, "not found");
  }
  return found;
}
