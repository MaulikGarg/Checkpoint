import { NextFunction, Request, Response } from "express";
import Game from "../models/game.model";

// create a game in db
export const createGame = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const game = await Game.create(req.body);
    res.status(201).json({
      success: true,
      message: "Game created",
      data: game,
    });
  } catch (error) {
    next(error);
  }
};

// fetch all games
export const getGames = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const games = await Game.find();
    res.status(200).json({
      success: true,
      data: games,
      count: games.length,
    });
  } catch (error) {
    next(error);
  }
};

// fetch a specific game
export const getGame = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const game = await Game.findById(req.params.id);

    if (!game) {
      return res.status(404).json({
        success: false,
        message: "Game not found",
      });
    }

    res.status(200).json({
      success: true,
      data: game,
    });
  } catch (error) {
    next(error);
  }
};

export const updateGame = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const game = await Game.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    if (!game) {
      return res.status(404).json({
        success: false,
        message: "Game not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Game Updated",
      data: game,
    });
  } catch (error) {
    next(error);
  }
};

export const deleteGame = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    // returns the deleted game
    const game = await Game.findByIdAndDelete(req.params.id);

    if (!game) {
      return res.status(404).json({
        success: false,
        message: "Game not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Game deleted",
      data: game,
    });
  } catch (error) {
    next(error);
  }
};
