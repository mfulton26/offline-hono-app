import * as esbuild from "esbuild";
import { TsconfigRaw } from "esbuild";
import { denoPlugins } from "esbuild-deno-loader";
import config from "./deno.json" with { type: "json" };

import { Hono } from "hono";
import { logger } from "hono/logger";
import { serveStatic } from "hono/serve-static";

import rootApp from "./routes.tsx";

await esbuild.build({
  plugins: [
    ...denoPlugins({
      importMapURL: new URL("./importMap.json", import.meta.url).href,
    }),
  ],
  entryPoints: [
    "./install.ts",
    "./sw.ts",
  ],
  bundle: true,
  minify: true,
  format: "esm",
  outdir: "dist",
  splitting: true,
  tsconfigRaw: {
    compilerOptions: config.compilerOptions as TsconfigRaw["compilerOptions"],
  },
});

const app = new Hono()
  .use(logger())
  .route("/", rootApp)
  .get("*", serveStatic({ root: "./dist" }));

Deno.serve(app.fetch);
