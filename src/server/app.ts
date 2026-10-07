import fastifyStatic from "@fastify/static";
import Fastify, { type FastifyInstance } from "fastify";
import { Basket, type PricingRules } from "../domain/basket.js";
import { UnknownProductError } from "../domain/catalogue.js";

/** Dependencies and optional static assets for an HTTP adapter. */
export interface AppOptions {
  readonly pricing: PricingRules;
  readonly staticDir?: string;
  readonly logger?: boolean;
}

const quoteBody = {
  type: "object",
  required: ["items"],
  additionalProperties: false,
  properties: { items: { type: "array", items: { type: "string" } } },
} as const;

export function buildApp({ pricing, staticDir, logger = false }: AppOptions): FastifyInstance {
  const app = Fastify({
    logger,
    ajv: { customOptions: { coerceTypes: false, removeAdditional: false } },
  });

  app.setErrorHandler((error, _request, reply) => {
    if (error instanceof UnknownProductError) {
      return reply.code(400).send({ error: "UNKNOWN_PRODUCT", message: error.message });
    }
    throw error;
  });

  app.get("/api/products", () => ({ products: pricing.catalogue.list() }));
  app.post<{ Body: { items: string[] } }>(
    "/api/quote",
    { schema: { body: quoteBody } },
    (request) => {
      const basket = new Basket(pricing);
      for (const code of request.body.items) basket.add(code);
      return basket.quote();
    },
  );

  if (staticDir) app.register(fastifyStatic, { root: staticDir });
  return app;
}
