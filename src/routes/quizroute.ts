import express, { Request, Response } from "express";
import Quiz from "../models/quiz";
import { verifyUser } from "../middleware/authMiddleware";
import mongoose from "mongoose";
const router = express.Router();

// GET /api/quizzes - Fetch quizzes by class and subject (Protected)
router.get("/", verifyUser, async (req: Request, res: Response) => {
  console.log("Received request with query:", req.query);
  console.log("Authenticated user:", req.user?._id);

  try {
    if (!req.user?._id) {
      console.log("No user ID found");
      res.status(400).json({ error: "User authentication failed" });
      return;
    }

    const { class: quizClass, subject } = req.query;
    console.log("Processing query for class:", quizClass, "subject:", subject);

    // Simple query builder
    const query: any = {};
    if (quizClass) query.class = quizClass;
    if (subject) {
      query["subjects.subject"] = { $regex: subject, $options: 'i' };
    }

    console.log("Final query:", JSON.stringify(query, null, 2));

    const quizzes = await Quiz.find(query).lean();
    console.log(`Found ${quizzes.length} quizzes`);

    const userId = req.user._id.toString();
    const result = quizzes.map(quiz => ({
      ...quiz,
      attempted: quiz.usersAttempted?.some(id => id.toString() === userId) || false
    }));

    res.status(200).json(result);
    return;

  } catch (error: any) {
    console.error("SERVER ERROR DETAILS:", {
      message: error.message,
      stack: error.stack,
      fullError: error
    });
    res.status(500).json({ 
      error: "Database operation failed",
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
    return;
  }
});
// POST /api/quizzes/:quiz_id/attempt - Mark a quiz as attempted
router.post("/:quiz_id/attempt", verifyUser, async (req: Request, res: Response) => {
  try {
    const { quiz_id } = req.params;
    const userId = req.user._id; // Get the signed-in user's ID

    // Find the quiz
    const quiz = await Quiz.findOne({ quiz_id });
    if (!quiz) {
      res.status(404).json({ message: "Quiz not found" });
      return;
    }

    // Check if the user has already attempted the quiz
    if (quiz.usersAttempted.includes(userId)) {
      res.status(400).json({ message: "You have already attempted this quiz" });
      return;
    }

    // Mark the quiz as attempted for this user
    quiz.usersAttempted.push(userId);
    await quiz.save();

    res.status(200).json({ message: "Quiz marked as attempted", quiz });
  } catch (error: any) {
    console.error("Error marking quiz as attempted:", error);
    res.status(500).json({ error: error.message });
  }
});
// GET /api/quizzes/:quiz_id - Fetch a specific quiz by quiz_id (Protected)
router.get("/:quiz_id", verifyUser, async (req: Request, res: Response) => {
  try {
    const { quiz_id } = req.params;

    const quiz = await Quiz.findOne({ quiz_id });
    if (!quiz) {
      res.status(404).json({ message: "Quiz not found" });
      return;
    }

    res.status(200).json(quiz);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

export default router;