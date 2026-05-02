"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.initializeSocket = initializeSocket;
const redis_1 = require("../config/redis");
const prisma_1 = __importDefault(require("../config/prisma"));
const auctioneer_service_1 = require("../services/auctioneer.service");
const chatbot_service_1 = require("../services/chatbot.service");
const auction_service_1 = require("../services/auction.service");
function initializeSocket(io) {
    // 1. Setup Redis Subscriber for Pub/Sub across instances
    redis_1.redisSubscriber.subscribe("auction_events");
    redis_1.redisSubscriber.on("message", (channel, message) => {
        if (channel === "auction_events") {
            const data = JSON.parse(message);
            // Broadcast events (new bids, chat, alerts) to specific auction room
            if (data.type === "NEW_BID") {
                io.to(data.auctionId).emit("new_bid", data.payload);
                // Trigger Auctioneer Bot asynchronously
                (0, auctioneer_service_1.handleAuctioneerBot)(io, data.auctionId, data.payload.newPrice, data.payload.bidderName);
            }
            else if (data.type === "OUTBID_ALERT") {
                // Send directly to the user who was outbid via their specific room/socket
                io.to(`user_${data.userId}`).emit("outbid_alert", data.payload);
            }
            else if (data.type === "AUCTION_ENDED") {
                io.to(data.auctionId).emit("auction_ended", data.payload);
            }
        }
    });
    // 2. Client Connection Handler
    io.on("connection", (socket) => {
        console.log(`🔌 Client connected: ${socket.id}`);
        // Join Auction Room
        socket.on("join_auction", async (auctionId, userId) => {
            socket.join(auctionId);
            if (userId) {
                socket.join(`user_${userId}`); // Join personal room for outbid alerts
            }
            // Update participants count
            const count = io.sockets.adapter.rooms.get(auctionId)?.size || 0;
            io.to(auctionId).emit("participant_count", { count });
        });
        // Handle Chat Messages
        socket.on("send_message", async (data) => {
            // Save user message to DB
            await prisma_1.default.chatMessage.create({
                data: {
                    auctionId: data.auctionId,
                    sender: data.user,
                    message: data.message,
                    isBot: false
                }
            });
            // Broadcast user message to room
            io.to(data.auctionId).emit("new_message", {
                id: Date.now(),
                user: data.user,
                message: data.message,
                isBot: false,
                time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
            });
            // Check if user is asking the AI bot (starts with @ai, @bot, or a question mark)
            const msg = data.message.trim().toLowerCase();
            const isAIQuery = msg.startsWith("@ai") || msg.startsWith("@bot") || msg.startsWith("?");
            if (isAIQuery) {
                // Strip the prefix to get the actual question
                const userQuestion = data.message
                    .replace(/^@ai\s*/i, "")
                    .replace(/^@bot\s*/i, "")
                    .replace(/^\?\s*/, "")
                    .trim();
                if (userQuestion.length > 0) {
                    // Show typing indicator
                    io.to(data.auctionId).emit("bot_typing", { isTyping: true });
                    try {
                        const aiResponse = await (0, chatbot_service_1.generateChatResponse)(userQuestion, data.auctionId, data.user);
                        const botMessage = {
                            id: `ai_${Date.now()}`,
                            user: "GalleryX AI",
                            message: aiResponse,
                            isBot: true,
                            time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                        };
                        // Save AI response to DB
                        await prisma_1.default.chatMessage.create({
                            data: {
                                auctionId: data.auctionId,
                                sender: "GalleryX AI",
                                message: aiResponse,
                                isBot: true
                            }
                        });
                        // Broadcast AI response
                        io.to(data.auctionId).emit("new_message", botMessage);
                    }
                    catch (err) {
                        console.error("AI Chat Error:", err);
                    }
                    finally {
                        io.to(data.auctionId).emit("bot_typing", { isTyping: false });
                    }
                }
            }
        });
        socket.on("disconnect", () => {
            console.log(`🔌 Client disconnected: ${socket.id}`);
        });
    });
    // 3. Global Countdown Sync (Cron loop)
    // Tự động bắn thời gian đồng bộ cho các phiên đang diễn ra mỗi giây
    setInterval(async () => {
        try {
            const now = new Date();
            // 1. Tự động chuyển các phiên SCHEDULED sang ACTIVE nếu đã đến startTime
            const scheduledAuctions = await prisma_1.default.auction.findMany({
                where: {
                    status: "SCHEDULED",
                    startTime: { lte: now }
                },
                select: { id: true }
            });
            if (scheduledAuctions.length > 0) {
                await prisma_1.default.auction.updateMany({
                    where: { id: { in: scheduledAuctions.map(a => a.id) } },
                    data: { status: "ACTIVE" }
                });
                console.log(`[Auction] Tự động chuyển ${scheduledAuctions.length} phiên sang ACTIVE`);
                // Có thể gửi socket event cho client refresh lại trang
            }
            // 2. Xử lý Countdown & Auto-Close cho các phiên ACTIVE
            const activeAuctions = await prisma_1.default.auction.findMany({
                where: { status: "ACTIVE" },
                select: { id: true, endTime: true }
            });
            const nowMs = now.getTime();
            for (const auction of activeAuctions) {
                const remainingMs = auction.endTime.getTime() - nowMs;
                // Nếu hết thời gian, tự động đóng phiên và nhả cọc
                if (remainingMs <= 0) {
                    await auction_service_1.AuctionService.closeAuction(auction.id);
                }
                else {
                    io.to(auction.id).emit("countdown_sync", {
                        auctionId: auction.id,
                        serverTime: nowMs,
                        remainingMs: remainingMs
                    });
                }
            }
        }
        catch (err) {
            console.error("Countdown Sync Error", err);
        }
    }, 1000);
}
