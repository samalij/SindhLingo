import mongoose, { Schema, Document } from "mongoose";

export interface IMessage {
  sender: "user" | "bot"; // Indicates if the message is from the user or the bot
  text: string; // The content of the message
  timestamp: Date; // When the message was sent
}

export interface IChat extends Document {
  user: mongoose.Types.ObjectId; // Reference to the User model
  messages: IMessage[]; // Array of messages in the chat
}

const messageSchema = new Schema<IMessage>({
  sender: { type: String, enum: ["user", "bot"], required: true },
  text: { type: String, required: true },
  timestamp: { type: Date, default: Date.now },
});

const chatSchema = new Schema<IChat>({
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  messages: { type: [messageSchema], required: true },
});



export default mongoose.model<IChat>("Chat", chatSchema);