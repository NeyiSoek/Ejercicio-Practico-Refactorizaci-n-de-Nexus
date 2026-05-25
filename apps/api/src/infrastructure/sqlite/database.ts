import { existsSync, mkdirSync, readFileSync } from "node:fs";
import { dirname } from "node:path";
import Database from "better-sqlite3";

export type SqliteDb = Database.Database;

export function createDatabase(dbPath: string, seedPath: string): SqliteDb {
  const firstRun = !existsSync(dbPath);
  mkdirSync(dirname(dbPath), { recursive: true });
  const db = new Database(dbPath);
  db.pragma("foreign_keys = OFF");

  if (firstRun) {
    const seedScript = readFileSync(seedPath, "utf-8");
    db.exec(seedScript);
  }

  return db;
}
