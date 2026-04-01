import type { Redis } from "ioredis";
import { pool } from "../../config/db.js";
export class AuctionManager{
  private redis: Redis;

  constructor(redis: Redis){
    this.redis = redis;
  }

  async loadAuctionIntoRedis(auctionId:string){
    const result=await pool.query(
      `Select * from auctions where id=$1`,
      [auctionId]
    )
    if(result.rows.length===0){
      throw new Error("Auction wasnt found sir")
    }
    const auction=result.rows[0];
    const key=`auction:${auctionId}`
    await this.redis.hset(key,{
      currentPrice:auction.start_price,
      highestBidder:"",
      status:"active"
    })

    return {
      message:"Auction loaded into the Rediss",
      auctionId
    }
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