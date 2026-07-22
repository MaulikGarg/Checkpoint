import { Router } from "express";
import { register, login, logout, getMe } from "../controllers/auth.controller";
import { protect } from "../middleware/auth.middleware";
const router = Router();

router.get("/me", protect, getMe);
router.post("/register", register);
router.post("/login", login);
router.post("/logout", logout);

export default router;
