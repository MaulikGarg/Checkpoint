import { Router } from "express";
import {
  createGame,
  getGameById,
  getGames,
  updateGame,
  deleteGame,
} from "../controllers/game.controller";

import { protect, authorize } from "../middleware/auth.middleware";

const router = Router();

// all these routes fall under /api/games
router.get("/", getGames);
router.get("/:id", getGameById);

// authorized calls
router.post("/", protect, authorize("admin"), createGame);
router.put("/", protect, authorize("admin"), updateGame);
router.delete("/", protect, authorize("admin"), deleteGame);

export default router;
