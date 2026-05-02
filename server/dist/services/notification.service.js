"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.NotificationService = void 0;
const prisma_1 = __importDefault(require("@/config/prisma"));
class NotificationService {
    static async create(userId, title, message, type, data) {
        return await prisma_1.default.notification.create({
            data: {
                userId,
                title,
                message,
                type,
                data: data || undefined,
            },
        });
    }
    // Thông báo khi bị vượt giá
    static async notifyOutbid(userId, auctionTitle, newAmount, auctionId) {
        return await this.create(userId, "You've been outbid!", `Someone placed a higher bid of $${parseFloat(newAmount).toLocaleString()} on "${auctionTitle}". Your deposit has been refunded.`, "BID_OUTBID", { auctionId, newAmount });
    }
    // Thông báo khi thắng đấu giá
    static async notifyAuctionWon(userId, auctionTitle, finalPrice, auctionId) {
        return await this.create(userId, "Congratulations! You won!", `You won the auction "${auctionTitle}" with a final bid of $${parseFloat(finalPrice).toLocaleString()}.`, "AUCTION_WON", { auctionId, finalPrice });
    }
    // Thông báo khi thua đấu giá
    static async notifyAuctionLost(userId, auctionTitle, auctionId) {
        return await this.create(userId, "Auction ended", `The auction "${auctionTitle}" has ended. Unfortunately, you were outbid. Your deposit has been refunded.`, "AUCTION_LOST", { auctionId });
    }
    // Thông báo khi nạp tiền thành công
    static async notifyPaymentSuccess(userId, amount) {
        return await this.create(userId, "Deposit successful", `$${amount.toLocaleString()} has been added to your wallet balance.`, "PAYMENT_SUCCESS", { amount });
    }
    // Thông báo khi cọc được hoàn trả
    static async notifyDepositReleased(userId, auctionTitle, amount, auctionId) {
        return await this.create(userId, "Deposit refunded", `Your deposit of $${parseFloat(amount).toLocaleString()} for "${auctionTitle}" has been returned to your wallet.`, "DEPOSIT_RELEASED", { auctionId, amount });
    }
}
exports.NotificationService = NotificationService;
