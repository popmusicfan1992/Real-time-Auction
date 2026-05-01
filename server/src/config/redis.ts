import Redis from "ioredis";

// Dùng 1 instance cho các lệnh đọc/ghi thông thường (GET, SET, ZADD...)
const redisClient = new Redis(process.env.REDIS_URL || "redis://localhost:6379");

// Dùng 1 instance thứ 2 chuyên để Lắng nghe sự kiện (Subscriber)
const redisSubscriber = new Redis(process.env.REDIS_URL || "redis://localhost:6379");

redisClient.on("error", (err) => console.error("Redis Client Error", err));
redisSubscriber.on("error", (err) => console.error("Redis Subscriber Error", err));

redisClient.on("connect", () => console.log("🟢 Connected to Redis"));

export { redisClient, redisSubscriber };
