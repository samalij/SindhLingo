import express, { Request, Response } from 'express';
import Quiz from '../models/quiz';

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


router.get('/quizzes', async (req: Request, res: Response) => {
    try {
      const { class: quizClass, subject } = req.query;
  
      // Build the query dynamically
      const query: any = {};
      if (quizClass) query.class = quizClass;
      if (subject) query["subjects.subject"] = subject;
  
      const quizzes = await Quiz.find(query);
      if (quizzes.length === 0) {
        res.status(404).json({ message: 'No quizzes found for the given class and subject' });
      }
  
      res.status(200).json(quizzes);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });
// POST /api/admin/quizzes - Add a new quiz
router.post('/quizzes', async (req: Request, res: Response) => {
  try {
    const { quiz_id, class: quizClass, subjects } = req.body;

    // Check if quiz_id already exists
    const existingQuiz = await Quiz.findOne({ quiz_id });
    if (existingQuiz) {
       res.status(400).json({ error: 'Quiz with this quiz_id already exists' });
       return ;
    }

    const quiz = new Quiz({ quiz_id, class: quizClass, subjects });
    await quiz.save();
    res.status(201).json({ message: 'Quiz added successfully', quiz });
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

// DELETE /api/admin/quizzes/:quiz_id - Remove a quiz
router.delete('/quizzes/:quiz_id', async (req: Request, res: Response) => {
  try {
    const { quiz_id } = req.params;

    const deletedQuiz = await Quiz.findOneAndDelete({ quiz_id });
    if (!deletedQuiz) {
        res.status(404).json({ message: 'Quiz not found' });
        return ;
    }

    res.status(200).json({ message: 'Quiz removed successfully', deletedQuiz });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// PUT /api/admin/quizzes/:quiz_id - Update a quiz (add/remove/update questions)
router.put('/quizzes/:quiz_id', async (req: Request, res: Response) => {
  try {
    const { quiz_id } = req.params;
    const { subject, action, questionId, question } = req.body;

    if (!subject) {
       res.status(400).json({ error: 'Subject is required' });
       return;
    }

    let updatedQuiz;

    // Handle different actions: add, remove, or update questions
    if (action === 'add') {
      if (!question) {
        res.status(400).json({ error: 'Question data is required for adding' });
        return ;
      }

      updatedQuiz = await Quiz.findOneAndUpdate(
        { quiz_id, "subjects.subject": subject },
        { $push: { "subjects.$.questions": question } },
        { new: true }
      );
    } else if (action === 'remove') {
      if (!questionId) {
        res.status(400).json({ error: 'Question ID is required for removing' });
        return ;
      }

      updatedQuiz = await Quiz.findOneAndUpdate(
        { quiz_id, "subjects.subject": subject },
        { $pull: { "subjects.$.questions": { _id: questionId } } },
        { new: true }
      );
    } else if (action === 'update') {
      if (!questionId || !question) {
        res.status(400).json({ error: 'Question ID and updated question data are required for updating' });
        return ;
      }

      updatedQuiz = await Quiz.findOneAndUpdate(
        { quiz_id, "subjects.subject": subject },
        { $set: { "subjects.$.questions.$[q]": question } },
        {
          new: true,
          arrayFilters: [{ "q._id": questionId }],
        }
      );
    } else {
        res.status(400).json({ error: 'Invalid action. Use "add", "remove", or "update"' });
        return;
    }

    if (!updatedQuiz) {
        res.status(404).json({ message: 'Quiz or subject not found' });
        return;
    }

    res.status(200).json({ message: 'Quiz updated successfully', updatedQuiz });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

export default router; 