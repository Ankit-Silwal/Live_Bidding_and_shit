import pkg from "pg";

const { Pool } = pkg;

export const pool = new Pool({
  user: process.env.DB_USER || "postgres",
  host: process.env.DB_HOST || "localhost",
  database: process.env.DB_NAME || "auction",
  password: process.env.DB_PASSWORD || "postgres",
  port: Number(process.env.DB_PORT) || 5432
});

pool.connect()
  .then(client =>
  {
    console.log(" DB connected");

    client.release();
  })
  .catch(err =>
  {
    console.error(" DB connection failed:", err);
  });