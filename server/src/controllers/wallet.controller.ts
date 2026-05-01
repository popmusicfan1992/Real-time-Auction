import { Response } from "express";
import { AuthRequest } from "@/middleware/auth";
import { WalletService } from "@/services/wallet.service";

export const getMyWallet = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user!.id;
    const wallet = await WalletService.getWallet(userId);
    res.json(wallet);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const createDeposit = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user!.id;
    const { amount } = req.body;

    if (!amount || amount <= 0) {
      return res.status(400).json({ message: "Invalid amount" });
    }

    const result = await WalletService.createDepositIntent(userId, amount);
    res.json(result);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const createWithdraw = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user!.id;
    const { amount, bankInfo } = req.body;

    if (!amount || amount <= 0) {
      return res.status(400).json({ message: "Invalid amount" });
    }
    if (!bankInfo) {
      return res.status(400).json({ message: "Bank info is required" });
    }

    const transaction = await WalletService.withdraw(userId, amount, bankInfo);
    res.json({ message: "Withdrawal request submitted", transaction });
  } catch (error: any) {
    res.status(400).json({ message: error.message });
  }
};

