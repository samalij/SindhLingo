import mongoose, { Document, Schema } from "mongoose";

export interface IUser extends Document {
  name: string;
  email: string;
  password: string;
  quizzes: mongoose.Types.ObjectId[]; // Array of Quiz IDs
}

const UserSchema = new Schema<IUser>({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  quizzes: [{ type: mongoose.Schema.Types.ObjectId, ref: "Quiz" }], // Reference to Quiz model
});

export default mongoose.model<IUser>("User", UserSchema);