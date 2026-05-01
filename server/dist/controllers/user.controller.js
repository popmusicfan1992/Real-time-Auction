"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.toggleWatchlist = exports.getWatchlist = exports.getDashboardStats = void 0;
const prisma_1 = __importDefault(require("@/config/prisma"));
// Lấy thông tin thống kê tổng quan
const getDashboardStats = async (req, res) => {
    try {
        const userId = req.user.id;
        // 1. Số phiên đang tham gia (ACTIVE và có bid của mình)
        const activeParticipations = await prisma_1.default.auction.count({
            where: {
                status: "ACTIVE",
                bids: { some: { userId } }
            }
        });
        // 2. Thống kê thắng/thua (Dựa trên DepositHold được CHARGED hoặc RELEASED)
        // Hoặc kiểm tra xem kết thúc và giá cao nhất là của mình
        const endedParticipations = await prisma_1.default.auction.findMany({
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
            }
            else {
                lost++;
            }
        });
        // 3. Lịch sử giao dịch gần nhất
        const recentBids = await prisma_1.default.bid.findMany({
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
    }
    catch (error) {
        res.status(500).json({ message: error.message });
    }
};
exports.getDashboardStats = getDashboardStats;
// Quản lý Watchlist (Lấy danh sách)
const getWatchlist = async (req, res) => {
    try {
        const userId = req.user.id;
        const watchlist = await prisma_1.default.watchlist.findMany({
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
    }
    catch (error) {
        res.status(500).json({ message: error.message });
    }
};
exports.getWatchlist = getWatchlist;
// Quản lý Watchlist (Thêm / Xoá)
const toggleWatchlist = async (req, res) => {
    try {
        const userId = req.user.id;
        const { auctionId } = req.body;
        const existing = await prisma_1.default.watchlist.findUnique({
            where: { userId_auctionId: { userId, auctionId } }
        });
        if (existing) {
            await prisma_1.default.watchlist.delete({
                where: { id: existing.id }
            });
            res.json({ isWatched: false, message: "Removed from watchlist" });
        }
        else {
            await prisma_1.default.watchlist.create({
                data: { userId, auctionId }
            });
            res.json({ isWatched: true, message: "Added to watchlist" });
        }
    }
    catch (error) {
        res.status(500).json({ message: error.message });
    }
};
exports.toggleWatchlist = toggleWatchlist;
