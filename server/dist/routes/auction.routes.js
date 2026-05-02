"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auction_controller_1 = require("@/controllers/auction.controller");
const auth_1 = require("@/middleware/auth");
const upload_1 = require("@/middleware/upload");
const router = (0, express_1.Router)();
// Public routes
router.get("/", auction_controller_1.getAuctions);
router.get("/counts", auction_controller_1.getAuctionCounts);
router.get("/stats", auction_controller_1.getHomeStats);
router.get("/:id", auction_controller_1.getAuctionById);
router.get("/:id/chat", auction_controller_1.getChatMessages);
// Protected routes
router.post("/", auth_1.authenticate, (0, auth_1.authorize)(["ADMIN", "SELLER"]), upload_1.upload.array("images", 5), auction_controller_1.createAuction);
exports.default = router;
