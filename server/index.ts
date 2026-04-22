import "dotenv/config";
import express from "express";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";
import { toNodeHandler } from "better-auth/node";
import { auth } from "./auth.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

// CORS — allow Vite dev server + Railway production domain
const allowedOrigins = ["http://localhost:5173", "http://localhost:5174"];
if (process.env.RAILWAY_PUBLIC_DOMAIN) {
  allowedOrigins.push(`https://${process.env.RAILWAY_PUBLIC_DOMAIN}`);
}

app.use(
  cors({
    origin: allowedOrigins,
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

// Serve static files from Vite build output
app.use(express.static(path.join(__dirname, "../dist")));

// Catch-all — serves index.html for client-side routing
app.get("{*splat}", (_req, res) => {
  res.sendFile(path.join(__dirname, "../dist/index.html"));
});

app.listen(PORT, () => {
  console.log(`🔐 Auth server running on http://localhost:${PORT}`);
  console.log(`   Auth endpoint: http://localhost:${PORT}/api/auth`);
});
