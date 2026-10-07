import { afterAll, describe, expect, it } from "vitest";
import { acmePricing } from "../domain/acme-config.js";
import { buildApp } from "./app.js";

describe("API", () => {
  const app = buildApp({ pricing: acmePricing });
  afterAll(() => app.close());

  it("returns the three products with prices in cents", async () => {
    const response = await app.inject({ method: "GET", url: "/api/products" });
    expect(response.statusCode).toBe(200);
    expect(response.json()).toEqual({ products: acmePricing.catalogue.list() });
  });

  it("returns the two-red quote with its discount and delivery", async () => {
    const response = await app.inject({
      method: "POST",
      url: "/api/quote",
      payload: { items: ["R01", "R01"] },
    });
    expect(response.statusCode).toBe(200);
    expect(response.json()).toMatchObject({
      subtotal: 6590,
      discounts: [{ description: "Red Widget: second one half price", amount: 1648 }],
      delivery: 495,
      total: 5437,
    });
  });

  it.each([
    {},
    { items: "R01" },
    { items: [42] },
    { items: [null] },
    { items: [true] },
    { items: [{}] },
    { items: [], total: 1 },
  ])("rejects a malformed body instead of coercing or stripping it: %j", async (payload) => {
    const response = await app.inject({ method: "POST", url: "/api/quote", payload });
    expect(response.statusCode).toBe(400);
    expect(response.json()).toMatchObject({ statusCode: 400, error: "Bad Request" });
  });

  it("rejects an unknown product code", async () => {
    const response = await app.inject({
      method: "POST",
      url: "/api/quote",
      payload: { items: ["R01", "UNKNOWN"] },
    });
    expect(response.statusCode).toBe(400);
    expect(response.json()).toEqual({
      error: "UNKNOWN_PRODUCT",
      message: "Unknown product code: UNKNOWN",
    });
  });

  it("starts a fresh basket for each request and accepts an empty basket", async () => {
    await app.inject({ method: "POST", url: "/api/quote", payload: { items: ["R01", "R01"] } });
    const response = await app.inject({
      method: "POST",
      url: "/api/quote",
      payload: { items: [] },
    });
    expect(response.statusCode).toBe(200);
    expect(response.json()).toEqual({
      lines: [],
      subtotal: 0,
      discounts: [],
      delivery: 0,
      total: 0,
    });
  });

  it("uses the pricing rules injected by the caller", async () => {
    const customApp = buildApp({
      pricing: { ...acmePricing, offers: [], delivery: { chargeFor: () => 123 } },
    });
    try {
      const response = await customApp.inject({
        method: "POST",
        url: "/api/quote",
        payload: { items: ["R01", "R01"] },
      });
      expect(response.json()).toMatchObject({ discounts: [], delivery: 123, total: 6713 });
    } finally {
      await customApp.close();
    }
  });

  it("leaves unexpected errors to Fastify's default 500 handler", async () => {
    const failingApp = buildApp({
      pricing: {
        ...acmePricing,
        delivery: {
          chargeFor: () => {
            throw new Error("Unavailable");
          },
        },
      },
    });
    try {
      const response = await failingApp.inject({
        method: "POST",
        url: "/api/quote",
        payload: { items: ["B01"] },
      });
      expect(response.statusCode).toBe(500);
      expect(response.json()).toMatchObject({ statusCode: 500, error: "Internal Server Error" });
    } finally {
      await failingApp.close();
    }
  });
});
