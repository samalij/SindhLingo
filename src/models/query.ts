import mongoose, { Schema, Document } from "mongoose";

export interface IQuery extends Document {
  name: string; // User's name
  email: string; // User's email
  query: string; // User's query message
  createdAt: Date; // Timestamp when the query was created
}

const querySchema = new Schema<IQuery>({
  name: { type: String, required: true },
  email: { type: String, required: true },
  query: { type: String, required: true },
  createdAt: { type: Date, default: Date.now }, // Automatically set the timestamp
});

export default mongoose.model<IQuery>("Query", querySchema);