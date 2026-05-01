import { Router } from "express";
import { getDashboardStats, getWatchlist, toggleWatchlist, getMyProfile, updateMyProfile, getMyAuctions } from "@/controllers/user.controller";
import { authenticate } from "@/middleware/auth";

const router = Router();

// Phải yêu cầu đăng nhập
router.use(authenticate);

router.get("/me/dashboard", getDashboardStats);
router.get("/me/watchlist", getWatchlist);
router.post("/me/watchlist", toggleWatchlist);
router.get("/me/profile", getMyProfile);
router.put("/me/profile", updateMyProfile);
router.get("/me/auctions", getMyAuctions);

export default router;

