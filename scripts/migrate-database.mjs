import { existsSync } from "node:fs";
import { loadEnvFile } from "node:process";
import { resolve } from "node:path";
import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import { migrate } from "drizzle-orm/neon-http/migrator";

const projectRoot = resolve(import.meta.dirname, "..");
const localEnvPath = resolve(projectRoot, ".env.local");

if (!process.env.DATABASE_URL && existsSync(localEnvPath)) {
  loadEnvFile(localEnvPath);
}
if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL is required");
}

const db = drizzle({ client: neon(process.env.DATABASE_URL) });
await migrate(db, { migrationsFolder: resolve(projectRoot, "drizzle") });
console.log("Neon 数据库迁移完成。");
