import { existsSync } from "node:fs";
import { resolve } from "node:path";
import { acmePricing } from "../domain/acme-config.js";
import { buildApp } from "./app.js";

const webDir = resolve(import.meta.dirname, "../web");
const app = buildApp({
  pricing: acmePricing,
  staticDir: existsSync(webDir) ? webDir : undefined,
  logger: true,
});

await app.listen({ port: Number(process.env.PORT ?? 3000), host: "0.0.0.0" });
