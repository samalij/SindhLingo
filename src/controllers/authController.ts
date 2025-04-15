import { Request, Response } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import User from "../models/users";
import { RequestHandler } from "express";

const JWT_SECRET = process.env.JWT_SECRET || "secret";

export const signup = async (req: Request, res: Response) => {
  try {
    const { name, email, password } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "User already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = new User({ name, email, password: hashedPassword });
    await user.save();

    // Generate a JWT token
    const token = jwt.sign({ id: user._id }, JWT_SECRET, { expiresIn: "7d" });

    res.status(201).json({ message: "User registered successfully", token, user });
  } catch (error: any) {
    res.status(500).json({ message: "Something went wrong", error: error.message });
  }
};

export const signin = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    // Generate a JWT token
    const token = jwt.sign({ id: user._id, isAdmin: user.isAdmin }, JWT_SECRET, { expiresIn: "7d" });

    res.status(200).json({
      token,
      user: { id: user._id, name: user.name, email: user.email, isAdmin: user.isAdmin },
    });
  } catch (error: any) {
    res.status(500).json({ message: "Something went wrong", error: error.message });
  }
};