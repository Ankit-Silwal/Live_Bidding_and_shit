import express from "express";
import { syncUser, getUser } from "./auth.controller.js";
import { authMiddleware } from "../../middlewares/auth.middleware.js";
const router = express.Router();

router.post("/sync", authMiddleware, syncUser);
router.get("/users/:clerkId", getUser);

export default router;