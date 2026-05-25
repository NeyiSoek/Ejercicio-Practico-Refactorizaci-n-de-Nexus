import { z } from "zod";
import type { Express } from "express";
import type { SqliteDb } from "../../../infrastructure/sqlite/database";
import { loginUser } from "../application/login";
import { SqliteUserAuthRepository } from "../infrastructure/sqlite-user-auth-repository";

const loginSchema = z.object({
  username: z.string().min(1),
  password: z.string().min(1)
});

export function registerAuthRoutes(app: Express, db: SqliteDb): void {
  const repo = new SqliteUserAuthRepository(db);

  app.post("/api/login", (req, res, next) => {
    try {
      const input = loginSchema.parse(req.body);
      const session = loginUser(repo, input.username, input.password);
      res.json(session);
    } catch (error) {
      next(error);
    }
  });
}
