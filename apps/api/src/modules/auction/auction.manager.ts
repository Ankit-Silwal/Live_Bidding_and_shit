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

  private async getAuctionState(key:string){
    const auction=await this.redis.hgetall(key)
    if(!auction || Object.keys(auction).length===0){
      throw new Error("Auction not found")
    }
    if(auction.status!=="active"){
      throw new Error("Auction is not active")
    }

    const currentPrice=Number(auction.currentPrice)
    if(!Number.isFinite(currentPrice)){
      throw new TypeError("Invalid auction price")
    }

    const previousHighestBidder = auction.highestBidder ? Number(auction.highestBidder) : null

    return { currentPrice, previousHighestBidder }
  }

  private async getUserAvailableBalance(userId:number){
    const userResult=await pool.query(
      `SELECT balance, locked_balance FROM users WHERE id = $1`,
      [userId]
    )

    if(userResult.rows.length===0){
      throw new Error("User not found")
    }

    const balance=Number(userResult.rows[0].balance)
    const locked=Number(userResult.rows[0].locked_balance)
    return balance-locked
  }

  private async updateLockedBalances(previousHighestBidder:number|null,currentPrice:number,bidAmount:number,userId:number){
    const client=await pool.connect()
    try{
      await client.query("BEGIN")

      if(previousHighestBidder!==null && previousHighestBidder===userId){
        await client.query(
          `UPDATE users
           SET locked_balance = locked_balance - $1 + $2
           WHERE id = $3`,
          [currentPrice, bidAmount, userId]
        )
      }else{
        if(previousHighestBidder!==null){
          await client.query(
            `UPDATE users
             SET locked_balance = locked_balance - $1
             WHERE id = $2`,
            [currentPrice, previousHighestBidder]
          )
        }

        await client.query(
          `UPDATE users
           SET locked_balance = locked_balance + $1
           WHERE id = $2`,
          [bidAmount, userId]
        )
      }

      await client.query("COMMIT")
    }catch(error){
      await client.query("ROLLBACK")
      throw error
    }finally{
      client.release()
    }
  }

  async placeBid(auctionId:string,userId:number,amount:number){
    const key=`auction:${auctionId}`
    const bidAmount=Number(amount)

    while (true){
      await this.redis.watch(key)

      try {
        const { currentPrice, previousHighestBidder } = await this.getAuctionState(key)
        if(bidAmount<=currentPrice){
          throw new Error("Bid must be higher than the current price")
        }

        const available=await this.getUserAvailableBalance(userId)
        if(available<bidAmount){
          throw new Error("Insufficient balance")
        }

        const multi=this.redis.multi()
        multi.hset(key,{
          currentPrice:String(bidAmount),
          highestBidder:String(userId)
        })
        const result=await multi.exec()
        if(result===null){
          continue
        }

        await this.updateLockedBalances(previousHighestBidder,currentPrice,bidAmount,userId)

        return {
          auctionId,
          newPrice:bidAmount,
          userId
        }
      } finally {
        await this.redis.unwatch()
      }
    }
  }
}