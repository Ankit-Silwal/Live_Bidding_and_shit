import express from "express";
import { fillAuction } from "./auction.controller.js";

const router = express.Router();

router.post("/auctions", fillAuction);

export default router;
