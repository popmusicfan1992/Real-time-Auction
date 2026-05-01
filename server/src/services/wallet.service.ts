import { stripe } from "@/config/stripe";
import prisma from "@/config/prisma";

export class WalletService {
  // 1. Lấy thông tin ví
  static async getWallet(userId: string) {
    let wallet = await prisma.wallet.findUnique({
      where: { userId },
      include: {
        transactions: {
          orderBy: { createdAt: "desc" },
          take: 10
        }
      }
    });

    if (!wallet) {
      wallet = await prisma.wallet.create({
        data: { userId },
        include: { transactions: true }
      });
    }

    return wallet;
  }

  // 2. Tạo Payment Intent để Nạp tiền
  static async createDepositIntent(userId: string, amountUSD: number) {
    const wallet = await this.getWallet(userId);

    // Stripe làm việc với đơn vị nhỏ nhất (cents), nên phải nhân 100
    const amountInCents = Math.round(amountUSD * 100);

    const paymentIntent = await stripe.paymentIntents.create({
      amount: amountInCents,
      currency: "usd",
      metadata: {
        userId,
        walletId: wallet.id,
        type: "DEPOSIT"
      }
    });

    // Tạo sẵn một Transaction ở trạng thái PENDING
    await prisma.transaction.create({
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

  // 3. Rút tiền từ ví
  static async withdraw(userId: string, amountUSD: number, bankInfo: string) {
    const wallet = await this.getWallet(userId);

    const available = parseFloat(wallet.balance.toString());
    if (amountUSD > available) {
      throw new Error("Insufficient balance");
    }
    if (amountUSD < 10) {
      throw new Error("Minimum withdrawal is $10");
    }

    return await prisma.$transaction(async (tx) => {
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
