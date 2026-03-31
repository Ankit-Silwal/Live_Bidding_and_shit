import express from "express";
import cors from "cors"
import { setUpRoutes } from "./routes.js";
import { clerkMiddleware } from "@clerk/express";
const app=express()
app.use(cors({
  origin:"*"
}))

app.use(express.json())
app.use(clerkMiddleware())  
setUpRoutes(app)

export default app;
