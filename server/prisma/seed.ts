import { PrismaClient, Category, AuctionStatus } from '@prisma/client';
import bcrypt from 'bcryptjs';

import "dotenv/config";

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seed...');

  // Clean up existing data
  await prisma.chatMessage.deleteMany();
  await prisma.watchlist.deleteMany();
  await prisma.reminder.deleteMany();
  await prisma.notification.deleteMany();
  await prisma.bid.deleteMany();
  await prisma.depositHold.deleteMany();
  await prisma.transaction.deleteMany();
  await prisma.wallet.deleteMany();
  await prisma.auction.deleteMany();
  await prisma.user.deleteMany();

  // Create a Seller
  const hashedPassword = await bcrypt.hash('password123', 10);
  const seller = await prisma.user.create({
    data: {
      name: 'Gallery X Official',
      email: 'seller@galleryx.com',
      password: hashedPassword,
      role: 'SELLER',
      wallet: {
        create: {
          balance: 100000,
        }
      }
    }
  });

  // Create a Bidder
  const bidder = await prisma.user.create({
    data: {
      name: 'John Doe',
      email: 'bidder@galleryx.com',
      password: hashedPassword,
      role: 'BIDDER',
      wallet: {
        create: {
          balance: 50000, // $50,000 to spend
        }
      }
    }
  });

  // Time helpers
  const now = new Date();
  
  const hoursFromNow = (hours: number) => {
    const d = new Date(now);
    d.setHours(d.getHours() + hours);
    return d;
  };

  const daysFromNow = (days: number) => {
    const d = new Date(now);
    d.setDate(d.getDate() + days);
    return d;
  };

  const hoursAgo = (hours: number) => {
    const d = new Date(now);
    d.setHours(d.getHours() - hours);
    return d;
  };

  // ==========================================
  // ACTIVE AUCTIONS (Live Now)
  // ==========================================

  await prisma.auction.create({
    data: {
      title: '1974 Rolex Submariner Ref. 5513',
      description: 'An exceptionally preserved example of the classic no-date Submariner, featuring a stunning "Maxi" dial with beautiful cream patina. Full box and papers included.||VI||Một mẫu Submariner không ngày kinh điển được bảo quản đặc biệt, với mặt số "Maxi" tuyệt đẹp cùng lớp patina kem tự nhiên. Đầy đủ hộp và giấy tờ.',
      images: ['https://images.unsplash.com/photo-1523170335258-f5ed11844a49?q=80&w=2080&auto=format&fit=crop'],
      category: "WATCHES",
      startingPrice: 15000,
      currentPrice: 18500,
      buyNowPrice: 35000,
      minIncrement: 500,
      depositAmount: 1500,
      startTime: hoursAgo(2),
      endTime: hoursFromNow(6),
      status: AuctionStatus.ACTIVE,
      sellerId: seller.id
    }
  });

  await prisma.auction.create({
    data: {
      title: '"Midnight Convergence" - Elena Rostova, 2021',
      description: 'A breathtaking contemporary oil painting exploring the intersection of light and shadow. Oil on canvas, 150x200cm. Exhibited at Venice Biennale 2022.||VI||Bức tranh sơn dầu đương đại tuyệt đẹp khám phá giao điểm giữa ánh sáng và bóng tối. Sơn dầu trên vải, 150x200cm. Trưng bày tại Venice Biennale 2022.',
      images: ['https://images.unsplash.com/photo-1579783902614-a3fb3927b6a5?q=80&w=1920&auto=format&fit=crop'],
      category: "ART",
      startingPrice: 35000,
      currentPrice: 42000,
      minIncrement: 1000,
      depositAmount: 3500,
      startTime: hoursAgo(5),
      endTime: hoursFromNow(12),
      status: AuctionStatus.ACTIVE,
      sellerId: seller.id
    }
  });

  await prisma.auction.create({
    data: {
      title: 'Leica M3 Double Stroke (1955)',
      description: 'A rare first-batch Leica M3 Double Stroke rangefinder camera in excellent working condition. Serial number confirms 1955 production. Includes original leather case.||VI||Máy ảnh rangefinder Leica M3 Double Stroke hiếm, đợt sản xuất đầu tiên, trong tình trạng hoạt động tuyệt vời. Số serial xác nhận sản xuất năm 1955. Bao gồm hộp da nguyên bản.',
      images: ['https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?q=80&w=2070&auto=format&fit=crop'],
      category: "TECHNOLOGY",
      startingPrice: 2500,
      currentPrice: 3200,
      minIncrement: 200,
      depositAmount: 250,
      startTime: hoursAgo(1),
      endTime: hoursFromNow(24),
      status: AuctionStatus.ACTIVE,
      sellerId: seller.id
    }
  });

  await prisma.auction.create({
    data: {
      title: 'Cartier Panthère Diamond Bracelet',
      description: 'Exquisite 18K white gold bracelet set with 12.5 carats of VVS diamonds. Cartier Paris hallmark, circa 1985. Comes with original Cartier box and certificate.||VI||Vòng tay vàng trắng 18K tinh xảo đính 12,5 carat kim cương VVS. Dấu Cartier Paris, khoảng năm 1985. Đi kèm hộp và giấy chứng nhận Cartier nguyên bản.',
      images: ['https://images.unsplash.com/photo-1515562141589-67f0d569b6cc?q=80&w=2070&auto=format&fit=crop'],
      category: "JEWELRY",
      startingPrice: 85000,
      currentPrice: 92000,
      minIncrement: 2000,
      depositAmount: 8500,
      startTime: hoursAgo(3),
      endTime: hoursFromNow(8),
      status: AuctionStatus.ACTIVE,
      sellerId: seller.id
    }
  });

  // ==========================================
  // SCHEDULED AUCTIONS (Upcoming)
  // ==========================================

  await prisma.auction.create({
    data: {
      title: 'Porsche 911 Carrera RS 2.7 (1973)',
      description: 'One of the most iconic sports cars ever made. Matching numbers, fully restored to exact original specifications in Grand Prix White with Viper Green accents.||VI||Một trong những chiếc xe thể thao mang tính biểu tượng nhất từng được sản xuất. Số khớp, phục chế hoàn toàn theo thông số kỹ thuật gốc với màu Grand Prix White và điểm nhấn Viper Green.',
      images: ['https://images.unsplash.com/photo-1503376713356-20092305848d?q=80&w=1920&auto=format&fit=crop'],
      category: "VEHICLES",
      startingPrice: 850000,
      currentPrice: 850000,
      minIncrement: 5000,
      depositAmount: 85000,
      startTime: daysFromNow(1),
      endTime: daysFromNow(8),
      status: AuctionStatus.SCHEDULED,
      sellerId: seller.id
    }
  });

  await prisma.auction.create({
    data: {
      title: 'First Edition "The Great Gatsby" (1925)',
      description: 'First edition, first printing of F. Scott Fitzgerald\'s masterpiece. Original dust jacket in remarkable condition. One of the most sought-after American first editions.||VI||Ấn bản đầu tiên, in lần đầu của kiệt tác F. Scott Fitzgerald. Bìa bụi nguyên bản trong tình trạng đáng kinh ngạc. Một trong những ấn bản đầu Mỹ được săn tìm nhiều nhất.',
      images: ['https://images.unsplash.com/photo-1544947950-fa07a98d237f?q=80&w=1974&auto=format&fit=crop'],
      category: "COLLECTIBLES",
      startingPrice: 120000,
      currentPrice: 120000,
      minIncrement: 5000,
      depositAmount: 12000,
      startTime: daysFromNow(2),
      endTime: daysFromNow(9),
      status: AuctionStatus.SCHEDULED,
      sellerId: seller.id
    }
  });

  await prisma.auction.create({
    data: {
      title: 'Audemars Piguet Royal Oak "Jumbo"',
      description: 'Reference 15202ST, the closest modern interpretation of the original 1972 Genta design. Ultra-thin automatic movement, blue tapisserie dial. Complete set.||VI||Tham chiếu 15202ST, phiên bản hiện đại gần nhất với thiết kế Genta nguyên bản 1972. Bộ máy tự động siêu mỏng, mặt số tapisserie xanh. Bộ đầy đủ.',
      images: ['https://images.unsplash.com/photo-1587836374828-4dbafa94cf0e?q=80&w=2070&auto=format&fit=crop'],
      category: "WATCHES",
      startingPrice: 65000,
      currentPrice: 65000,
      minIncrement: 1000,
      depositAmount: 6500,
      startTime: daysFromNow(3),
      endTime: daysFromNow(10),
      status: AuctionStatus.SCHEDULED,
      sellerId: seller.id
    }
  });

  await prisma.auction.create({
    data: {
      title: 'Hermès Birkin 25 Himalaya',
      description: 'The holy grail of handbags. Matte Niloticus Crocodile with palladium hardware and 10.23ct diamond-encrusted lock. One of fewer than 50 known to exist.||VI||Thánh bôi của giới túi xách. Da cá sấu Niloticus mờ với phụ kiện palladium và khóa đính 10,23 carat kim cương. Một trong ít hơn 50 chiếc được biết đến.',
      images: ['https://images.unsplash.com/photo-1584917865442-de89df76afd3?q=80&w=1935&auto=format&fit=crop'],
      category: "FASHION",
      startingPrice: 280000,
      currentPrice: 280000,
      minIncrement: 10000,
      depositAmount: 28000,
      startTime: daysFromNow(1),
      endTime: daysFromNow(5),
      status: AuctionStatus.SCHEDULED,
      sellerId: seller.id
    }
  });

  // ==========================================
  // ENDED AUCTIONS
  // ==========================================

  await prisma.auction.create({
    data: {
      title: 'Vintage Bordeaux Grand Cru Collection',
      description: 'A curated collection of 12 bottles spanning 1961-1990 vintages from Château Lafite Rothschild, Mouton Rothschild, and Margaux. Provenance verified, stored in temperature-controlled cellar.||VI||Bộ sưu tập tuyển chọn 12 chai rượu vang từ niên vụ 1961-1990 của Château Lafite Rothschild, Mouton Rothschild và Margaux. Nguồn gốc đã xác minh, bảo quản trong hầm kiểm soát nhiệt độ.',
      images: ['https://images.unsplash.com/photo-1474722883778-792e7990302f?q=80&w=2091&auto=format&fit=crop'],
      category: "COLLECTIBLES",
      startingPrice: 12000,
      currentPrice: 18200,
      minIncrement: 500,
      depositAmount: 1200,
      startTime: daysFromNow(-7),
      endTime: daysFromNow(-1),
      status: AuctionStatus.ENDED,
      sellerId: seller.id
    }
  });

  await prisma.auction.create({
    data: {
      title: 'Apple Macintosh 128K (1984)',
      description: 'Original Macintosh 128K in working condition. Includes original keyboard, mouse, and carrying case. Serial number confirms early production run.||VI||Macintosh 128K nguyên bản trong tình trạng hoạt động. Bao gồm bàn phím, chuột và hộp đựng nguyên bản. Số serial xác nhận đợt sản xuất đầu tiên.',
      images: ['https://images.unsplash.com/photo-1517694712202-14dd9538aa97?q=80&w=2070&auto=format&fit=crop'],
      category: "TECHNOLOGY",
      startingPrice: 5000,
      currentPrice: 8500,
      minIncrement: 250,
      depositAmount: 500,
      startTime: daysFromNow(-5),
      endTime: daysFromNow(-2),
      status: AuctionStatus.ENDED,
      sellerId: seller.id
    }
  });

  // ==========================================
  // TEST NOTIFICATIONS (for bidder)
  // ==========================================

  await prisma.notification.createMany({
    data: [
      {
        userId: bidder.id,
        title: "You've been outbid!",
        message: 'Someone placed a higher bid of $19,000 on "1974 Rolex Submariner Ref. 5513". Place a higher bid to stay in the game!',
        type: "BID_OUTBID",
        isRead: false,
        createdAt: hoursAgo(1),
      },
      {
        userId: bidder.id,
        title: "Congratulations! You won!",
        message: 'You won the auction "Vintage Bordeaux Grand Cru Collection" with a final bid of $18,200.',
        type: "AUCTION_WON",
        isRead: false,
        createdAt: daysFromNow(-1),
      },
      {
        userId: bidder.id,
        title: "Auction ended",
        message: 'The auction "Apple Macintosh 128K (1984)" has ended. Unfortunately, you were outbid. Your deposit has been refunded.',
        type: "AUCTION_LOST",
        isRead: false,
        createdAt: daysFromNow(-2),
      },
      {
        userId: bidder.id,
        title: "Deposit successful",
        message: "$50,000 has been added to your wallet balance.",
        type: "PAYMENT_SUCCESS",
        isRead: true,
        createdAt: daysFromNow(-5),
      },
      {
        userId: bidder.id,
        title: "Deposit refunded",
        message: 'Your deposit of $500 for "Apple Macintosh 128K (1984)" has been returned to your wallet.',
        type: "DEPOSIT_RELEASED",
        isRead: true,
        createdAt: daysFromNow(-2),
      },
    ],
  });

  console.log('✅ Seed completed successfully!');
  console.log(`Test Bidder: bidder@galleryx.com / password123`);
  console.log(`Test Seller: seller@galleryx.com / password123`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
