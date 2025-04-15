import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import User from "../models/users";

const JWT_SECRET = process.env.JWT_SECRET || "secret";

// Add user property to Request type
declare global {
  namespace Express {
    interface Request {
      user?: any; // Consider replacing 'any' with your User type
    }
  }
}



interface DecodedToken {
    id: string;
    iat: number;
    exp: number;
  }
  
  export const verifyUser = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const token = req.headers.authorization?.split(" ")[1];
      if (!token) {
        res.status(401).json({ message: "Unauthorized. Token is missing." });
        return; // This is okay because it's just an early return
      }
  
      const decoded = jwt.verify(token, JWT_SECRET) as DecodedToken;
      const user = await User.findById(decoded.id).select('-password');
      
      if (!user) {
        res.status(401).json({ message: "Unauthorized. User not found." });
        return; // Same here
      }
  
      req.user = user;
      next();
    } catch (error) {
      console.error("JWT Error:", error);
      res.status(401).json({ message: "Invalid or expired token." });
    }
  };

  export const verifyAdmin = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const token = req.headers.authorization?.split(" ")[1];
      if (!token) {
        res.status(401).json({ message: "Unauthorized" });
        return;
      }
  
      const decoded: any = jwt.verify(token, JWT_SECRET);
      const user = await User.findById(decoded.id);
  
      if (!user || !user.isAdmin) {
        res.status(403).json({ message: "Access denied. Admins only." });
        return;
      }
  
      req.user = user;
      next();
    } catch (error) {
      res.status(401).json({ message: "Invalid token" });
    }
  };