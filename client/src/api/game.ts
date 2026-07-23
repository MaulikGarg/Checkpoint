import api from "./axios";
import type { Game } from "../types/game";

export const getGames = async (): Promise<Game[]> => {
  const res = await api.get("/games");
  return res.data.data;
};
