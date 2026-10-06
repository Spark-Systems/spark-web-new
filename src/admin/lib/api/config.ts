export const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? "https://api.spark-sys.com/v1"

/** Serve every request from the in-memory mock backend (lib/api/mock) instead of the network. */
export const USE_MOCK_API = process.env.NEXT_PUBLIC_USE_MOCK_API !== "false"
