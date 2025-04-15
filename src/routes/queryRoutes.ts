import express, { Request, Response } from "express";
import Query from "../models/query";

const router = express.Router();

router.post("/", async (req: Request, res: Response) => {
  try {
    const { name, email, query } = req.body;

    if (!name || !email || !query) {
      res.status(400).json({ 
        success: false,
        message: "Name, email, and query are required" 
      });
      return;
    }

    const newQuery = new Query({ name, email, query });
    await newQuery.save();

    res.status(201).json({ 
      success: true,
      message: "Query submitted successfully", 
      data: newQuery 
    });
    return;

  } catch (error: any) {
    console.error("Error saving query:", error);
    res.status(500).json({ 
      success: false,
      message: "Internal server error",
      error: error.message 
    });
    return;
  }
});

export default router;