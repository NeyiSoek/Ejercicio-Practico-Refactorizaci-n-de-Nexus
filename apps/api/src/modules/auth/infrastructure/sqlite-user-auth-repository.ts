import type { SqliteDb } from "../../../infrastructure/sqlite/database";
import type { AuthUser, UserAuthRepository } from "../application/ports";

type UserRow = {
  id: number;
  username: string;
  is_admin: number;
};

export class SqliteUserAuthRepository implements UserAuthRepository {
  constructor(private readonly db: SqliteDb) {}

  login(username: string, password: string): AuthUser | null {
    const row = this.db
      .prepare("SELECT id, username, is_admin FROM users WHERE username = ? AND password = ?")
      .get(username, password) as UserRow | undefined;

    if (!row) {
      return null;
    }

    return {
      id: row.id,
      username: row.username,
      isAdmin: Boolean(row.is_admin)
    };
  }
}
