import { Router } from "express";
import express from "express";
import { stripe } from "@/config/stripe";
import prisma from "@/config/prisma";
import { NotificationService } from "@/services/notification.service";

const router = Router();

// Endpoint webhook phải nhận raw body để Stripe xác minh chữ ký (signature)
router.post("/stripe", express.raw({ type: "application/json" }), async (req, res) => {
  const sig = req.headers["stripe-signature"];
  
  let event;
  try {
    event = stripe.webhooks.constructEvent(
      req.body,
      sig as string,
      process.env.STRIPE_WEBHOOK_SECRET || "whsec_test_placeholder"
    );
  } catch (err: any) {
    console.error(`❌ Webhook Error: ${err.message}`);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  // Xử lý khi thanh toán thành công
  if (event.type === "payment_intent.succeeded") {
    const paymentIntent = event.data.object as any;
    const { userId, walletId, type } = paymentIntent.metadata;

    if (type === "DEPOSIT") {
      try {
        await prisma.$transaction(async (tx) => {
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
            await NotificationService.notifyPaymentSuccess(
              userId,
              parseFloat(transaction.amount.toString())
            );
          }
        });
      } catch (e) {
        console.error("Lỗi khi update database từ Webhook", e);
      }
    }
  }

  // Trả về 200 để báo cho Stripe biết là đã nhận được
  res.json({ received: true });
});

export default router;
