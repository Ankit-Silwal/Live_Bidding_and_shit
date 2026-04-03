import type { Redis } from "ioredis";
import { pool } from "@shared/config";

export class AuctionManager{
  private readonly redis: Redis;

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

  async placeBid(auctionId:string,userId:number,amount:number){
    const key=`auction:${auctionId}`
    while (true){
      await this.redis.watch(key)
      const auction=await this.redis.hgetall(key)
      if(!auction || Object.keys(auction).length===0){
        await this.redis.unwatch();
        throw new Error("Auction not found sorry sir")
      }
      if(auction.status!=="active"){
        await this.redis.unwatch()
        throw new Error("Auction is not active sir")
      }
      const currentPrice=Number(auction.currentPrice)
      if(amount<=currentPrice){
        await this.redis.unwatch()
        throw new Error("Bid must be higher than the current price");
      }

      const userResult=await pool.query(`
        Select balance,locked_balance from users where id=$2`,[userId])

      if(userResult.rows.length===0){
        await this.redis.unwatch()
        throw new Error("User not found sir")
      }

      const balance=Number(userResult.rows[0].balance)
      const locked=Number(userResult.rows[0].locked_balance)
      const available=balance-locked;
      if(available<amount){
        await this.redis.unwatch()
        throw new Error("Insufficient balance sir")
      }

      const multi=this.redis.multi()
      multi.hset(key,{
        currentPrice:amount,
        highestBidder:userId
      })
      const result=await multi.exec()
      if(result===null){
        continue
      }
      return {
        auctionId,
        newPrice:amount,
        userId
      }
    }
  }
}