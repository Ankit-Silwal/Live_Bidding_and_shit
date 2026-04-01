import {pool} from "@shared/config"
import { redis } from "@shared/config"
import { Worker } from "bullmq"

new Worker(
  "auction-bids",
  async (job) =>
  {
    const { auctionId, userId, amount } = job.data;
    console.log(" Processing bid:", job.data);
    await pool.query(
      `INSERT INTO bids (auction_id, user_id, amount)
       VALUES ($1, $2, $3)`,
      [auctionId, userId, amount]
    );
  },
  {
    connection: redis
  }
);