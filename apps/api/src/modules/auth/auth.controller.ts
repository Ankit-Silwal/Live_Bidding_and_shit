import { upsertUser } from "./auth.service.js";
import type { Request,Response } from "express";
export async function syncUser(req:Request, res:Response)
{
  try
  {
    const { clerkId, email, username, profileImage } = req.body;

    const user = await upsertUser({
      clerkId,
      email,
      username,
      profileImage,
    });

    return res.json(user);
  }
  catch (err)
  {
    console.error(err);
    return res.status(500).json({ message: "Failed to sync user" });
  }
}