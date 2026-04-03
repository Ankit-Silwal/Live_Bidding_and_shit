import { verifyToken } from "@clerk/backend";
import type { Request, Response, NextFunction } from "express";
import { pool } from "@shared/config";

// Extend Express Request type to include user
declare module "express-serve-static-core" {
  interface Request {
    user?: any;
    userId?: number;
  }
}
export async function authMiddleware(req:Request, res:Response, next:NextFunction)
{
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
      return res.status(401).json({ message: "No token" });
    }
    const token = authHeader.split(" ")[1];
    if (!token) {
      return res.status(401).json({ message: "Invalid token format" });
    }
    const payload = await verifyToken(token, {
      secretKey: process.env.CLERK_SECRET_KEY,
    });

    const clerkId = String(payload.sub ?? "");
    if (!clerkId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const userResult = await pool.query<{ id: number }>(
      `SELECT id FROM users WHERE clerk_id = $1 LIMIT 1`,
      [clerkId]
    );

    const user = userResult.rows[0];
    if (!user) {
      return res.status(401).json({ message: "User not found" });
    }

    req.userId = user.id;
    req.user = payload;
    next();
  } catch (err: unknown) {
    console.error(err);
    return res.status(401).json({ message: "Unauthorized" });
  }
}