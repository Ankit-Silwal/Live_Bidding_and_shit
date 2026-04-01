import type { Request, Response } from "express";
import type { FillAuctionInput } from "./auction.types.js";
import { fillAuctionService } from "./auction.service.js";

export async function fillAuction(req: Request<{}, {}, FillAuctionInput>, res: Response) {
  const result = await fillAuctionService(req.body, req.file);

  return res.status(201).json({
    success: true,
    message: "Auction created successfully",
    data: result.id,
    imageUrl: result.imageUrl,
  });
}