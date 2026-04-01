import type { Application } from "express";
import authRoutes from "./src/modules/auth/auth.routes.js";
import auctionRoutes from "./src/modules/auction/auction.routes.js";
export function setUpRoutes(app:Application){
  app.use("/api",authRoutes);
  app.use("/api",auctionRoutes);
  app.get("/test",(req,res)=>{
    return res.status(200).json({
      success:"true"
    })
  })
}