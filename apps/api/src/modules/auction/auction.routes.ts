import express from "express";
import multer from "multer";
import { fillAuction } from "./auction.controller.js";

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage() });

router.post("/auctions", upload.single("image"), fillAuction);

export default router;
