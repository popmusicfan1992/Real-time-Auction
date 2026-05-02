"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteNotification = exports.markAllAsRead = exports.markAsRead = exports.getUnreadCount = exports.getNotifications = void 0;
const prisma_1 = __importDefault(require("@/config/prisma"));
// Get all notifications for the authenticated user
const getNotifications = async (req, res) => {
    try {
        const userId = req.user.id;
        const notifications = await prisma_1.default.notification.findMany({
            where: { userId },
            orderBy: { createdAt: "desc" },
            take: 50,
        });
        res.json(notifications);
    }
    catch (error) {
        res.status(500).json({ message: error.message });
    }
};
exports.getNotifications = getNotifications;
// Get unread notification count
const getUnreadCount = async (req, res) => {
    try {
        const userId = req.user.id;
        const count = await prisma_1.default.notification.count({
            where: { userId, isRead: false },
        });
        res.json({ count });
    }
    catch (error) {
        res.status(500).json({ message: error.message });
    }
};
exports.getUnreadCount = getUnreadCount;
// Mark a single notification as read
const markAsRead = async (req, res) => {
    try {
        const userId = req.user.id;
        const { id } = req.params;
        const notification = await prisma_1.default.notification.findFirst({
            where: { id, userId },
        });
        if (!notification) {
            return res.status(404).json({ message: "Notification not found" });
        }
        await prisma_1.default.notification.update({
            where: { id },
            data: { isRead: true },
        });
        res.json({ message: "Notification marked as read" });
    }
    catch (error) {
        res.status(500).json({ message: error.message });
    }
};
exports.markAsRead = markAsRead;
// Mark all notifications as read
const markAllAsRead = async (req, res) => {
    try {
        const userId = req.user.id;
        await prisma_1.default.notification.updateMany({
            where: { userId, isRead: false },
            data: { isRead: true },
        });
        res.json({ message: "All notifications marked as read" });
    }
    catch (error) {
        res.status(500).json({ message: error.message });
    }
};
exports.markAllAsRead = markAllAsRead;
// Delete a notification
const deleteNotification = async (req, res) => {
    try {
        const userId = req.user.id;
        const { id } = req.params;
        const notification = await prisma_1.default.notification.findFirst({
            where: { id, userId },
        });
        if (!notification) {
            return res.status(404).json({ message: "Notification not found" });
        }
        await prisma_1.default.notification.delete({ where: { id } });
        res.json({ message: "Notification deleted" });
    }
    catch (error) {
        res.status(500).json({ message: error.message });
    }
};
exports.deleteNotification = deleteNotification;
