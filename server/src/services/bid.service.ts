import prisma from "@/config/prisma";
import { redisClient } from "@/config/redis";
import { Decimal } from "@prisma/client/runtime/library";
import { NotificationService } from "@/services/notification.service";

export class BiddingService {
  static async placeBid(userId: string, auctionId: string, bidAmount: number) {
    const amount = new Decimal(bidAmount);

    return await prisma.$transaction(async (tx) => {
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

      if (!auction) throw new Error("Auction not found");
      if (auction.status !== "ACTIVE") throw new Error("Auction is not live");
      
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

      if (!wallet) throw new Error("Wallet not found");
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
          redisClient.publish("auction_events", JSON.stringify({
            type: "OUTBID_ALERT",
            userId: currentHighestBid.userId,
            auctionId: auctionId,
            payload: {
              auctionTitle: auction.title,
              newAmount: amount.toString()
            }
          }));

          // 📬 Tạo notification trong database
          await NotificationService.notifyOutbid(
            currentHighestBid.userId,
            auction.title,
            amount.toString(),
            auctionId
          );
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
      redisClient.publish("auction_events", JSON.stringify({
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
}
