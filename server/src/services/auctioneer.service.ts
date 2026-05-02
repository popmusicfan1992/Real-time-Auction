import { Server } from "socket.io";
import prisma from "@/config/prisma";
import { generateBidAnnouncement } from "@/services/chatbot.service";

export async function handleAuctioneerBot(io: Server, auctionId: string, currentPrice: number | string, bidderName: string) {
  try {
    // Generate AI-powered bid announcement
    const announcement = await generateBidAnnouncement(auctionId, currentPrice, bidderName);

    const botMessage = {
      id: `bot_${Date.now()}`,
      user: "GalleryX AI",
      message: announcement,
      isBot: true,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    // 1. Save to Database
    await prisma.chatMessage.create({
      data: {
        auctionId: auctionId,
        sender: "GalleryX AI",
        message: announcement,
        isBot: true
      }
    });

    // 2. Broadcast to auction room
    io.to(auctionId).emit("new_message", botMessage);
  } catch (error) {
    console.error("Auctioneer Bot Error:", error);
  }
}
