import type { Request, Response } from "express";
import type { FillAuction } from "./auction.types.js";
import { fillAuctionService } from "./auction.service.js";

export async function fillAuction(req: Request<{}, {}, FillAuction>, res: Response) {
  const result = await fillAuctionService(req.body);

  return res.status(201).json({
    success: true,
    message: "Auction created successfully",
    data: result.id,
    signedUrl: result.signedUrl,
  });
}