import { Response } from "express";
import { AuthRequest } from "@/middleware/auth";
import prisma from "@/config/prisma";

// Lấy thông tin thống kê tổng quan
export const getDashboardStats = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user!.id;

    // 1. Số phiên đang tham gia (ACTIVE và có bid của mình)
    const activeParticipations = await prisma.auction.count({
      where: {
        status: "ACTIVE",
        bids: { some: { userId } }
      }
    });

    // 2. Thống kê thắng/thua (Dựa trên DepositHold được CHARGED hoặc RELEASED)
    // Hoặc kiểm tra xem kết thúc và giá cao nhất là của mình
    const endedParticipations = await prisma.auction.findMany({
      where: {
        status: "ENDED",
        bids: { some: { userId } }
      },
      include: {
        bids: {
          orderBy: { amount: "desc" },
          take: 1
        }
      }
    });

    let won = 0;
    let lost = 0;

    endedParticipations.forEach(auction => {
      const highestBid = auction.bids[0];
      if (highestBid && highestBid.userId === userId) {
        won++;
      } else {
        lost++;
      }
    });

    // 3. Lịch sử giao dịch gần nhất
    const recentBids = await prisma.bid.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
      take: 5,
      include: { auction: { select: { title: true, images: true, status: true, endTime: true } } }
    });

    res.json({
      activeParticipations,
      won,
      lost,
      recentBids
    });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

// Quản lý Watchlist (Lấy danh sách)
export const getWatchlist = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user!.id;
    const watchlist = await prisma.watchlist.findMany({
      where: { userId },
      include: {
        auction: {
          select: {
            id: true, title: true, currentPrice: true, images: true, status: true, endTime: true
          }
        }
      },
      orderBy: { createdAt: "desc" }
    });
    res.json(watchlist);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

// Quản lý Watchlist (Thêm / Xoá)
export const toggleWatchlist = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user!.id;
    const { auctionId } = req.body;

    const existing = await prisma.watchlist.findFirst({
      where: { userId, auctionId }
    });

    if (existing) {
      await prisma.watchlist.delete({
        where: { id: existing.id }
      });
      res.json({ isWatched: false, message: "Removed from watchlist" });
    } else {
      await prisma.watchlist.create({
        data: { userId, auctionId }
      });
      res.json({ isWatched: true, message: "Added to watchlist" });
    }
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

// Lấy thông tin Profile
export const getMyProfile = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user!.id;
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, name: true, email: true, avatar: true, phone: true, address: true, role: true, createdAt: true }
    });
    if (!user) return res.status(404).json({ message: "User not found" });
    res.json(user);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

// Cập nhật Profile
export const updateMyProfile = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user!.id;
    const { name, phone, address } = req.body;
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: { name, phone, address },
      select: { id: true, name: true, email: true, avatar: true, phone: true, address: true, role: true }
    });
    res.json(updatedUser);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

// Lấy danh sách Auction của Seller
export const getMyAuctions = async (req: AuthRequest, res: Response) => {
  try {
    const sellerId = req.user!.id;
    const auctions = await prisma.auction.findMany({
      where: { sellerId },
      orderBy: { createdAt: "desc" },
      include: { _count: { select: { bids: true } } }
    });
    res.json(auctions);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

