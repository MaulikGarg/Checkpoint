import { NextFunction, Request, Response } from "express";
import User, { IUser } from "../models/auth.model";

import jwt, { SignOptions } from "jsonwebtoken";
import { otpEmailTemplate, sendEmail } from "../utils/email.util";

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
    secure: process.env.NODE_ENV === "production",
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

// helper to get 401 unauth res
const unauthorized = (res: Response) =>
  res.status(401).json({ success: false, message: "Invalid credentials" });

export const register = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { name, email, password } = req.body;

    // check if user exists
    if (await User.findOne({ email })) {
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

    const user = await User.findOne({ email }).select("+password");
    if (!user || !(await user.comparePassword(password))) {
      return unauthorized(res);
    }

    sendTokenResponse(user, 200, res);
  } catch (error) {
    next(error);
  }
};

export const logout = (req: Request, res: Response) => {
  res.cookie("token", "", {
    httpOnly: true,
    sameSite: "strict",
    secure: process.env.NODE_ENV === "production",
    expires: new Date(0),
  });
  res.status(200).json({ success: true, message: "Logged out" });
};

export const getMe = (req: Request, res: Response) => {
  res.status(200).json({
    success: true,
    user: {
      id: req.user?._id,
      name: req.user?.name,
      email: req.user?.email,
      role: req.user?.role,
    },
  });
};

// sends the forget password email, use forgotPasswordValidate to compare, forgotPasswordReset to reset
export const forgotPasswordRequest = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({
        success: false,
        message: "Email required",
      });
    }

    const user = await User.findOne({ email }).select("+resetPasswordExpire");

    // * we reply this even if user does not exist to not leak
    if (!user) {
      return res.status(200).json({
        success: true,
        message: "Email sent",
      });
    }

    // block if less than 1 min has passed since last otp generation
    if (user.resetPasswordExpire) {
      const blockuptotime = user.resetPasswordExpire.getTime() - 9 * 60 * 1000;
      if (Date.now() < blockuptotime)
        return res.status(400).json({
          success: false,
          message: "Please wait before generating another OTP",
        });
    }

    const otp = await user.generateotp();

    try {
      await sendEmail({
        to: email,
        subject: "Password Reset OTP",
        html: otpEmailTemplate(otp),
      });
    } catch (emailError) {
      user.resetPasswordOTP = undefined;
      user.resetPasswordExpire = undefined;
      await user.save();
      throw emailError;
    }

    res.status(200).json({
      success: true,
      message: "Email sent",
    });
  } catch (error) {
    next(error);
  }
};

// validates the sent otp, use forgotPasswordRequest for email otp and forgotPasswordReset to reset after validation
export const forgotPasswordValidate = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { email, otp } = req.body;
    if (!email || !otp) {
      return res.status(400).json({
        success: false,
        message: "Invalid credentials",
      });
    }

    const user = await User.findOne({ email }).select(
      "+resetPasswordOTP +resetPasswordExpire +resetPasswordValidated",
    );

    if (!user) {
      return unauthorized(res);
    }

    if (await user.checkotpexpire()) {
      return res.status(403).json({
        success: false,
        message: "OTP has expired, please request a new one.",
      });
    }

    if (!(await user.compareotp(otp))) {
      return unauthorized(res);
    }

    // flag to signal the otp has been validated
    user.resetPasswordValidated = true;
    await user.save();

    res.status(200).json({
      success: true,
    });
  } catch (error) {
    next(error);
  }
};

export const forgotPasswordReset = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { email, newpass } = req.body;
    if (!email || !newpass) {
      return res.status(400).json({
        success: false,
        message: "Invalid credentials",
      });
    }

    const user = await User.findOne({ email }).select(
      "+resetPasswordValidated",
    );

    if (!user || !user.resetPasswordValidated) {
      return unauthorized(res);
    }

    user.password = newpass;
    user.resetPasswordOTP = undefined;
    user.resetPasswordExpire = undefined;
    user.resetPasswordValidated = false;
    await user.save();

    sendTokenResponse(user, 200, res);
  } catch (error) {
    next(error);
  }
};
