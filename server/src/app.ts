import express from "express";
import gameRoutes from "./routes/game.routes";
import { notFound, errorHandler } from "./middleware/error.middleware";
import cookieParser from "cookie-parser";
import authRoutes from "./routes/auth.routes";

const app = express();

app.use(express.json());
app.use(cookieParser());

app.get("/", (req, res) => {
  res.status(200).send("The server is running.");
});

// routes
app.use("/api/games", gameRoutes);
app.use("/api/auth", authRoutes);

// invalidation handlers
app.use(notFound); // throws the 404
app.use(errorHandler);

export default app;
