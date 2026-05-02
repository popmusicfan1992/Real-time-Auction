"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.buyNow = exports.placeBid = void 0;
const bid_service_1 = require("@/services/bid.service");
const placeBid = async (req, res) => {
    try {
        const { auctionId, amount } = req.body;
        if (!req.user || !req.user.id) {
            return res.status(401).json({ message: "Unauthorized" });
        }
        if (!auctionId || !amount) {
            return res.status(400).json({ message: "Auction ID and amount are required" });
        }
        const bid = await bid_service_1.BiddingService.placeBid(req.user.id, auctionId, parseFloat(amount));
        res.status(201).json({
            message: "Bid placed successfully",
            bid,
        });
    }
    catch (error) {
        console.error("Error placing bid:", error.message);
        res.status(400).json({ message: error.message || "Failed to place bid" });
    }
};
exports.placeBid = placeBid;
const buyNow = async (req, res) => {
    try {
        const { auctionId } = req.body;
        if (!req.user || !req.user.id) {
            return res.status(401).json({ message: "Unauthorized" });
        }
        if (!auctionId) {
            return res.status(400).json({ message: "Auction ID is required" });
        }
        const result = await bid_service_1.BiddingService.buyNow(req.user.id, auctionId);
        res.status(200).json(result);
    }
    catch (error) {
        console.error("Error Buy Now:", error.message);
        res.status(400).json({ message: error.message || "Failed to process Buy Now" });
    }
};
exports.buyNow = buyNow;
