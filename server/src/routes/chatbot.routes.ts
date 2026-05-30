import { Router, Request, Response } from "express";
import { generateChatResponse } from "@/services/chatbot.service";

const router = Router();

router.post("/", async (req: Request, res: Response) => {
  try {
    const { message, auctionId, userName } = req.body;
    
    const aiResponse = await generateChatResponse(
      message,
      auctionId || "general",
      userName || "Guest"
    );
    
    res.json({ message: aiResponse });
  } catch (error: any) {
    console.error("General Chatbot Endpoint Error:", error);
    res.status(500).json({ message: "Failed to generate chatbot response" });
  }
});

export default router;
