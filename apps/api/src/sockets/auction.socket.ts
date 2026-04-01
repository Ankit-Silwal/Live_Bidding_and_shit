import type { Socket,Server } from "socket.io";
import { AuctionManager } from "../modules/auction/auction.manager.js";
import { redis } from "../config/redis.js";
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

