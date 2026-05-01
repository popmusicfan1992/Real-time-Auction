import { Router } from "express";
import { register, login } from "@/controllers/auth.controller";
import passport from "@/config/passport";
import jwt from "jsonwebtoken";

const router = Router();

// Email/Password Auth
router.post("/register", register);
router.post("/login", login);

// Google OAuth — Bước 1: Redirect người dùng đến Google
router.get(
  "/google",
  passport.authenticate("google", {
    scope: ["profile", "email"],
    session: false,
  })
);

// Google OAuth — Bước 2: Google callback sau khi user đồng ý
router.get(
  "/google/callback",
  passport.authenticate("google", {
    failureRedirect: `${process.env.CLIENT_URL}/login?error=google_failed`,
    session: false,
  }),
  (req, res) => {
    const user = req.user as any;

    // Tạo JWT token
    const token = jwt.sign(
      { id: user.id, role: user.role },
      process.env.JWT_SECRET || "fallback_secret",
      { expiresIn: "7d" }
    );

    // Encode user info để gửi về frontend
    const userPayload = encodeURIComponent(
      JSON.stringify({ id: user.id, name: user.name, email: user.email, role: user.role, avatar: user.avatar })
    );

    // Redirect về frontend với token + user info trong query string
    res.redirect(`${process.env.CLIENT_URL}/auth/callback?token=${token}&user=${userPayload}`);
  }
);

export default router;
