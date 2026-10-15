import express from "express";
import { cardsRouter } from "./routes/cards.js";
import { taxonomy } from "./taxonomy.js";

export function createApp() {
  const app = express();
  app.disable("x-powered-by");
  app.use(express.json({ limit: "100kb" }));
  app.use("/api", (_req, res, next) => {
    res.set("Cache-Control", "no-store");
    next();
  });

  app.get("/api/health", (_req, res) => {
    res.json({ ok: true });
  });

  app.get("/api/taxonomy", (_req, res) => {
    res.json(taxonomy);
  });

  app.use("/api/cards", cardsRouter);

  app.use("/api", (_req, res) => {
    res.status(404).json({ error: "Not found." });
  });

  app.use((error, _req, res, _next) => {
    console.error(error);
    if (error.code === "23514") {
      return res.status(400).json({
        error: "This card could not be saved. Check the entered values.",
      });
    }
    res.status(500).json({ error: "Something went wrong." });
  });

  return app;
}
