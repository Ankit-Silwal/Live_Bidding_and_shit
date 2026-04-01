import { Queue } from "bullmq";
import { redis } from "@shared/config";

export const bidQueue=new Queue("auction-bids",{
  connection:redis
})
