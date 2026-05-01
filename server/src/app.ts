import express, { Application, Request, Response, NextFunction } from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import dotenv from "dotenv";
import authRoutes from "@/routes/auth.routes";
import auctionRoutes from "@/routes/auction.routes";
import bidRoutes from "@/routes/bid.routes";
import userRoutes from "@/routes/user.routes";
import notificationRoutes from "@/routes/notification.routes";

import webhookRoutes from "@/routes/webhook.routes";
import walletRoutes from "@/routes/wallet.routes";
import passportConfig from "@/config/passport";

dotenv.config();

const app: Application = express();

// Middlewares
app.use(helmet());
app.use(cors({
  origin: process.env.CLIENT_URL || "http://localhost:3000",
  credentials: true
}));
app.use(morgan("dev"));

// Passport (không cần session vì chúng ta dùng JWT)
app.use(passportConfig.initialize());


// ⚠️ Webhook phải được đặt TRƯỚC express.json() để giữ nguyên Raw Body
app.use("/api/webhooks", webhookRoutes);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health Check
app.get("/health", (req: Request, res: Response) => {
  res.status(200).json({ status: "ok", message: "Server is running" });
});

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/auctions", auctionRoutes);
app.use("/api/bids", bidRoutes);
app.use("/api/wallet", walletRoutes);
app.use("/api/users", userRoutes);
app.use("/api/notifications", notificationRoutes);

// Error Handling Middleware
app.use((err: any, req: Request, res: Response, next: NextFunction) => {
  console.error(err.stack);
  res.status(err.status || 500).json({
    error: {
      message: err.message || "Internal Server Error",
    },
  });
});

export default app;
