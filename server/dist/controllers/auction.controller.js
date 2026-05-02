"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createAuction = exports.getHomeStats = exports.getChatMessages = exports.getAuctionById = exports.getAuctionCounts = exports.getAuctions = void 0;
const prisma_1 = __importDefault(require("@/config/prisma"));
// Get all auctions with filters
const getAuctions = async (req, res) => {
    try {
        const status = req.query.status;
        const category = req.query.category;
        const tab = req.query.tab;
        const filter = {};
        // Filter by tab: live = ACTIVE, upcoming = SCHEDULED
        if (tab === "live") {
            filter.status = "ACTIVE";
        }
        else if (tab === "upcoming") {
            filter.status = "SCHEDULED";
        }
        else if (status) {
            // Support multiple statuses: ?status=ACTIVE,SCHEDULED
            const statuses = status.split(",").map((s) => s.trim());
            if (statuses.length === 1) {
                filter.status = statuses[0];
            }
            else {
                filter.status = { in: statuses };
            }
        }
        // Filter by category
        if (category && category !== "ALL") {
            filter.category = category;
        }
        const auctions = await prisma_1.default.auction.findMany({
            where: filter,
            orderBy: { endTime: "asc" },
            include: {
                seller: {
                    select: { name: true, avatar: true },
                },
                _count: {
                    select: { bids: true },
                },
            },
        });
        res.json(auctions);
    }
    catch (error) {
        console.error("Error fetching auctions:", error);
        res.status(500).json({ message: "Failed to fetch auctions" });
    }
};
exports.getAuctions = getAuctions;
// Get auction counts grouped by category and status
const getAuctionCounts = async (req, res) => {
    try {
        // Count by category
        const categoryCounts = await prisma_1.default.auction.groupBy({
            by: ["category"],
            _count: { id: true },
            where: {
                status: { in: ["ACTIVE", "SCHEDULED"] },
            },
        });
        // Count by status
        const statusCounts = await prisma_1.default.auction.groupBy({
            by: ["status"],
            _count: { id: true },
        });
        // Total count
        const totalCount = await prisma_1.default.auction.count({
            where: {
                status: { in: ["ACTIVE", "SCHEDULED"] },
            },
        });
        res.json({
            total: totalCount,
            byCategory: categoryCounts.map((c) => ({
                category: c.category,
                count: c._count.id,
            })),
            byStatus: statusCounts.map((s) => ({
                status: s.status,
                count: s._count.id,
            })),
        });
    }
    catch (error) {
        console.error("Error fetching auction counts:", error);
        res.status(500).json({ message: "Failed to fetch auction counts" });
    }
};
exports.getAuctionCounts = getAuctionCounts;
// Get single auction details
const getAuctionById = async (req, res) => {
    try {
        const id = req.params.id;
        const auction = await prisma_1.default.auction.findUnique({
            where: { id },
            include: {
                seller: {
                    select: { name: true, avatar: true, id: true }
                },
                bids: {
                    orderBy: { amount: "desc" },
                    take: 10,
                    include: {
                        user: {
                            select: { name: true, avatar: true }
                        }
                    }
                }
            }
        });
        if (!auction) {
            return res.status(404).json({ message: "Auction not found" });
        }
        res.json(auction);
    }
    catch (error) {
        console.error("Error fetching auction details:", error);
        res.status(500).json({ message: "Failed to fetch auction details" });
    }
};
exports.getAuctionById = getAuctionById;
// Get chat messages for an auction
const getChatMessages = async (req, res) => {
    try {
        const auctionId = req.params.id;
        const messages = await prisma_1.default.chatMessage.findMany({
            where: { auctionId },
            orderBy: { createdAt: "asc" },
            take: 50
        });
        res.json(messages);
    }
    catch (error) {
        console.error("Error fetching chat messages:", error);
        res.status(500).json({ message: "Failed to fetch chat messages" });
    }
};
exports.getChatMessages = getChatMessages;
const cloudinary_1 = __importDefault(require("@/config/cloudinary"));
// Get homepage stats (public)
const getHomeStats = async (req, res) => {
    try {
        // Run all independent queries in parallel for faster response
        const [totalBids, volumeResult, activeBidders, recentBids, endedAuctions] = await Promise.all([
            // Total bids count
            prisma_1.default.bid.count(),
            // Total volume (sum of all bids)
            prisma_1.default.bid.aggregate({
                _sum: { amount: true },
            }),
            // Active bidders (unique users who placed bids on ACTIVE auctions)
            prisma_1.default.bid.findMany({
                where: { auction: { status: "ACTIVE" } },
                select: { userId: true },
                distinct: ["userId"],
            }),
            // Recent bids (last 10 for live ticker)
            prisma_1.default.bid.findMany({
                orderBy: { createdAt: "desc" },
                take: 10,
                include: {
                    user: { select: { name: true, avatar: true } },
                    auction: { select: { title: true } },
                },
            }),
            // Ended auctions for top collectors
            prisma_1.default.auction.findMany({
                where: { status: "ENDED" },
                include: {
                    bids: {
                        orderBy: { amount: "desc" },
                        take: 1,
                        include: { user: { select: { id: true, name: true, avatar: true } } },
                    },
                },
            }),
        ]);
        const totalVolume = volumeResult._sum.amount ? Number(volumeResult._sum.amount) : 0;
        // Aggregate wins and total spent per user
        const collectorMap = new Map();
        for (const auction of endedAuctions) {
            const winningBid = auction.bids[0];
            if (winningBid) {
                const existing = collectorMap.get(winningBid.userId);
                if (existing) {
                    existing.totalWins++;
                    existing.totalSpent += Number(winningBid.amount);
                }
                else {
                    collectorMap.set(winningBid.userId, {
                        name: winningBid.user.name,
                        avatar: winningBid.user.avatar,
                        totalWins: 1,
                        totalSpent: Number(winningBid.amount),
                    });
                }
            }
        }
        const topCollectors = Array.from(collectorMap.values())
            .sort((a, b) => b.totalWins - a.totalWins || b.totalSpent - a.totalSpent)
            .slice(0, 5);
        res.json({
            totalBids,
            totalVolume,
            activeBidders: activeBidders.length,
            recentBids: recentBids.map((b) => ({
                userName: b.user.name,
                userAvatar: b.user.avatar,
                amount: Number(b.amount),
                auctionTitle: b.auction.title,
                createdAt: b.createdAt,
            })),
            topCollectors,
        });
    }
    catch (error) {
        console.error("Error fetching home stats:", error);
        res.status(500).json({ message: "Failed to fetch home stats" });
    }
};
exports.getHomeStats = getHomeStats;
// Create a new auction (Seller/Admin only)
const createAuction = async (req, res) => {
    try {
        const { title, description, category, startPrice, minIncrement, depositAmount, startTime, endTime } = req.body;
        if (!req.user || !req.user.id) {
            return res.status(401).json({ message: "Unauthorized" });
        }
        // 1. Kiểm tra ảnh gửi lên
        const files = req.files;
        if (!files || files.length === 0) {
            return res.status(400).json({ message: "At least one image is required." });
        }
        // 2. Upload từng ảnh lên Cloudinary
        const uploadPromises = files.map((file) => {
            return new Promise((resolve, reject) => {
                const stream = cloudinary_1.default.uploader.upload_stream({ folder: "galleryx/auctions" }, (error, result) => {
                    if (error)
                        return reject(error);
                    resolve(result.secure_url);
                });
                stream.end(file.buffer);
            });
        });
        const imageUrls = await Promise.all(uploadPromises);
        // 3. Lưu vào Database
        const newAuction = await prisma_1.default.auction.create({
            data: {
                title,
                description,
                category,
                images: imageUrls,
                startingPrice: parseFloat(startPrice),
                currentPrice: parseFloat(startPrice),
                minIncrement: parseFloat(minIncrement),
                depositAmount: parseFloat(depositAmount || (parseFloat(startPrice) * 0.1).toString()),
                startTime: new Date(startTime),
                endTime: new Date(endTime),
                status: "SCHEDULED", // Mặc định là sắp diễn ra
                sellerId: req.user.id
            }
        });
        res.status(201).json(newAuction);
    }
    catch (error) {
        console.error("Error creating auction:", error);
        res.status(500).json({ message: error.message || "Failed to create auction" });
    }
};
exports.createAuction = createAuction;
