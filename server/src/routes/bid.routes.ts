import { Router } from "express";
import { placeBid, buyNow } from "@/controllers/bid.controller";
import { authenticate } from "@/middleware/auth";

const router = Router();

// Protected routes: Users must be logged in
router.post("/", authenticate, placeBid);
router.post("/buy-now", authenticate, buyNow);

export default router;
