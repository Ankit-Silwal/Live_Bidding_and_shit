import { Pool } from "pg";

export const pool = new Pool({
  connectionString: "postgresql://postgres:postgres@localhost:5433/auction",
});

pool.connect()
  .then(() => console.log("Postgres connected (Docker)"))
  .catch((err) => console.error(" DB error:", err));