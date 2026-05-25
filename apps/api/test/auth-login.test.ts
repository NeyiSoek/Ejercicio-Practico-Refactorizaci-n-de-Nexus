import { describe, expect, it } from "vitest";
import { loginUser } from "../src/modules/auth/application/login";
import type { UserAuthRepository } from "../src/modules/auth/application/ports";

describe("loginUser", () => {
  it("throws for invalid credentials", () => {
    const repo: UserAuthRepository = {
      login: () => null
    };

    expect(() => loginUser(repo, "wrong", "wrong")).toThrowError("invalid credentials");
  });

  it("returns session for valid credentials", () => {
    const repo: UserAuthRepository = {
      login: () => ({ id: 1, username: "admin", isAdmin: true })
    };

    expect(loginUser(repo, "admin", "1234")).toEqual({
      userId: 1,
      username: "admin",
      isAdmin: true
    });
  });
});
