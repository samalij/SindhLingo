import mongoose, { Schema, Document } from "mongoose";
import mongooseSequence from "mongoose-sequence"; // Import mongoose-sequence for auto-increment

const AutoIncrement = mongooseSequence(mongoose);

// Define interfaces
export interface IQuestion {
  question: string;
  options: string[];
  correctAnswer: string;
}

export interface ISubject {
  subject: string;
  questions: IQuestion[];
}

export interface IQuiz extends Document {
  quiz_id: number; // Auto-incremented quiz ID
  class: string;
  subjects: ISubject[];
  attempted: boolean; // Indicates if the quiz was attempted
  usersAttempted: mongoose.Types.ObjectId[]; // Array of user IDs who attempted the quiz
}

// Define schemas
const questionSchema = new Schema<IQuestion>({
  question: { type: String, required: true },
  options: [{ type: String, required: true }],
  correctAnswer: { type: String, required: true },
});

const subjectSchema = new Schema<ISubject>({
  subject: { type: String, required: true },
  questions: { type: [questionSchema], required: true },
});

const quizSchema = new Schema<IQuiz>({
  quiz_id: { type: Number, unique: true }, // Auto-incremented field
  class: { type: String, required: true },
  subjects: { type: [subjectSchema], required: true },
  attempted: { type: Boolean, default: false }, // Default is false
  usersAttempted: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }], // Track users who attempted the quiz
});

// Apply auto-increment plugin to quizSchema
quizSchema.plugin(AutoIncrement as any, { inc_field: "quiz_id" });

// Export the Quiz model
export default mongoose.model<IQuiz>("Quiz", quizSchema);