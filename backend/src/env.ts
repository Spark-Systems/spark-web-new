import { existsSync } from "node:fs";

// Imported first by main.ts: settings from backend/.env (when present) are in
// place before any module reads process.env. Real environment variables win.
if (existsSync(".env")) process.loadEnvFile(".env");
