import { NextFunction, Request, Response } from "express";
import User, { IUser } from "../models/user.model";

import jwt, { SignOptions } from "jsonwebtoken";

// helper to get jwt
export const generateToken = (user: IUser): string => {
  const secret: string = process.env.JWT_SECRET as string;
  // sign options is the jwt type
  const options: SignOptions = {
    expiresIn: (process.env.JWT_EXPIRE || "30d") as SignOptions["expiresIn"],
  };

  return jwt.sign({ id: user._id }, secret, options);
};

// helper to send reply and send an http cookie
export const sendTokenResponse = (
  user: IUser,
  statusCode: number,
  res: Response,
) => {
  res.cookie("token", generateToken(user), {
    httpOnly: true, // makes it so client side js cannot access (prevents XSS attack)
    sameSite: "strict", // makes it so only "this" site can access (prevents CSRF attack)
    maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
  });

  res.status(statusCode).json({
    success: true,
    user: {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
    },
  });
};

export const register = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { name, email, password } = req.body;

    // check if user exists
    if (await User.findOne({ email: email })) {
      return res.status(400).json({
        success: false,
        message: "Email already exists",
      });
    }

    const user = await User.create({ name, email, password });
    sendTokenResponse(user, 201, res);
  } catch (error) {
    next(error);
  }
};

export const login = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Email & Password requried",
      });
    }

    const user = await User.findOne({ email: email });
    if (!user || !(await user.comparePassword(password))) {
      return res.status(401).json({
        success: false,
        message: "Invalid credentials",
      });
    }

    sendTokenResponse(user, 200, res);
  } catch (error) {
    next(error);
  }
};
