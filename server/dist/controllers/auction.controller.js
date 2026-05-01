"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createAuction = exports.getAuctionById = exports.getAuctions = void 0;
const prisma_1 = __importDefault(require("@/config/prisma"));
// Get all active/upcoming auctions
const getAuctions = async (req, res) => {
    try {
        const status = req.query.status;
        const category = req.query.category;
        const filter = {};
        if (status)
            filter.status = status;
        if (category && category !== "All Categories")
            filter.category = category;
        const auctions = await prisma_1.default.auction.findMany({
            where: filter,
            orderBy: { endTime: "asc" },
            include: {
                _count: {
                    select: { bids: true }
                }
            }
        });
        res.json(auctions);
    }
    catch (error) {
        console.error("Error fetching auctions:", error);
        res.status(500).json({ message: "Failed to fetch auctions" });
    }
};
exports.getAuctions = getAuctions;
// Get single auction details
const getAuctionById = async (req, res) => {
    try {
        const { id } = req.params;
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
const cloudinary_1 = __importDefault(require("@/config/cloudinary"));
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
