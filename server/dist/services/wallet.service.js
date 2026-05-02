"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.WalletService = void 0;
const stripe_1 = require("@/config/stripe");
const prisma_1 = __importDefault(require("@/config/prisma"));
const notification_service_1 = require("@/services/notification.service");
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
            // Kiểm tra user có tồn tại không trước khi tạo wallet
            const userExists = await prisma_1.default.user.findUnique({ where: { id: userId } });
            if (!userExists) {
                throw new Error("User not found. Please log in again.");
            }
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
                type: "DEPOSIT",
                status: "PENDING",
                stripePaymentId: paymentIntent.id,
                description: `Deposit $${amountUSD.toLocaleString()} via Credit Card`
            }
        });
        return {
            clientSecret: paymentIntent.client_secret,
            paymentIntentId: paymentIntent.id
        };
    }
    // 2b. Xác nhận deposit sau khi Stripe payment thành công (fallback khi webhook chưa hoạt động)
    static async confirmDeposit(userId, paymentIntentId) {
        // Lấy trạng thái thực tế từ Stripe
        const paymentIntent = await stripe_1.stripe.paymentIntents.retrieve(paymentIntentId);
        if (paymentIntent.status !== "succeeded") {
            throw new Error(`Payment not completed. Status: ${paymentIntent.status}`);
        }
        // Kiểm tra xem PaymentIntent này có thuộc user này không (qua metadata)
        if (paymentIntent.metadata.userId !== userId) {
            throw new Error("Unauthorized: Payment does not belong to this user");
        }
        // Tìm transaction PENDING tương ứng
        const transaction = await prisma_1.default.transaction.findFirst({
            where: {
                stripePaymentId: paymentIntentId,
                status: "PENDING",
            },
        });
        if (!transaction) {
            // Có thể đã được xử lý bởi webhook trước đó
            return { message: "Payment already processed", alreadyProcessed: true };
        }
        // Cập nhật trong transaction
        const result = await prisma_1.default.$transaction(async (tx) => {
            // 1. Cập nhật transaction thành COMPLETED
            await tx.transaction.update({
                where: { id: transaction.id },
                data: { status: "COMPLETED" }
            });
            // 2. Cộng tiền vào ví
            const wallet = await tx.wallet.update({
                where: { id: transaction.walletId },
                data: { balance: { increment: transaction.amount } }
            });
            return wallet;
        });
        // Gửi notification
        await notification_service_1.NotificationService.notifyPaymentSuccess(userId, parseFloat(transaction.amount.toString()));
        console.log(`✅ Deposit confirmed: +$${transaction.amount} for User ${userId}`);
        return {
            message: "Deposit confirmed successfully",
            newBalance: result.balance,
            amount: transaction.amount,
        };
    }
    // 3. Rút tiền từ ví
    static async withdraw(userId, amountUSD, bankInfo) {
        const wallet = await this.getWallet(userId);
        const available = parseFloat(wallet.balance.toString());
        if (amountUSD > available) {
            throw new Error("Insufficient balance");
        }
        if (amountUSD < 10) {
            throw new Error("Minimum withdrawal is $10");
        }
        return await prisma_1.default.$transaction(async (tx) => {
            // Trừ tiền trong ví
            await tx.wallet.update({
                where: { userId },
                data: { balance: { decrement: amountUSD } }
            });
            // Tạo transaction
            const transaction = await tx.transaction.create({
                data: {
                    walletId: wallet.id,
                    amount: amountUSD,
                    type: "WITHDRAWAL",
                    status: "PENDING",
                    description: `Withdrawal to ${bankInfo}`
                }
            });
            return transaction;
        });
    }
}
exports.WalletService = WalletService;
