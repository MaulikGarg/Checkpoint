import { Router } from "express";
import {
  register,
  login,
  logout,
  getMe,
  forgotPasswordRequest,
  forgotPasswordValidate,
  forgotPasswordReset,
} from "../controllers/auth.controller";
import { protect } from "../middleware/auth.middleware";
const router = Router();

router.get("/me", protect, getMe);
router.post("/register", register);
router.post("/login", login);
router.post("/logout", logout);

router.post("/forgot-password", forgotPasswordRequest);
router.post("/forgot-password/validate", forgotPasswordValidate);
router.post("/forgot-password/reset", forgotPasswordReset);
export default router;
