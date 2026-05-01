import { Router } from "express";
import { getMyWallet, createDeposit, createWithdraw } from "@/controllers/wallet.controller";
import { authenticate } from "@/middleware/auth";

const router = Router();

router.get("/", authenticate, getMyWallet);
router.post("/deposit", authenticate, createDeposit);
router.post("/withdraw", authenticate, createWithdraw);

export default router;

