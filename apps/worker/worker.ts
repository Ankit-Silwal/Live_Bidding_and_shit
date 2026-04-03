import { pool, redis } from "@shared/config"
import { Worker } from "bullmq"

const worker = new Worker(
  "auction-bids",
  async (job) => {
    if (job.name === "end-auction") {
      const { auctionId } = job.data;

      const auction = await redis.hgetall(`auction:${auctionId}`);

      if (!auction || Object.keys(auction).length === 0) {
        console.log("Auction not found in Redis");
        return;
      }

      const winner = auction.highestBidder;
      const finalPrice = Number(auction.currentPrice);

      await pool.query(
        `UPDATE auctions SET status='ended' WHERE id=$1`,
        [auctionId]
      );

      if (winner) {
        await pool.query(
          `UPDATE users 
           SET balance = balance - $1,
               locked_balance = locked_balance - $1
           WHERE id = $2`,
          [finalPrice, winner]
        );
      }

      await redis.hset(`auction:${auctionId}`, { status: "ended" });

      console.log(`Auction ended ${auctionId}`);
      return;
    }

    if (job.name === "store-bid") {
      const { auctionId, userId, amount } = job.data;

      console.log("Processing bid:", job.data);

      await pool.query(
        `INSERT INTO bids (auction_id, user_id, amount)
         VALUES ($1, $2, $3)
         ON CONFLICT DO NOTHING`,
        [auctionId, userId, amount]
      );

      return;
    }
  },
  {
    connection: redis
  }
);

worker.on("completed", (job) => {
  console.log(`Job ${job.id} completed`);
});

worker.on("failed", (job, err) => {
  console.error(`Job ${job?.id} failed ${err.message}`);
});