import type { Socket,Server } from "socket.io";
import { AuctionManager } from "../modules/auction/auction.manager.js";
import { redis } from "@shared/config";
import { bidQueue } from "../config/queue.js";
const auctionManager=new AuctionManager(redis);
export function registerAuctionHandlers(io:Server,socket:Socket){
   socket.on("join-auction",(auctionId)=>{
    socket.join(auctionId)
    console.log(`User ${socket.id} joined the auction ${auctionId}`)
   })
   socket.on("place-bid",async (data,callback)=>{
    const {auctionId,userId,amount}=data;

    try{
      const result=await auctionManager.placeBid(
        auctionId,
        userId,
        amount
      )
      const jobId=`${auctionId}:${userId}:${amount}`
      await bidQueue.add("store-bid",{
        auctionId,
        userId,
        amount
      },{
        jobId,
        attempts:3,
        backoff:{
          type:"exponential",
          delay:1000
        }
      })
      io.to(auctionId).emit("bid-update",result)
      callback?.({success:true,data:result})
    }catch(err){
      callback?.({
        success:false,
        error:err instanceof Error ? err.message : "Unknown error"
      })
    }
   })
}

