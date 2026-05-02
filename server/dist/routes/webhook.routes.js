"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const express_2 = __importDefault(require("express"));
const stripe_1 = require("@/config/stripe");
const prisma_1 = __importDefault(require("@/config/prisma"));
const notification_service_1 = require("@/services/notification.service");
const router = (0, express_1.Router)();
// Endpoint webhook phải nhận raw body để Stripe xác minh chữ ký (signature)
router.post("/stripe", express_2.default.raw({ type: "application/json" }), async (req, res) => {
    const sig = req.headers["stripe-signature"];
    let event;
    try {
        event = stripe_1.stripe.webhooks.constructEvent(req.body, sig, process.env.STRIPE_WEBHOOK_SECRET || "whsec_test_placeholder");
    }
    catch (err) {
        console.error(`❌ Webhook Error: ${err.message}`);
        return res.status(400).send(`Webhook Error: ${err.message}`);
    }
    // Xử lý khi thanh toán thành công
    if (event.type === "payment_intent.succeeded") {
        const paymentIntent = event.data.object;
        const { userId, walletId, type } = paymentIntent.metadata;
        if (type === "DEPOSIT") {
            try {
                await prisma_1.default.$transaction(async (tx) => {
                    // 1. Cập nhật transaction thành COMPLETED
                    const transaction = await tx.transaction.findFirst({
                        where: { stripePaymentId: paymentIntent.id }
                    });
                    if (transaction && transaction.status !== "COMPLETED") {
                        await tx.transaction.update({
                            where: { id: transaction.id },
                            data: { status: "COMPLETED" }
                        });
                        // 2. Cộng tiền vào ví
                        await tx.wallet.update({
                            where: { id: walletId },
                            data: { balance: { increment: transaction.amount } }
                        });
                        console.log(`✅ Điểm danh thanh toán thành công: Cộng $${transaction.amount} cho User ${userId}`);
                        // Gửi notification
                        await notification_service_1.NotificationService.notifyPaymentSuccess(userId, parseFloat(transaction.amount.toString()));
                    }
                });
            }
            catch (e) {
                console.error("Lỗi khi update database từ Webhook", e);
            }
        }
    }
    // Trả về 200 để báo cho Stripe biết là đã nhận được
    res.json({ received: true });
});
exports.default = router;
