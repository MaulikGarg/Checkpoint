import { Router } from "express";
import {
  createGame,
  getGameById,
  getGames,
  updateGame,
  deleteGame,
} from "../controllers/game.controller";

const router = Router();

// all these routes fall under /api/games
router.get("/", getGames);
router.get("/:id", getGameById);
router.post("/", createGame);
router.put("/", updateGame);
router.delete("/", deleteGame);

export default router;
