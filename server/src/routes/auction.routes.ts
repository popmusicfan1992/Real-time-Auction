import { Router } from "express";
import { getAuctions, getAuctionById, getAuctionCounts, getChatMessages, createAuction } from "@/controllers/auction.controller";
import { authenticate, authorize } from "@/middleware/auth";
import { upload } from "@/middleware/upload";

const router = Router();

// Public routes
router.get("/", getAuctions);
router.get("/counts", getAuctionCounts);
router.get("/:id", getAuctionById);
router.get("/:id/chat", getChatMessages);

// Protected routes
router.post("/", authenticate, authorize(["ADMIN", "SELLER"]), upload.array("images", 5), createAuction);

export default router;
