"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_controller_1 = require("@/controllers/auth.controller");
const passport_1 = __importDefault(require("@/config/passport"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const router = (0, express_1.Router)();
// Email/Password Auth
router.post("/register", auth_controller_1.register);
router.post("/login", auth_controller_1.login);
// Google OAuth — Bước 1: Redirect người dùng đến Google
router.get("/google", passport_1.default.authenticate("google", {
    scope: ["profile", "email"],
    session: false,
}));
// Google OAuth — Bước 2: Google callback sau khi user đồng ý
router.get("/google/callback", passport_1.default.authenticate("google", {
    failureRedirect: `${process.env.CLIENT_URL}/login?error=google_failed`,
    session: false,
}), (req, res) => {
    const user = req.user;
    // Tạo JWT token
    const token = jsonwebtoken_1.default.sign({ id: user.id, role: user.role }, process.env.JWT_SECRET || "fallback_secret", { expiresIn: "7d" });
    // Encode user info để gửi về frontend
    const userPayload = encodeURIComponent(JSON.stringify({ id: user.id, name: user.name, email: user.email, role: user.role, avatar: user.avatar }));
    // Redirect về frontend với token + user info trong query string
    res.redirect(`${process.env.CLIENT_URL}/auth/callback?token=${token}&user=${userPayload}`);
});
exports.default = router;
