import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import quizRoutes from "./routes/quizroute";
import adminRoutes from "./routes/adminroutes";
import authRoutes from "./routes/auth";
import chatRoutes from "./routes/chatRoute";
import queryRoutes from "./routes/queryRoutes"; // Import chat routes

const app = express();

// Middleware
app.use(express.json());

// Configure CORS
app.use(
  cors({
    origin: "http://localhost:5173", // Replace with your frontend's URL
    credentials: true, // Allow credentials (cookies, authorization headers, etc.)
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"], // Allowed HTTP methods
    allowedHeaders: ["Content-Type", "Authorization"], // Allowed headers
  })
);

// MongoDB Connection
mongoose
  .connect("mongodb+srv://AleenaAbbasi:aleenaabbasi@cluster0.ue7gr7d.mongodb.net/")
  .then(() => console.log("MongoDB connected"))
  .catch((err) => console.error("MongoDB connection error:", err));

// Routes
app.use("/api/quizzes", quizRoutes);
app.use("/api/admin/", adminRoutes);
app.use("/api/auth/", authRoutes);
app.use("/api/chats", chatRoutes); // Add chat routes
app.use("/api/queries", queryRoutes);
// Server Configuration
const PORT = process.env.PORT || 2000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));