export const config = {
  port: Number(process.env.PORT ?? 5001),
  dbPath: process.env.LEGACY_DB_PATH ?? "../../data/legacy.db",
  seedPath: process.env.LEGACY_SEED_PATH ?? "../../seed_data.sql"
};
