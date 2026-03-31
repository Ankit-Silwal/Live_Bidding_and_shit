import { verifyToken } from "@clerk/backend";
import type { Request, Response, NextFunction } from "express";

// Extend Express Request type to include user
declare module "express-serve-static-core" {
  interface Request {
    user?: any;
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
    req.user = payload;
    next();
  } catch (err: any) {
    return res.status(401).json({ message: "Unauthorized" });
  }
}