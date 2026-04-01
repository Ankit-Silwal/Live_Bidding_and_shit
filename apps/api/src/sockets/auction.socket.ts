import type { Socket,Server } from "socket.io";
export function registerAuctionHandlers(io:Server,socket:Socket){
   socket.on("join-auction",(auctionId)=>{
    socket.join(auctionId)
    console.log(`User ${socket.id} joined the auction ${auctionId}`)
   })
}