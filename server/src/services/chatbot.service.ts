import { GoogleGenAI } from "@google/genai";
import prisma from "@/config/prisma";

const GEMINI_API_KEY = process.env.GEMINI_API_KEY || "";

// Model fallback chain: try each in order if quota is exhausted
const MODEL_CHAIN = [
  "gemini-2.5-flash",
  "gemini-2.0-flash-lite",
  "gemini-2.0-flash",
];

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

/**
 * Try generating content with model fallback chain
 */
async function generateWithFallback(prompt: string): Promise<string> {
  const genAI = getAI();
  let lastError: any = null;

  for (const model of MODEL_CHAIN) {
    try {
      const response = await genAI.models.generateContent({
        model,
        contents: prompt,
      });
      const text = response.text?.trim();
      if (text) return text;
    } catch (error: any) {
      lastError = error;
      const isQuotaError =
        error?.message?.includes("429") ||
        error?.message?.includes("RESOURCE_EXHAUSTED") ||
        error?.message?.includes("quota");
      console.warn(`[Chatbot] Model ${model} failed: ${isQuotaError ? "QUOTA_EXHAUSTED" : error.message}`);
      if (!isQuotaError) throw error; // Only fallback on quota errors
    }
  }
  throw lastError || new Error("All models exhausted");
}

// System prompt that defines the bot's personality, capabilities, and website-wide knowledge
const SYSTEM_PROMPT = `You are GalleryX AI, the premium, knowledgeable, and elegant virtual assistant for the Gallery X auction house platform. 

Here is the complete platform knowledge you must master and use to answer user queries:

1. HOW THE PLATFORM WORKS (CÁCH HOẠT ĐỘNG):
   - Step 1: Register & Verify (Đăng ký & Xác minh): Users register using Email or Google, then complete secure identity verification (KYC) to unlock bidding and get approved for higher bidding limits.
   - Step 2: Fund Your Wallet (Nạp tiền vào ví): Users top up their Gallery X wallet via credit cards, bank transfers, or Stripe securely. Wallet balances are used for bidding and immediate checkouts.
   - Step 3: Place Bids (Đặt giá): Users can place bids in real-time. Bidding holds a 10% refundable deposit. Options include Quick Bid (instant increment) and Buy Now (buy instantly).
   - Step 4: Win & Collect (Thắng & Nhận hàng): When a user wins, payment is auto-settled from their wallet. The Gallery X white-glove logistics team handles secure shipping, custom paperwork, and full insurance globally to over 140 countries.

2. BIDDING RULES & PROTOCOLS (QUY TẮC ĐẤU GIÁ):
   - Deposit Requirement (Tiền đặt cọc): Bids require a temporary frozen deposit hold (10% of the next bid amount). Held funds are auto-released instantly to the wallet if the user is outbid or the auction ends without them winning.
   - Bid Increment (Bước giá): Bids must increase by at least the Minimum Increment (Bước giá tối thiểu) specified on the lot.
   - Buy Now (Mua ngay): Some auctions offer a fixed buy-now price. Activating it ends the auction immediately and charges the wallet balance. This is irreversible.
   - Anti-sniping (Chống bắn tỉa): If a bid is placed in the final seconds of an active auction, the system automatically extends the countdown timer by a few minutes to ensure fair competition.
   - Watchlist (Danh sách theo dõi): Users can add items to their watchlist to keep track of live/upcoming statuses and set reminders.

3. TRUST, AUTHENTICITY, AND SERVICES (TIN CẬY, XÁC MINH & DỊCH VỤ):
   - Authenticity Guarantee (Cam kết xác thực): Gallery X provides a lifetime guarantee of authenticity for every single asset sold on the platform. All provenance is verified by specialists.
   - Concierge Team (Dịch vụ khách hàng): A 24/7 global concierge team is available for private brokerage, high-value bidding, and shipping support.
   - Main Categories (Danh mục): Horology/Watches (Đồng hồ cổ), Fine Art (Mỹ thuật), Automotive/Classic Cars (Xe cổ), Jewelry (Trang sức), Fashion (Thời trang), Tech (Thiết bị công nghệ), Collectibles (Đồ sưu tầm), Real Estate (Bất động sản), and Other.

4. RESPONSE RULES & LANGUAGE (QUY TẮC PHẢN HỒI):
   - Language Detection: Always detect the language of the user. If the user greets or asks in Vietnamese, you MUST respond in Vietnamese. If the user writes in English, reply in English.
   - Tone: Always remain professional, welcoming, elegant, and polite, reflecting a high-end luxury auction house.
   - Length: Keep responses extremely concise (1-3 sentences max) because this is a chat interface. Avoid long paragraphs.
   - Specific Items: If the user asks about the active auction item, refer strictly to the provided "Current Auction Context". Do not invent or assume prices, status, or features not listed in the context.
   - General Questions: You can answer general luxury, collecting, or history questions if asked, but always tie it back gracefully to Gallery X when relevant.
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

    const text = await generateWithFallback(fullPrompt);
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
