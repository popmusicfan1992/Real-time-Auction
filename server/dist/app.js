"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const helmet_1 = __importDefault(require("helmet"));
const morgan_1 = __importDefault(require("morgan"));
const dotenv_1 = __importDefault(require("dotenv"));
const auth_routes_1 = __importDefault(require("@/routes/auth.routes"));
const auction_routes_1 = __importDefault(require("@/routes/auction.routes"));
const bid_routes_1 = __importDefault(require("@/routes/bid.routes"));
const user_routes_1 = __importDefault(require("@/routes/user.routes"));
const notification_routes_1 = __importDefault(require("@/routes/notification.routes"));
const webhook_routes_1 = __importDefault(require("@/routes/webhook.routes"));
const wallet_routes_1 = __importDefault(require("@/routes/wallet.routes"));
const passport_1 = __importDefault(require("@/config/passport"));
dotenv_1.default.config();
const app = (0, express_1.default)();
// Middlewares
app.use((0, helmet_1.default)());
app.use((0, cors_1.default)({
    origin: process.env.CLIENT_URL || "http://localhost:3000",
    credentials: true
}));
app.use((0, morgan_1.default)("dev"));
// Passport (không cần session vì chúng ta dùng JWT)
app.use(passport_1.default.initialize());
// ⚠️ Webhook phải được đặt TRƯỚC express.json() để giữ nguyên Raw Body
app.use("/api/webhooks", webhook_routes_1.default);
app.use(express_1.default.json());
app.use(express_1.default.urlencoded({ extended: true }));
// Health Check
app.get("/health", (req, res) => {
    res.status(200).json({ status: "ok", message: "Server is running" });
});
// Routes
app.use("/api/auth", auth_routes_1.default);
app.use("/api/auctions", auction_routes_1.default);
app.use("/api/bids", bid_routes_1.default);
app.use("/api/wallet", wallet_routes_1.default);
app.use("/api/users", user_routes_1.default);
app.use("/api/notifications", notification_routes_1.default);
// Error Handling Middleware
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(err.status || 500).json({
        error: {
            message: err.message || "Internal Server Error",
        },
    });
});
exports.default = app;
