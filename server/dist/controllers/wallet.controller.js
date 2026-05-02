"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createWithdraw = exports.confirmDeposit = exports.createDeposit = exports.getMyWallet = void 0;
const wallet_service_1 = require("@/services/wallet.service");
const getMyWallet = async (req, res) => {
    try {
        const userId = req.user.id;
        const wallet = await wallet_service_1.WalletService.getWallet(userId);
        res.json(wallet);
    }
    catch (error) {
        console.error("❌ Wallet Error:", error.message);
        if (error.message.includes("User not found")) {
            return res.status(401).json({ message: error.message });
        }
        res.status(500).json({ message: error.message });
    }
};
exports.getMyWallet = getMyWallet;
const createDeposit = async (req, res) => {
    try {
        const userId = req.user.id;
        const { amount } = req.body;
        if (!amount || amount <= 0) {
            return res.status(400).json({ message: "Invalid amount" });
        }
        const result = await wallet_service_1.WalletService.createDepositIntent(userId, amount);
        res.json(result);
    }
    catch (error) {
        res.status(500).json({ message: error.message });
    }
};
exports.createDeposit = createDeposit;
const confirmDeposit = async (req, res) => {
    try {
        const userId = req.user.id;
        const { paymentIntentId } = req.body;
        if (!paymentIntentId) {
            return res.status(400).json({ message: "Payment intent ID is required" });
        }
        const result = await wallet_service_1.WalletService.confirmDeposit(userId, paymentIntentId);
        res.json(result);
    }
    catch (error) {
        res.status(400).json({ message: error.message });
    }
};
exports.confirmDeposit = confirmDeposit;
const createWithdraw = async (req, res) => {
    try {
        const userId = req.user.id;
        const { amount, bankInfo } = req.body;
        if (!amount || amount <= 0) {
            return res.status(400).json({ message: "Invalid amount" });
        }
        if (!bankInfo) {
            return res.status(400).json({ message: "Bank info is required" });
        }
        const transaction = await wallet_service_1.WalletService.withdraw(userId, amount, bankInfo);
        res.json({ message: "Withdrawal request submitted", transaction });
    }
    catch (error) {
        res.status(400).json({ message: error.message });
    }
};
exports.createWithdraw = createWithdraw;
