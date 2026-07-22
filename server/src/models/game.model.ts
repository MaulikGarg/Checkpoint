import mongoose, { Schema, Document } from "mongoose";

// enums to be used in a game's def
export enum Genre {
  RPG = "RPG",
  Action = "Action",
  Shooter = "Shooter",
  Puzzle = "Puzzle",
  Sports = "Sports",
}

export enum Platform {
  PS5 = "PS5",
  Xbox = "Xbox",
  PC = "PC",
  Switch = "Switch",
}

// define a game's "type"
export interface IGame extends Document {
  title: string;
  description: string;
  price: number;
  genre: Genre;
  platform: Platform;
  image: string;
}

// NOTE IF ANY CHANGES:
// follow project convention: <Name>: <type>, <required>, <others>
const gameSchema = new mongoose.Schema<IGame>(
  {
    title: { type: String, required: true },
    description: { type: String, required: false, default: "A game." },
    price: { type: Number, required: true },
    genre: { type: String, required: true, enum: Object.values(Genre) },
    platform: { type: String, required: true, enum: Object.values(Platform) },
    image: { type: String, required: false, default: "" },
  },
  { timestamps: true },
);

export default mongoose.model<IGame>("Game", gameSchema);
