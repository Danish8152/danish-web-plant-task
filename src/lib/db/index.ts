import "server-only";
import fs from "node:fs";
import mysql2 from "mysql2";
import { Sequelize } from "sequelize";
import { initModels } from "./models";

export { User, Project, Task } from "./models";

// kept on globalThis so hot reloads in dev don't open a new connection pool every time
const g = globalThis as unknown as { __sequelize?: Sequelize; __dbReady?: Promise<void> };
let modelsReady = false;

function required(name: string) {
  const value = process.env[name];
  if (!value) throw new Error(`Missing environment variable ${name} (see .env.example)`);
  return value;
}

function sslOptions() {
  if (process.env.DB_SSL === "false") return undefined;
  const caPath = process.env.DB_SSL_CA_PATH;
  if (caPath) return { ca: fs.readFileSync(caPath), rejectUnauthorized: true };
  return { rejectUnauthorized: false };
}

function createSequelize() {
  return new Sequelize(required("DB_NAME"), required("DB_USER"), process.env.DB_PASSWORD ?? "", {
    host: required("DB_HOST"),
    port: Number(process.env.DB_PORT ?? 3306),
    dialect: "mysql",
    dialectModule: mysql2,
    dialectOptions: { ssl: sslOptions(), connectTimeout: 15_000 },
    timezone: "+00:00",
    logging: false,
    pool: { max: 5, min: 0, acquire: 20_000, idle: 10_000 },
  });
}

export async function connectDb() {
  const sequelize = (g.__sequelize ??= createSequelize());

  if (!modelsReady) {
    initModels(sequelize);
    modelsReady = true;
  }

  g.__dbReady ??= sequelize
    .sync()
    .then(() => undefined)
    .catch((err) => {
      g.__dbReady = undefined;
      throw err;
    });
  await g.__dbReady;

  return sequelize;
}
