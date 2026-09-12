import express from "express";
import cors from "cors";
import "dotenv/config";

import questRouter from "./routes/quest.js";
import aiRouter from "./routes/ai.js";

const app = express();

const PORT = process.env.PORT || 3000;

app.use(cors());

app.use(express.json());

app.get("/", (_req, res) => {
  res.json({
    name: "Life RPG API",
    status: "online",
  });
});

app.get("/health", (_req, res) => {
  res.json({
    status: "ok",
  });
});

app.use("/api/quests", questRouter);

app.use("/api/ai", aiRouter);

app.listen(PORT, () => {
  console.log(`Life RPG API running on http://localhost:${PORT}`);
});
