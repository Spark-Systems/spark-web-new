// Loads backend/.env before anything reads process.env.
import "./env";

import { createServer } from "node:http";

import { config } from "./config";
import { nodeHandler } from "./http/node";
import { handleRequest } from "./http/app";

const server = createServer(nodeHandler(handleRequest));

server.listen(config.port, config.host, () => {
  console.log(`[backend] listening on http://${config.host}:${config.port}`);
  console.log(`[backend] data: ${config.dataDir}`);
  console.log(`[backend] uploads: ${config.uploadsDir}`);
  if (!config.sharedSecret) console.warn("[backend] SPARK_SHARED_SECRET is not set: publishing won't refresh the website.");
});

// Windows services (NSSM) and Ctrl+C: finish open requests, then exit.
for (const signal of ["SIGINT", "SIGTERM"] as const) {
  process.on(signal, () => {
    server.close(() => process.exit(0));
    setTimeout(() => process.exit(0), 5000).unref();
  });
}
