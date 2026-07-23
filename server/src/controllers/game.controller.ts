import { NextFunction, Request, Response } from "express";
import Game, { Genre, Platform } from "../models/game.model";

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

// fetch all games, or at filter
export const getGames = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { genre, platform, atDiscount, page, limit } = req.query;
    const filter: Record<string, any> = {};

    // apply filters whilst validating them

    if (genre) {
      if (Object.values(Genre).includes(genre as Genre)) {
        filter.genre = genre;
      } else {
        return res.status(400).json({
          success: false,
          message: `Genre filter ${genre} doesn't exist.`,
        });
      }
    }

    if (platform) {
      if (Object.values(Platform).includes(platform as Platform)) {
        filter.platform = platform;
      } else {
        return res.status(400).json({
          success: false,
          message: `Platform filter ${platform} doesn't exist.`,
        });
      }
    }

    if (atDiscount) {
      if (atDiscount === "true" || atDiscount === "false") {
        //atDiscount gets true if value === "true"
        filter.atDiscount = atDiscount === "true";
      } else {
        return res.status(400).json({
          success: false,
          message: `Discount filter ${atDiscount} is invalid.`,
        });
      }
    }

    const pageInt = parseInt(page as string) || 1;
    // hard limit of 32 to not accidentally overload
    const limitInt = Math.min(parseInt(limit as string) || 8, 32);
    const skipCount = (pageInt - 1) * limitInt;

    const [games, totalCount] = await Promise.all([
      Game.find(filter).skip(skipCount).limit(limitInt),
      Game.countDocuments(filter),
    ]);

    res.status(200).json({
      success: true,
      data: games,
      count: games.length,
      pagination: {
        page: pageInt,
        limit: limitInt,
        totalCount,
        totalPages: Math.ceil(totalCount / limitInt),
      },
    });
  } catch (error) {
    next(error);
  }
};

// fetch a specific game
export const getGameById = async (
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
