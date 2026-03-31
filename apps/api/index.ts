import "dotenv/config";
import app from "./app.js";
import type { Request, Response } from "express";

const PORT = process.env.PORT || 3000;


app.listen(PORT, () => {
  console.log(`Running at http://localhost:${PORT}`);
});