import { GoogleGenAI } from "@google/genai";
import prisma from "@/config/prisma";

const GEMINI_API_KEY = process.env.GEMINI_API_KEY || "";

let ai: GoogleGenAI | null = null;

function getAI(): GoogleGenAI {
  if (!ai) {
    if (!GEMINI_API_KEY) {
      throw new Error("GEMINI_API_KEY is not configured");
    }
    ai = new GoogleGenAI({ apiKey: GEMINI_API_KEY });
  }
  return ai;
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
export async function generateChatResponse(
  userMessage: string,
  auctionId: string,
  userName: string
): Promise<string> {
  try {
    // Get auction context for the AI
    const auction = await prisma.auction.findUnique({
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
    const recentMessages = await prisma.chatMessage.findMany({
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

    const genAI = getAI();
    const response = await genAI.models.generateContent({
      model: "gemini-2.0-flash",
      contents: fullPrompt,
    });

    const text = response.text?.trim();
    if (!text) return "I'm having trouble processing that. Could you try again?";

    return text;
  } catch (error: any) {
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
export async function generateBidAnnouncement(
  auctionId: string,
  currentPrice: number | string,
  bidderName: string
): Promise<string> {
  try {
    const genAI = getAI();

    const prompt = `You are an enthusiastic auction announcer for Gallery X, a premium auction house. 
A new bid just came in. Generate a SHORT, exciting one-line announcement in English.
Use 1 emoji at the start. Keep it under 15 words.

Bidder: ${bidderName}
New Price: $${Number(currentPrice).toLocaleString()}

Example formats:
"🔥 ${bidderName} raises the stakes to $${Number(currentPrice).toLocaleString()}! Who's next?"
"⚡ New bid! $${Number(currentPrice).toLocaleString()} from ${bidderName} — the heat is on!"

Generate ONE announcement:`;

    const response = await genAI.models.generateContent({
      model: "gemini-2.0-flash",
      contents: prompt,
    });

    const text = response.text?.trim();
    if (!text) throw new Error("Empty response");

    // Remove any quotes the model might add
    return text.replace(/^["']|["']$/g, "");
  } catch (error) {
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
