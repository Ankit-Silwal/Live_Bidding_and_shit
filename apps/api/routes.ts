import type { Application } from "express";
import { requireAuth } from "@clerk/express"; //to protect endpoitn which requried auth
export function setUpRoutes(app:Application){
  app.get("/test",(req,res)=>{
    return res.status(200).json({
      success:"true ngok and shit"
    })
  })
}