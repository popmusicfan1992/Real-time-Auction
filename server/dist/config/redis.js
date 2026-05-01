"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.redisSubscriber = exports.redisClient = void 0;
const ioredis_1 = __importDefault(require("ioredis"));
// Dùng 1 instance cho các lệnh đọc/ghi thông thường (GET, SET, ZADD...)
const redisClient = new ioredis_1.default(process.env.REDIS_URL || "redis://localhost:6379");
exports.redisClient = redisClient;
// Dùng 1 instance thứ 2 chuyên để Lắng nghe sự kiện (Subscriber)
const redisSubscriber = new ioredis_1.default(process.env.REDIS_URL || "redis://localhost:6379");
exports.redisSubscriber = redisSubscriber;
redisClient.on("error", (err) => console.error("Redis Client Error", err));
redisSubscriber.on("error", (err) => console.error("Redis Subscriber Error", err));
redisClient.on("connect", () => console.log("🟢 Connected to Redis"));
