"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const user_controller_1 = require("@/controllers/user.controller");
const auth_1 = require("@/middleware/auth");
const router = (0, express_1.Router)();
// Phải yêu cầu đăng nhập
router.use(auth_1.authenticate);
router.get("/me/dashboard", user_controller_1.getDashboardStats);
router.get("/me/watchlist", user_controller_1.getWatchlist);
router.post("/me/watchlist", user_controller_1.toggleWatchlist);
router.get("/me/profile", user_controller_1.getMyProfile);
router.put("/me/profile", user_controller_1.updateMyProfile);
router.get("/me/auctions", user_controller_1.getMyAuctions);
exports.default = router;
