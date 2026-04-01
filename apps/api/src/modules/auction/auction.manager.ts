import type { Redis } from "ioredis";

export class AuctionManager{
  private redis: Redis;

  constructor(redis: Redis){
    this.redis = redis;
  }
  async placeBid(auctionId:string,userId:string,amount:number){
    const key=`auction:${auctionId}`
    const auction = await this.redis.hgetall(key);

    if(!auction || Object.keys(auction).length===0){
      throw new Error("Auction not found sir")
    }
    if(auction.status!="active"){
      throw new Error("The auction isnt active now")
    }

    const currentPrice=Number(auction.currentPrice)
    if(amount<=currentPrice){
      throw new Error("Bid must be highter than the current price sir ")
    }

    await this.redis.hset(key,{
      currentPrice:amount,
      highesetBidder:userId
    })
    return{
      auctionId,
      newPrice:amount,
      userId
    }
  }
}