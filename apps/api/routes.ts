import type { Application } from "express";
import { requireAuth } from "@clerk/express"; //to protect endpoitn which requried auth
import authRoutes from "./src/modules/auth/auth.routes.js";
export function setUpRoutes(app:Application){
  app.use("/api",authRoutes);
  app.get("/test",(req,res)=>{
    return res.status(200).json({
      success:"true"
    })
  })
}