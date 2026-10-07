// Bundles the backend (and the code it shares with the website) into
// dist/server.mjs. Deploy dist/ with package.json, then `npm ci --omit=dev`
// for the few native packages kept out of the bundle.
import { build } from "esbuild";

await build({
  entryPoints: ["src/main.ts"],
  outfile: "dist/server.mjs",
  bundle: true,
  platform: "node",
  target: "node22",
  format: "esm",
  sourcemap: true,
  tsconfig: "tsconfig.json",
  // Native or heavy packages load from node_modules at runtime.
  external: ["sharp", "@google-analytics/data"],
  // Some bundled CommonJS code calls require(); give ESM output one.
  banner: { js: 'import { createRequire } from "node:module"; const require = createRequire(import.meta.url);' },
  logLevel: "info",
});
