import "dotenv/config";
import express from "express";
import cors from "cors";
import { toNodeHandler } from "better-auth/node";
import { auth } from "./auth.js";

const app = express();
const PORT = process.env.PORT || 3000;

// CORS — allow Vite dev server
app.use(
  cors({
    origin: ["http://localhost:5173", "http://localhost:5174"],
    credentials: true,
  })
);

// Mount Better Auth handler on /api/auth/*
// Must be before express.json() to handle its own body parsing
app.all("/api/auth/{*splat}", toNodeHandler(auth));

// JSON parsing for any other routes
app.use(express.json());

// Health check
app.get("/health", (_req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

app.listen(PORT, () => {
  console.log(`🔐 Auth server running on http://localhost:${PORT}`);
  console.log(`   Auth endpoint: http://localhost:${PORT}/api/auth`);
});
