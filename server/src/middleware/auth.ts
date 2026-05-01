import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

// Augment Express's Request to include our JWT payload user
declare global {
  namespace Express {
    interface User {
      id: string;
      role: string;
    }
  }
}

export interface AuthRequest extends Request {
  user?: {
    id: string;
    role: string;
  };
}


export const authenticate = (req: AuthRequest, res: Response, next: NextFunction) => {
  const token = req.headers.authorization?.split(" ")[1];

  if (!token) {
    return res.status(401).json({ message: "No token, authorization denied" });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || "fallback_secret") as { id: string; role: string };
    req.user = decoded;
    next();
  } catch (error) {
    res.status(401).json({ message: "Token is not valid" });
  }
};

export const authorize = (roles: string[]) => {
  return (req: AuthRequest, res: Response, next: NextFunction) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({ message: "Access denied: insufficient permissions" });
    }
    next();
  };
};
