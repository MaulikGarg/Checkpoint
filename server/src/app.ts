import express from "express";
import gameRoutes from "./routes/game.routes";
import { notFound, errorHandler } from "./middleware/error.middleware";
import cookieParser from "cookie-parser";

const app = express();

app.use(express.json());
app.use(cookieParser());
// routes
app.use("/api/games", gameRoutes);

// invalidation handlers
app.use(notFound); // throws the 404
app.use(errorHandler);

app.get("/", (req, res) => {
  res.status(200).send("The server is running.");
});

export default app;
