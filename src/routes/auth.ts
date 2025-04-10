import express from "express";
import { signup, signin } from "../controllers/authController";

const router = express.Router();

// Explicitly type the routes
router.post("/signup", signup as express.RequestHandler);
router.post("/signin", signin as express.RequestHandler);

export default router;