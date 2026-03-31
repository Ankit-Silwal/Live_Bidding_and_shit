import {Redis} from "ioredis";

export const redis=new Redis(process.env.REDIS_URL!)

redis.on("connect",()=>{
  console.log("coneected to the redis")
})

redis.on("error",()=>{
  console.log("Error connecting to the redis sir")
})