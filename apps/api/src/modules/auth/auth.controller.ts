import { upsertUser, getUserByClerkId } from "./auth.service.js";
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

export async function getUser(req: Request, res: Response) {
  try {
    const { clerkId } = req.params;
    if (!clerkId) return res.status(400).json({ success: false, message: "Missing clerkId" });

    const user = await getUserByClerkId(clerkId);
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    return res.json({ success: true, data: user });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ success: false, message: "Failed to fetch user" });
  }
}