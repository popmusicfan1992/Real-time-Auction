"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.WalletService = void 0;
const stripe_1 = require("@/config/stripe");
const prisma_1 = __importDefault(require("@/config/prisma"));
class WalletService {
    // 1. Lấy thông tin ví
    static async getWallet(userId) {
        let wallet = await prisma_1.default.wallet.findUnique({
            where: { userId },
            include: {
                transactions: {
                    orderBy: { createdAt: "desc" },
                    take: 10
                }
            }
        });
        if (!wallet) {
            wallet = await prisma_1.default.wallet.create({
                data: { userId },
                include: { transactions: true }
            });
        }
        return wallet;
    }
    // 2. Tạo Payment Intent để Nạp tiền
    static async createDepositIntent(userId, amountUSD) {
        const wallet = await this.getWallet(userId);
        // Stripe làm việc với đơn vị nhỏ nhất (cents), nên phải nhân 100
        const amountInCents = Math.round(amountUSD * 100);
        const paymentIntent = await stripe_1.stripe.paymentIntents.create({
            amount: amountInCents,
            currency: "usd",
            metadata: {
                userId,
                walletId: wallet.id,
                type: "DEPOSIT"
            }
        });
        // Tạo sẵn một Transaction ở trạng thái PENDING
        await prisma_1.default.transaction.create({
            data: {
                walletId: wallet.id,
                amount: amountUSD,
                type: "PAYMENT",
                status: "PENDING",
                stripePaymentId: paymentIntent.id,
                description: `Deposit via Credit Card`
            }
        });
        return {
            clientSecret: paymentIntent.client_secret,
            paymentIntentId: paymentIntent.id
        };
    }
}
exports.WalletService = WalletService;
