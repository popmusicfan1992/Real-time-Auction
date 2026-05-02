import { Router } from "express";
import { getMyWallet, createDeposit, confirmDeposit, createWithdraw } from "@/controllers/wallet.controller";
import { authenticate } from "@/middleware/auth";

const router = Router();

router.get("/", authenticate, getMyWallet);
router.post("/deposit", authenticate, createDeposit);
router.post("/deposit/confirm", authenticate, confirmDeposit);
router.post("/withdraw", authenticate, createWithdraw);

export default router;
