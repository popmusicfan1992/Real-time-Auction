"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const passport_1 = __importDefault(require("passport"));
const passport_google_oauth20_1 = require("passport-google-oauth20");
const prisma_1 = __importDefault(require("@/config/prisma"));
passport_1.default.use(new passport_google_oauth20_1.Strategy({
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: "/api/auth/google/callback",
}, async (accessToken, refreshToken, profile, done) => {
    try {
        const email = profile.emails?.[0]?.value;
        const name = profile.displayName;
        const avatar = profile.photos?.[0]?.value;
        const googleId = profile.id;
        if (!email) {
            return done(new Error("Google account has no email"), false);
        }
        // Tìm user theo googleId trước
        let user = await prisma_1.default.user.findFirst({
            where: { OR: [{ googleId }, { email }] },
        });
        if (user) {
            // Cập nhật googleId nếu đăng nhập lần đầu bằng Google (user đã tồn tại bằng email/password)
            if (!user.googleId) {
                user = await prisma_1.default.user.update({
                    where: { id: user.id },
                    data: { googleId, avatar: avatar || user.avatar },
                });
            }
        }
        else {
            // Tạo user mới
            user = await prisma_1.default.user.create({
                data: {
                    email,
                    name,
                    googleId,
                    avatar,
                },
            });
        }
        return done(null, user);
    }
    catch (error) {
        return done(error, false);
    }
}));
// Passport serialize/deserialize (dùng cho session nếu cần, nhưng chúng ta dùng JWT)
passport_1.default.serializeUser((user, done) => done(null, user.id));
passport_1.default.deserializeUser(async (id, done) => {
    try {
        const user = await prisma_1.default.user.findUnique({ where: { id } });
        done(null, user);
    }
    catch (err) {
        done(err, null);
    }
});
exports.default = passport_1.default;
