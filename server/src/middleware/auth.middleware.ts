import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import User, { IUser } from "../models/user.model";

// extend Express's Request type to include our user as type IUser
declare global {
  namespace Express {
    interface Request {
      user?: IUser;
    }
  }
}

export const protect = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const token = req.cookies.token;

    // if no token, kick out
    if (!token) {
      return res.status(401).json({
        success: false,
        message: "No auth, no token",
      });
    }

    const decodedToken = jwt.verify(
      token,
      process.env.JWT_SECRET as string,
    ) as { id: string };

    const user = await User.findById(decodedToken.id);
    if (!user) {
      return res.status(401).json({
        success: false,
        message: "No auth, user not found",
      });
    }

    req.user = user;
    next();
  } catch (error) {
    next(error);
  }
};

// role based authorization
export const authorize = (...roles: string[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: `Role '${req.user?.role}' is not authorized to access this route`,
      });
    }
    next();
  };
};
