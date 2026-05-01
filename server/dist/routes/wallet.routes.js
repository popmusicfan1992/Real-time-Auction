"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const wallet_controller_1 = require("@/controllers/wallet.controller");
const auth_1 = require("@/middleware/auth");
const router = (0, express_1.Router)();
router.get("/", auth_1.authenticate, wallet_controller_1.getMyWallet);
router.post("/deposit", auth_1.authenticate, wallet_controller_1.createDeposit);
exports.default = router;
