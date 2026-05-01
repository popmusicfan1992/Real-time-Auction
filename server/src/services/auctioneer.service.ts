import { Server } from "socket.io";
import prisma from "@/config/prisma";

export async function handleAuctioneerBot(io: Server, auctionId: string, currentPrice: number | string, bidderName: string) {
  // Các câu nói tạo không khí
  const phrases = [
    `🔥 Tuyệt vời! Giá đã được đẩy lên $${Number(currentPrice).toLocaleString()} bởi ${bidderName}!`,
    `🔨 $${Number(currentPrice).toLocaleString()}! Có ai muốn trả giá cao hơn không?`,
    `⚡ Mức giá mới: $${Number(currentPrice).toLocaleString()} từ ${bidderName}. Bầu không khí đang rất nóng!`,
    `👀 ${bidderName} vừa ra giá $${Number(currentPrice).toLocaleString()}. Đừng bỏ lỡ cơ hội này!`
  ];

  const randomPhrase = phrases[Math.floor(Math.random() * phrases.length)];

  const botMessage = {
    id: `bot_${Date.now()}`,
    user: "Auctioneer Bot",
    message: randomPhrase,
    isBot: true,
    time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  };

  // 1. Lưu vào Database
  await prisma.chatMessage.create({
    data: {
      auctionId: auctionId,
      sender: "Auctioneer Bot",
      message: randomPhrase,
      isBot: true
    }
  });

  // 2. Phát tới phòng đấu giá
  io.to(auctionId).emit("new_message", botMessage);
}
