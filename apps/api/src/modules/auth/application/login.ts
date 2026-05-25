import type { UserSession } from "@legacy-nexus/contracts";
import { HttpError } from "../../../shared/http";
import type { UserAuthRepository } from "./ports";

export function loginUser(repo: UserAuthRepository, username: string, password: string): UserSession {
  const found = repo.login(username, password);
  if (!found) {
    throw new HttpError(401, "invalid credentials");
  }

  return {
    userId: found.id,
    username: found.username,
    isAdmin: found.isAdmin
  };
}
