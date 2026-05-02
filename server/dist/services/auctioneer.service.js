"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.handleAuctioneerBot = handleAuctioneerBot;
const prisma_1 = __importDefault(require("@/config/prisma"));
const chatbot_service_1 = require("@/services/chatbot.service");
async function handleAuctioneerBot(io, auctionId, currentPrice, bidderName) {
    try {
        // Generate AI-powered bid announcement
        const announcement = await (0, chatbot_service_1.generateBidAnnouncement)(auctionId, currentPrice, bidderName);
        const botMessage = {
            id: `bot_${Date.now()}`,
            user: "GalleryX AI",
            message: announcement,
            isBot: true,
            time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        };
        // 1. Save to Database
        await prisma_1.default.chatMessage.create({
            data: {
                auctionId: auctionId,
                sender: "GalleryX AI",
                message: announcement,
                isBot: true
            }
        });
        // 2. Broadcast to auction room
        io.to(auctionId).emit("new_message", botMessage);
    }
    catch (error) {
        console.error("Auctioneer Bot Error:", error);
    }
}
