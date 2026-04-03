import type { Socket,Server } from "socket.io";
import { AuctionManager } from "../modules/auction/auction.manager.js";
import { redis } from "@shared/config";
import { bidQueue } from "../config/queue.js";
const auctionManager=new AuctionManager(redis);
export function registerAuctionHandlers(io:Server,socket:Socket){
   socket.on("join-auction", async ({ auctionId }) => {
    socket.join(String(auctionId));
    console.log(`User ${socket.id} joined the auction room: ${auctionId}`);

    // Send the most recent highest bid from Redis immediately when someone joins, 
    // so that page reloads don't show the old stale Postgres database price
    try {
      const liveState = await auctionManager.getLiveAuctionState(String(auctionId));
      if (liveState && liveState.currentPrice) {
        socket.emit("bid-update", {
          auctionId: String(auctionId),
          newPrice: Number(liveState.currentPrice),
          userId: liveState.highestBidder ? String(liveState.highestBidder) : ""
        });
      }
    } catch (err) {
      console.error("Failed to fetch live state on join:", err);
    }
   });

   socket.on("place-bid", async (data, callback) => {
    const { auctionId, userId, amount } = data;

    try {
      const result = await auctionManager.placeBid(
        auctionId,
        userId,
        amount
      );

      const jobId = `${auctionId}:${userId}:${amount}`;

      await bidQueue.add("store-bid", {
        auctionId,
        userId,
        amount
      }, {
        jobId,
        attempts: 3,
        backoff: {
          type: "exponential",
          delay: 1000
        }
      });

      const payload = {
        auctionId: String(auctionId),
        newPrice: Number(result.newPrice || amount),
        userId: String(userId)
      };

      console.log("EMITTING:", payload);

      io.to(String(auctionId)).emit("bid-update", payload);

      callback?.({ success: true });

    } catch (err) {
      callback?.({
        success: false,
        error: err instanceof Error ? err.message : "Unknown error"
      });
    }
   });
}

