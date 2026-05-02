"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const bid_controller_1 = require("@/controllers/bid.controller");
const auth_1 = require("@/middleware/auth");
const router = (0, express_1.Router)();
// Protected routes: Users must be logged in
router.post("/", auth_1.authenticate, bid_controller_1.placeBid);
router.post("/buy-now", auth_1.authenticate, bid_controller_1.buyNow);
exports.default = router;
