import { Request, Response } from "express";
import prisma from "@/config/prisma";
import { AuthRequest } from "@/middleware/auth";

// Get all auctions with filters
export const getAuctions = async (req: Request, res: Response) => {
  try {
    const status = req.query.status as string | undefined;
    const category = req.query.category as string | undefined;
    const tab = req.query.tab as string | undefined;

    const filter: any = {};

    // Filter by tab: live = ACTIVE, upcoming = SCHEDULED
    if (tab === "live") {
      filter.status = "ACTIVE";
    } else if (tab === "upcoming") {
      filter.status = "SCHEDULED";
    } else if (status) {
      // Support multiple statuses: ?status=ACTIVE,SCHEDULED
      const statuses = status.split(",").map((s) => s.trim());
      if (statuses.length === 1) {
        filter.status = statuses[0];
      } else {
        filter.status = { in: statuses };
      }
    }

    // Filter by category
    if (category && category !== "ALL") {
      filter.category = category;
    }

    const auctions = await prisma.auction.findMany({
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
  } catch (error) {
    console.error("Error fetching auctions:", error);
    res.status(500).json({ message: "Failed to fetch auctions" });
  }
};

// Get auction counts grouped by category and status
export const getAuctionCounts = async (req: Request, res: Response) => {
  try {
    // Count by category
    const categoryCounts = await prisma.auction.groupBy({
      by: ["category"],
      _count: { id: true },
      where: {
        status: { in: ["ACTIVE", "SCHEDULED"] },
      },
    });

    // Count by status
    const statusCounts = await prisma.auction.groupBy({
      by: ["status"],
      _count: { id: true },
    });

    // Total count
    const totalCount = await prisma.auction.count({
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
  } catch (error) {
    console.error("Error fetching auction counts:", error);
    res.status(500).json({ message: "Failed to fetch auction counts" });
  }
};

// Get single auction details
export const getAuctionById = async (req: Request, res: Response) => {
  try {
    const id = req.params.id as string;
    
    const auction = await prisma.auction.findUnique({
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
  } catch (error) {
    console.error("Error fetching auction details:", error);
    res.status(500).json({ message: "Failed to fetch auction details" });
  }
};

import cloudinary from "@/config/cloudinary";

// Create a new auction (Seller/Admin only)
export const createAuction = async (req: AuthRequest, res: Response) => {
  try {
    const { title, description, category, startPrice, minIncrement, depositAmount, startTime, endTime } = req.body;
    
    if (!req.user || !req.user.id) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    // 1. Kiểm tra ảnh gửi lên
    const files = req.files as Express.Multer.File[];
    if (!files || files.length === 0) {
      return res.status(400).json({ message: "At least one image is required." });
    }

    // 2. Upload từng ảnh lên Cloudinary
    const uploadPromises = files.map((file) => {
      return new Promise<string>((resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream(
          { folder: "galleryx/auctions" },
          (error, result) => {
            if (error) return reject(error);
            resolve(result!.secure_url);
          }
        );
        stream.end(file.buffer);
      });
    });

    const imageUrls = await Promise.all(uploadPromises);

    // 3. Lưu vào Database
    const newAuction = await prisma.auction.create({
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
  } catch (error: any) {
    console.error("Error creating auction:", error);
    res.status(500).json({ message: error.message || "Failed to create auction" });
  }
};
