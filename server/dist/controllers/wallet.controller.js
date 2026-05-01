"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createDeposit = exports.getMyWallet = void 0;
const wallet_service_1 = require("@/services/wallet.service");
const getMyWallet = async (req, res) => {
    try {
        const userId = req.user.id;
        const wallet = await wallet_service_1.WalletService.getWallet(userId);
        res.json(wallet);
    }
    catch (error) {
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
