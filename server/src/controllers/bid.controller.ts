import { Response } from "express";
import { AuthRequest } from "@/middleware/auth";
import { BiddingService } from "@/services/bid.service";

export const placeBid = async (req: AuthRequest, res: Response) => {
  try {
    const { auctionId, amount } = req.body;

    if (!req.user || !req.user.id) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    if (!auctionId || !amount) {
      return res.status(400).json({ message: "Auction ID and amount are required" });
    }

    const bid = await BiddingService.placeBid(req.user.id, auctionId, parseFloat(amount));
    
    res.status(201).json({
      message: "Bid placed successfully",
      bid,
    });
  } catch (error: any) {
    console.error("Error placing bid:", error.message);
    res.status(400).json({ message: error.message || "Failed to place bid" });
  }
};
