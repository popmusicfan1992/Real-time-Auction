"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuctionService = void 0;
const prisma_1 = __importDefault(require("@/config/prisma"));
const redis_1 = require("@/config/redis");
const notification_service_1 = require("@/services/notification.service");
class AuctionService {
    static async closeAuction(auctionId) {
        try {
            // Dùng transaction để đảm bảo an toàn dữ liệu tuyệt đối khi xử lý tiền bạc
            await prisma_1.default.$transaction(async (tx) => {
                const auction = await tx.auction.findUnique({
                    where: { id: auctionId },
                    include: {
                        bids: {
                            orderBy: { amount: "desc" },
                            take: 1,
                        },
                    },
                });
                // Chỉ đóng nếu nó đang ACTIVE
                if (!auction || auction.status !== "ACTIVE")
                    return;
                // 1. Cập nhật trạng thái thành ENDED
                await tx.auction.update({
                    where: { id: auctionId },
                    data: { status: "ENDED" },
                });
                const winnerBid = auction.bids[0];
                const winnerId = winnerBid ? winnerBid.userId : null;
                // 2. Lấy tất cả các khoản cọc (DepositHold) của phiên này
                const depositHolds = await tx.depositHold.findMany({
                    where: { auctionId: auctionId, status: "HELD" },
                });
                for (const hold of depositHolds) {
                    // Lấy ví của hold này
                    const wallet = await tx.wallet.findUnique({ where: { id: hold.walletId } });
                    if (!wallet)
                        continue;
                    if (wallet.userId === winnerId) {
                        // NẾU LÀ NGƯỜI THẮNG: Trừ hẳn tiền cọc (CHARGED)
                        await tx.wallet.update({
                            where: { id: wallet.id },
                            data: {
                                frozenBalance: { decrement: hold.amount }
                                // balance không được cộng lại vì đã bị trừ hẳn
                            }
                        });
                        await tx.depositHold.update({
                            where: { id: hold.id },
                            data: { status: "CHARGED" }
                        });
                    }
                    else {
                        // NẾU LÀ NGƯỜI THUA: Trả lại cọc (RELEASED)
                        await tx.wallet.update({
                            where: { id: wallet.id },
                            data: {
                                frozenBalance: { decrement: hold.amount },
                                balance: { increment: hold.amount }
                            }
                        });
                        await tx.depositHold.update({
                            where: { id: hold.id },
                            data: { status: "RELEASED", releasedAt: new Date() }
                        });
                    }
                }
                // 3. Thông báo cho toàn bộ phòng qua Redis
                redis_1.redisClient.publish("auction_events", JSON.stringify({
                    type: "AUCTION_ENDED",
                    auctionId: auctionId,
                    payload: {
                        winnerId,
                        finalPrice: auction.currentPrice.toString()
                    }
                }));
                // 4. Tạo notifications cho người thắng và người thua
                if (winnerId) {
                    await notification_service_1.NotificationService.notifyAuctionWon(winnerId, auction.title, auction.currentPrice.toString(), auctionId);
                }
                // Thông báo cho tất cả người tham gia (trừ người thắng)
                const allBidders = await tx.bid.findMany({
                    where: { auctionId },
                    select: { userId: true },
                    distinct: ["userId"],
                });
                for (const bidder of allBidders) {
                    if (bidder.userId !== winnerId) {
                        await notification_service_1.NotificationService.notifyAuctionLost(bidder.userId, auction.title, auctionId);
                    }
                }
            });
        }
        catch (error) {
            console.error(`Lỗi khi đóng phiên đấu giá ${auctionId}:`, error);
        }
    }
}
exports.AuctionService = AuctionService;
