import { Router, Request, Response } from "express";
import prisma from "@/config/prisma";

const router = Router();

router.post("/subscribe", async (req: Request, res: Response) => {
  try {
    const { email } = req.body;

    if (!email || !email.includes("@")) {
      return res.status(400).json({ message: "Invalid email address" });
    }

    // Check if already subscribed
    const existing = await prisma.newsletterSubscriber.findUnique({
      where: { email }
    });

    if (existing) {
      return res.status(400).json({ message: "Email is already subscribed!" });
    }

    // Create subscriber
    await prisma.newsletterSubscriber.create({
      data: { email }
    });

    res.status(201).json({ message: "Subscribed successfully! 🎉" });
  } catch (error: any) {
    console.error("Newsletter Subscription Error:", error);
    res.status(500).json({ message: "Failed to subscribe" });
  }
});

export default router;
