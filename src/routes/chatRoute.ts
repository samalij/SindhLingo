import express, { Request, Response } from "express";
import Chat from "../models/chat";
import { verifyUser } from "../middleware/authMiddleware";

const router = express.Router();

// POST /api/chats/new - Create a new chat
router.post("/new", verifyUser, async (req: Request, res: Response) => {
  try {
    const { title, text, sender } = req.body;

    if (!title || !text || !sender) {
      res.status(400).json({ message: "Title, text, and sender are required" });
      return;
    }

    const userId = req.user._id;

    // Create a new chat for the user
    const chat = new Chat({
      user: userId,
      title,
      messages: [{ sender, text, timestamp: new Date() }],
    });

    await chat.save();

    res.status(201).json({ message: "Chat created successfully", chat });
  } catch (error: any) {
    console.error("Error creating chat:", error);
    res.status(500).json({ error: error.message });
  }
});

// POST /api/chats/:chatId - Save a message to an existing chat
router.post("/:chatId", verifyUser, async (req: Request, res: Response) => {
  try {
    const { chatId } = req.params;
    const { text, sender } = req.body;

    if (!text || !sender) {
      res.status(400).json({ message: "Text and sender are required" });
      return;
    }

    // Find the chat by ID
    const chat = await Chat.findOne({ _id: chatId, user: req.user._id });
    if (!chat) {
      res.status(404).json({ message: "Chat not found" });
      return;
    }

    // Add the new message to the chat
    chat.messages.push({ sender, text, timestamp: new Date() });
    await chat.save();

    res.status(200).json({ message: "Message saved successfully", chat });
  } catch (error: any) {
    console.error("Error saving message:", error);
    res.status(500).json({ error: error.message });
  }
});

// GET /api/chats - Fetch all chats for the authenticated user
router.get("/", verifyUser, async (req: Request, res: Response) => {
  try {
    const userId = req.user._id;

    // Find all chats for the user
    const chats = await Chat.find({ user: userId }).populate("user", "name email");
    if (!chats || chats.length === 0) {
      res.status(404).json({ message: "No chats found for this user" });
      return;
    }

    res.status(200).json(chats);
  } catch (error: any) {
    console.error("Error fetching chats:", error);
    res.status(500).json({ error: error.message });
  }
});

// GET /api/chats/:chatId - Fetch a specific chat by ID
router.get("/:chatId", verifyUser, async (req: Request, res: Response) => {
  try {
    const { chatId } = req.params;

    // Find the chat by ID
    const chat = await Chat.findOne({ _id: chatId, user: req.user._id }).populate("user", "name email");
    if (!chat) {
      res.status(404).json({ message: "Chat not found" });
      return;
    }

    res.status(200).json(chat);
  } catch (error: any) {
    console.error("Error fetching chat:", error);
    res.status(500).json({ error: error.message });
  }
});

// DELETE /api/chats/:chatId - Delete a specific chat by ID
router.delete("/:chatId", verifyUser, async (req: Request, res: Response) => {
  try {
    const { chatId } = req.params;

    // Delete the chat by ID
    const result = await Chat.findOneAndDelete({ _id: chatId, user: req.user._id });
    if (!result) {
      res.status(404).json({ message: "Chat not found" });
      return;
    }

    res.status(200).json({ message: "Chat deleted successfully" });
  } catch (error: any) {
    console.error("Error deleting chat:", error);
    res.status(500).json({ error: error.message });
  }
});

// DELETE /api/chats - Delete all chats for the authenticated user
router.delete("/", verifyUser, async (req: Request, res: Response) => {
  try {
    const userId = req.user._id;

    // Delete all chats for the user
    const result = await Chat.deleteMany({ user: userId });
    if (result.deletedCount === 0) {
      res.status(404).json({ message: "No chats found to delete" });
      return;
    }

    res.status(200).json({ message: "All chats deleted successfully" });
  } catch (error: any) {
    console.error("Error deleting chats:", error);
    res.status(500).json({ error: error.message });
  }
});

export default router;