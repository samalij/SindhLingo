import express, { Request, Response } from "express";
import Quiz from "../models/quiz";
import Query from "../models/query"; // Import the Query model
import { verifyAdmin } from "../middleware/authMiddleware"; // Middleware to verify admin access

const router = express.Router();

// Define the request body type for adding a quiz
interface QuizRequestBody {
  quiz_id: number;
  class: string;
  subjects: Array<{
    subject: string;
    questions: Array<{
      question: string;
      options: string[];
      correctAnswer: string;
    }>;
  }>;
}

// ==================== QUIZ ROUTES ====================

// GET /api/admin/quizzes - Fetch all quizzes
router.get("/quizzes", async (req: Request, res: Response) => {
  try {
    const { class: quizClass, subject } = req.query;

    // Build the query dynamically
    const query: any = {};
    if (quizClass) query.class = quizClass;
    if (subject) query["subjects.subject"] = subject;

    const quizzes = await Quiz.find(query);
    if (quizzes.length === 0) {
      res.status(404).json({ message: "No quizzes found for the given class and subject" });
    }

    res.status(200).json(quizzes);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// POST /api/admin/quizzes - Add a new quiz
router.post("/quizzes", async (req: Request, res: Response) => {
  try {
    const { quiz_id, class: quizClass, subjects } = req.body;

    // Check if quiz_id already exists
    const existingQuiz = await Quiz.findOne({ quiz_id });
    if (existingQuiz) {
      res.status(400).json({ error: "Quiz with this quiz_id already exists" });
      return;
    }

    const quiz = new Quiz({ quiz_id, class: quizClass, subjects });
    await quiz.save();
    res.status(201).json({ message: "Quiz added successfully", quiz });
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

// DELETE /api/admin/quizzes/:quiz_id - Remove a quiz
router.delete("/quizzes/:quiz_id", async (req: Request, res: Response) => {
  try {
    const { quiz_id } = req.params;

    const deletedQuiz = await Quiz.findOneAndDelete({ quiz_id });
    if (!deletedQuiz) {
      res.status(404).json({ message: "Quiz not found" });
      return;
    }

    res.status(200).json({ message: "Quiz removed successfully", deletedQuiz });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// PUT /api/admin/quizzes/:quiz_id - Update a quiz (add/remove/update questions)
router.put("/quizzes/:quiz_id", async (req: Request, res: Response) => {
  try {
    const { quiz_id } = req.params;
    const { class: quizClass, subjects } = req.body;

    if (!quizClass || !subjects) {
      res.status(400).json({ error: "Class and subjects are required" });
      return;
    }

    const updatedQuiz = await Quiz.findOneAndUpdate(
      { quiz_id },
      { class: quizClass, subjects },
      { new: true }
    );

    if (!updatedQuiz) {
      res.status(404).json({ message: "Quiz not found" });
      return;
    }

    res.status(200).json({ message: "Quiz updated successfully", updatedQuiz });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});
// ==================== QUERY ROUTES ====================

// GET /api/admin/queries - Retrieve all queries (Admin only)
router.get("/queries", verifyAdmin, async (req: Request, res: Response) => {
  try {
    const queries = await Query.find().sort({ createdAt: -1 }); // Sort by most recent
    res.status(200).json(queries);
  } catch (error: any) {
    console.error("Error fetching queries:", error);
    res.status(500).json({ error: error.message });
  }
});

// GET /api/admin/queries/:id - Retrieve a specific query by ID (Admin only)
router.get("/queries/:id", verifyAdmin, async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const query = await Query.findById(id);
    if (!query) {
      res.status(404).json({ message: "Query not found" });
      return;
    }

    res.status(200).json(query);
  } catch (error: any) {
    console.error("Error fetching query:", error);
    res.status(500).json({ error: error.message });
  }
});

// DELETE /api/admin/queries/:id - Delete a specific query by ID (Admin only)
router.delete("/queries/:id", verifyAdmin, async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const deletedQuery = await Query.findByIdAndDelete(id);
    if (!deletedQuery) {
      res.status(404).json({ message: "Query not found" });
      return;
    }

    res.status(200).json({ message: "Query deleted successfully" });
  } catch (error: any) {
    console.error("Error deleting query:", error);
    res.status(500).json({ error: error.message });
  }
});

export default router;