"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.BiddingService = void 0;
const prisma_1 = __importDefault(require("@/config/prisma"));
const redis_1 = require("@/config/redis");
const library_1 = require("@prisma/client/runtime/library");
const notification_service_1 = require("@/services/notification.service");
class BiddingService {
    static async placeBid(userId, auctionId, bidAmount) {
        const amount = new library_1.Decimal(bidAmount);
        return await prisma_1.default.$transaction(async (tx) => {
            // 1. Lấy thông tin phiên đấu giá và người giữ giá cao nhất hiện tại
            const auction = await tx.auction.findUnique({
                where: { id: auctionId },
                include: {
                    bids: {
                        orderBy: { amount: "desc" },
                        take: 1,
                    },
                },
            });
            if (!auction)
                throw new Error("Auction not found");
            if (auction.status !== "ACTIVE")
                throw new Error("Auction is not live");
            const currentHighestBid = auction.bids[0];
            const minRequired = currentHighestBid
                ? currentHighestBid.amount.plus(auction.minIncrement)
                : auction.startingPrice;
            if (amount.lessThan(minRequired)) {
                throw new Error(`Bid must be at least $${minRequired.toString()}`);
            }
            // 2. Lấy ví của user hiện tại
            const wallet = await tx.wallet.findUnique({
                where: { userId },
            });
            if (!wallet)
                throw new Error("Wallet not found");
            if (wallet.balance.lessThan(auction.depositAmount)) {
                throw new Error("Insufficient funds for deposit hold");
            }
            // 3. Hoàn cọc cho người bị vượt giá (nếu có)
            if (currentHighestBid && currentHighestBid.userId !== userId) {
                const previousWallet = await tx.wallet.findUnique({ where: { userId: currentHighestBid.userId } });
                if (previousWallet) {
                    // Giải phóng tiền đóng băng
                    await tx.wallet.update({
                        where: { userId: currentHighestBid.userId },
                        data: {
                            frozenBalance: { decrement: auction.depositAmount },
                            balance: { increment: auction.depositAmount },
                        },
                    });
                    // Cập nhật trạng thái DepositHold
                    await tx.depositHold.updateMany({
                        where: {
                            walletId: previousWallet.id,
                            auctionId: auctionId,
                            status: "HELD"
                        },
                        data: {
                            status: "RELEASED",
                            releasedAt: new Date()
                        }
                    });
                    // 📡 Bắn sự kiện OUTBID_ALERT vào Redis để báo qua Socket
                    redis_1.redisClient.publish("auction_events", JSON.stringify({
                        type: "OUTBID_ALERT",
                        userId: currentHighestBid.userId,
                        auctionId: auctionId,
                        payload: {
                            auctionTitle: auction.title,
                            newAmount: amount.toString()
                        }
                    }));
                    // 📬 Tạo notification trong database
                    await notification_service_1.NotificationService.notifyOutbid(currentHighestBid.userId, auction.title, amount.toString(), auctionId);
                }
            }
            // 4. Giữ cọc của người dùng mới (chỉ giữ nếu họ chưa có cọc trong phiên này)
            const existingHold = await tx.depositHold.findFirst({
                where: { walletId: wallet.id, auctionId: auctionId, status: "HELD" }
            });
            if (!existingHold) {
                await tx.wallet.update({
                    where: { userId },
                    data: {
                        balance: { decrement: auction.depositAmount },
                        frozenBalance: { increment: auction.depositAmount },
                    },
                });
                await tx.depositHold.create({
                    data: {
                        walletId: wallet.id,
                        auctionId: auctionId,
                        amount: auction.depositAmount,
                        status: "HELD"
                    }
                });
            }
            // 5. Tạo Bid mới và cập nhật giá Auction
            const newBid = await tx.bid.create({
                data: {
                    userId,
                    auctionId,
                    amount,
                },
                include: {
                    user: {
                        select: { name: true, avatar: true },
                    },
                },
            });
            // --- ANTI-SNIPING LOGIC ---
            let newEndTime = auction.endTime;
            const now = new Date();
            const fiveMinutesInMs = 5 * 60 * 1000;
            if (auction.endTime.getTime() - now.getTime() < fiveMinutesInMs) {
                newEndTime = new Date(now.getTime() + fiveMinutesInMs);
            }
            const updatedAuction = await tx.auction.update({
                where: { id: auctionId },
                data: {
                    currentPrice: amount,
                    endTime: newEndTime
                },
            });
            // 6. Phát sự kiện CÓ GIÁ MỚI (NEW_BID) lên Redis Pub/Sub
            redis_1.redisClient.publish("auction_events", JSON.stringify({
                type: "NEW_BID",
                auctionId: auctionId,
                payload: {
                    newPrice: updatedAuction.currentPrice.toString(),
                    bidderName: newBid.user.name,
                    bid: {
                        ...newBid,
                        amount: newBid.amount.toString() // Serialize Decimal
                    }
                }
            }));
            return newBid;
        });
    }
    // ========================================
    // BUY NOW — Mua ngay với giá cố định
    // ========================================
    static async buyNow(userId, auctionId) {
        return await prisma_1.default.$transaction(async (tx) => {
            // 1. Lấy auction + tất cả bids
            const auction = await tx.auction.findUnique({
                where: { id: auctionId },
                include: {
                    bids: {
                        orderBy: { amount: "desc" },
                        select: { userId: true },
                        distinct: ["userId"],
                    },
                },
            });
            if (!auction)
                throw new Error("Auction not found");
            if (auction.status !== "ACTIVE")
                throw new Error("Auction is not active");
            if (!auction.buyNowPrice)
                throw new Error("This auction does not support Buy Now");
            const buyNowPrice = auction.buyNowPrice;
            // 2. Kiểm tra ví người mua
            const buyerWallet = await tx.wallet.findUnique({ where: { userId } });
            if (!buyerWallet)
                throw new Error("Wallet not found");
            // Tính số tiền cần trả: buyNowPrice - tiền cọc đã giữ (nếu có)
            const existingHold = await tx.depositHold.findFirst({
                where: { walletId: buyerWallet.id, auctionId, status: "HELD" }
            });
            const alreadyHeld = existingHold ? existingHold.amount : new library_1.Decimal(0);
            const remainingToPay = buyNowPrice.minus(alreadyHeld);
            if (buyerWallet.balance.lessThan(remainingToPay)) {
                throw new Error(`Insufficient funds. Need $${remainingToPay.toString()} more (Buy Now price: $${buyNowPrice.toString()}, deposit held: $${alreadyHeld.toString()})`);
            }
            // 3. Trừ tiền người mua
            await tx.wallet.update({
                where: { userId },
                data: {
                    balance: { decrement: remainingToPay },
                },
            });
            // Nếu người mua đã có cọc, chuyển sang CHARGED
            if (existingHold) {
                await tx.wallet.update({
                    where: { userId },
                    data: { frozenBalance: { decrement: alreadyHeld } },
                });
                await tx.depositHold.update({
                    where: { id: existingHold.id },
                    data: { status: "CHARGED" },
                });
            }
            // Tạo transaction thanh toán
            await tx.transaction.create({
                data: {
                    walletId: buyerWallet.id,
                    amount: buyNowPrice,
                    type: "PAYMENT",
                    status: "COMPLETED",
                    description: `Buy Now: ${auction.title}`,
                },
            });
            // 4. Hoàn trả cọc cho TẤT CẢ người đã bid khác
            const otherHolds = await tx.depositHold.findMany({
                where: {
                    auctionId,
                    status: "HELD",
                    walletId: { not: buyerWallet.id },
                },
            });
            for (const hold of otherHolds) {
                await tx.wallet.update({
                    where: { id: hold.walletId },
                    data: {
                        frozenBalance: { decrement: hold.amount },
                        balance: { increment: hold.amount },
                    },
                });
                await tx.depositHold.update({
                    where: { id: hold.id },
                    data: { status: "RELEASED", releasedAt: new Date() },
                });
            }
            // 5. Tạo bid cuối cùng ở mức buyNowPrice
            const finalBid = await tx.bid.create({
                data: {
                    userId,
                    auctionId,
                    amount: buyNowPrice,
                },
                include: {
                    user: { select: { name: true, avatar: true } },
                },
            });
            // 6. Đóng auction
            await tx.auction.update({
                where: { id: auctionId },
                data: {
                    status: "ENDED",
                    currentPrice: buyNowPrice,
                    endTime: new Date(), // Kết thúc ngay
                },
            });
            // 7. Phát sự kiện qua Socket
            redis_1.redisClient.publish("auction_events", JSON.stringify({
                type: "NEW_BID",
                auctionId,
                payload: {
                    newPrice: buyNowPrice.toString(),
                    bidderName: finalBid.user.name,
                    bid: {
                        ...finalBid,
                        amount: finalBid.amount.toString(),
                    },
                },
            }));
            redis_1.redisClient.publish("auction_events", JSON.stringify({
                type: "AUCTION_ENDED",
                auctionId,
                payload: {
                    winnerId: userId,
                    finalPrice: buyNowPrice.toString(),
                    isBuyNow: true,
                },
            }));
            // 8. Notifications
            await notification_service_1.NotificationService.notifyAuctionWon(userId, auction.title, buyNowPrice.toString(), auctionId);
            // Thông báo cho tất cả người tham gia khác
            for (const bidder of auction.bids) {
                if (bidder.userId !== userId) {
                    await notification_service_1.NotificationService.notifyAuctionLost(bidder.userId, auction.title, auctionId);
                }
            }
            console.log(`🔨 BUY NOW: ${finalBid.user.name} bought "${auction.title}" for $${buyNowPrice.toString()}`);
            return {
                message: "Buy Now successful!",
                auction: auction.title,
                price: buyNowPrice.toString(),
                bid: finalBid,
            };
        });
    }
}
exports.BiddingService = BiddingService;
