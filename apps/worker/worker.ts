import {pool} from "@shared/config"
import { redis } from "@shared/config"
import { Worker } from "bullmq"

const worker=new Worker(
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

worker.on("completed",(job)=>{
  console.log(`JOb ${job.id} got completed`)
})

worker.on("failed",(job,err)=>{
  console.error(`Job ${job?.id} faled ${err.message}`)
})