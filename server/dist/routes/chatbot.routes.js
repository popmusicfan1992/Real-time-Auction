"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const chatbot_service_1 = require("../services/chatbot.service");
const router = (0, express_1.Router)();
router.post("/", async (req, res) => {
    try {
        const { message, auctionId, userName } = req.body;
        const aiResponse = await (0, chatbot_service_1.generateChatResponse)(message, auctionId || "general", userName || "Guest");
        res.json({ message: aiResponse });
    }
    catch (error) {
        console.error("General Chatbot Endpoint Error:", error);
        res.status(500).json({ message: "Failed to generate chatbot response" });
    }
});
exports.default = router;
