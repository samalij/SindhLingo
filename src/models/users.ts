import mongoose, { Document, Schema } from "mongoose";

export interface IUser extends Document {
  name: string;
  email: string;
  password: string;
  quizzes: mongoose.Types.ObjectId[]; // Array of Quiz IDs
  isAdmin: boolean; // Flag to indicate if the user is an admin
}

const UserSchema = new Schema<IUser>({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  quizzes: [{ type: mongoose.Schema.Types.ObjectId, ref: "Quiz" }], // Reference to Quiz model
  isAdmin: { type: Boolean, default: false }, // Default is regular user
});

export default mongoose.model<IUser>("User", UserSchema);