"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateChatResponse = generateChatResponse;
exports.generateBidAnnouncement = generateBidAnnouncement;
const genai_1 = require("@google/genai");
const prisma_1 = __importDefault(require("@/config/prisma"));
const GEMINI_API_KEY = process.env.GEMINI_API_KEY || "";
// Model fallback chain: try each in order if quota is exhausted
const MODEL_CHAIN = [
    "gemini-2.0-flash-lite",
    "gemini-2.0-flash",
    "gemini-1.5-flash",
];
let ai = null;
function getAI() {
    if (!ai) {
        if (!GEMINI_API_KEY) {
            throw new Error("GEMINI_API_KEY is not configured");
        }
        ai = new genai_1.GoogleGenAI({ apiKey: GEMINI_API_KEY });
    }
    return ai;
}
/**
 * Try generating content with model fallback chain
 */
async function generateWithFallback(prompt) {
    const genAI = getAI();
    let lastError = null;
    for (const model of MODEL_CHAIN) {
        try {
            const response = await genAI.models.generateContent({
                model,
                contents: prompt,
            });
            const text = response.text?.trim();
            if (text)
                return text;
        }
        catch (error) {
            lastError = error;
            const isQuotaError = error?.message?.includes("429") ||
                error?.message?.includes("RESOURCE_EXHAUSTED") ||
                error?.message?.includes("quota");
            console.warn(`[Chatbot] Model ${model} failed: ${isQuotaError ? "QUOTA_EXHAUSTED" : error.message}`);
            if (!isQuotaError)
                throw error; // Only fallback on quota errors
        }
    }
    throw lastError || new Error("All models exhausted");
}
// System prompt that defines the bot's personality and capabilities
const SYSTEM_PROMPT = `You are GalleryX AI, a premium auction assistant for the Gallery X auction platform. You help users with:
- Understanding how bidding works (bid increments, deposits, Buy Now, etc.)
- Providing information about auction items when asked
- Answering questions about the platform (wallet, deposits, notifications)
- Creating an exciting atmosphere during live auctions
- General knowledge questions users may have

Rules:
- Always respond in English by default
- Keep responses concise (1-3 sentences max) since this is a live chat
- Be friendly, professional, and enthusiastic about auctions
- Use emojis sparingly for emphasis (1-2 per message max)
- If asked about a specific auction item, use the context provided
- Never make up prices or bid information — use only what's provided in context
- If you don't know something specific about an auction, say so politely
- You can answer general knowledge questions beyond just auctions
`;
/**
 * Generate an AI response to a user's chat message
 */
async function generateChatResponse(userMessage, auctionId, userName) {
    try {
        // Get auction context for the AI
        const auction = await prisma_1.default.auction.findUnique({
            where: { id: auctionId },
            select: {
                title: true,
                description: true,
                category: true,
                currentPrice: true,
                startingPrice: true,
                buyNowPrice: true,
                minIncrement: true,
                status: true,
                endTime: true,
                seller: { select: { name: true } },
                _count: { select: { bids: true } },
            },
        });
        // Get recent chat history for context (last 5 messages)
        const recentMessages = await prisma_1.default.chatMessage.findMany({
            where: { auctionId },
            orderBy: { createdAt: "desc" },
            take: 5,
        });
        const chatHistory = recentMessages
            .reverse()
            .map((m) => `${m.sender}: ${m.message}`)
            .join("\n");
        const auctionContext = auction
            ? `
Current Auction Context:
- Item: ${auction.title}
- Description: ${auction.description}
- Category: ${auction.category}
- Current Price: $${auction.currentPrice.toString()}
- Starting Price: $${auction.startingPrice.toString()}
- Buy Now Price: ${auction.buyNowPrice ? "$" + auction.buyNowPrice.toString() : "Not available"}
- Min Bid Increment: $${auction.minIncrement.toString()}
- Status: ${auction.status}
- Total Bids: ${auction._count.bids}
- Seller: ${auction.seller.name}
- Ends: ${auction.endTime.toISOString()}
`
            : "No auction context available.";
        const fullPrompt = `${SYSTEM_PROMPT}

${auctionContext}

Recent Chat:
${chatHistory}

User "${userName}" says: "${userMessage}"

Respond helpfully and concisely:`;
        const text = await generateWithFallback(fullPrompt);
        if (!text)
            return "I'm having trouble processing that. Could you try again?";
        return text;
    }
    catch (error) {
        console.error("Chatbot AI Error:", error.message);
        // Graceful fallback responses
        const fallbacks = [
            "I'm currently experiencing high demand. Please try again in a moment! 🙏",
            "Sorry, I couldn't process that right now. Feel free to ask again!",
            "My AI brain needs a quick reboot. Try your question again! 🔄",
        ];
        return fallbacks[Math.floor(Math.random() * fallbacks.length)];
    }
}
/**
 * Generate a bid announcement message using AI
 */
async function generateBidAnnouncement(auctionId, currentPrice, bidderName) {
    try {
        const prompt = `You are an enthusiastic auction announcer for Gallery X, a premium auction house. 
A new bid just came in. Generate a SHORT, exciting one-line announcement in English.
Use 1 emoji at the start. Keep it under 15 words.

Bidder: ${bidderName}
New Price: $${Number(currentPrice).toLocaleString()}

Example formats:
"🔥 ${bidderName} raises the stakes to $${Number(currentPrice).toLocaleString()}! Who's next?"
"⚡ New bid! $${Number(currentPrice).toLocaleString()} from ${bidderName} — the heat is on!"

Generate ONE announcement:`;
        const text = await generateWithFallback(prompt);
        // Remove any quotes the model might add
        return text.replace(/^["']|["']$/g, "");
    }
    catch (error) {
        // Fallback to template-based messages if AI fails
        const phrases = [
            `🔥 ${bidderName} bids $${Number(currentPrice).toLocaleString()}! The competition heats up!`,
            `⚡ New bid: $${Number(currentPrice).toLocaleString()} from ${bidderName}. Who will go higher?`,
            `🔨 $${Number(currentPrice).toLocaleString()} on the board! ${bidderName} takes the lead!`,
            `👀 ${bidderName} pushes to $${Number(currentPrice).toLocaleString()}. Don't miss your chance!`,
        ];
        return phrases[Math.floor(Math.random() * phrases.length)];
    }
}
