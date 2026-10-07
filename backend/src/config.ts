import path from "node:path";

/** A folder from an environment variable, resolved against the folder the backend runs from. */
const folder = (value: string | undefined, fallback: string) => path.resolve(value || fallback);

/**
 * The backend's settings, from environment variables (or backend/.env; see
 * .env.example for every option).
 */
export const config = {
  /** Port and address to listen on. Keep 127.0.0.1 behind IIS so only the server itself can reach it. */
  port: Number(process.env.PORT) || 4000,
  host: process.env.HOST || "127.0.0.1",
  /** Content documents (JSON), user accounts, messages, backups. */
  dataDir: folder(process.env.SPARK_DATA_DIR, "data"),
  /** Uploaded pictures, served at /uploads/... */
  uploadsDir: folder(process.env.SPARK_UPLOADS_DIR, "uploads"),
  /** The website (frontend), told to refresh its cached pages after each publish. */
  frontendUrl: (process.env.FRONTEND_URL || "http://127.0.0.1:3000").replace(/\/+$/, ""),
  /**
   * Shared with the frontend: it signs the backend's "refresh" calls to the
   * website, and lets the website read drafts for preview mode.
   */
  sharedSecret: process.env.SPARK_SHARED_SECRET || "",
};
