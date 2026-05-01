import { Router } from "express";
import { placeBid } from "@/controllers/bid.controller";
import { authenticate } from "@/middleware/auth";

const router = Router();

// Protected route: Users must be logged in to bid
router.post("/", authenticate, placeBid);

export default router;
