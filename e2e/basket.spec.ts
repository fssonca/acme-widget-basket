import { expect, test } from "@playwright/test";

test("adds two red widgets, applies the offer, and reprices when one is removed", async ({
  page,
}) => {
  await page.goto("/");
  await expect(page.getByLabel("Order total")).toHaveText("$0.00");
  await page.getByRole("button", { name: "Add Red Widget", exact: true }).click();
  await page.getByRole("button", { name: "Add Red Widget", exact: true }).click();
  await expect(page.getByText("Red Widget: second one half price", { exact: true })).toBeVisible();
  await expect(page.getByLabel("Order total")).toHaveText("$54.37");
  await page.getByRole("button", { name: "Remove one Red Widget", exact: true }).click();
  await expect(page.getByLabel("Order total")).toHaveText("$37.90");
  await expect(page.getByText("Red Widget: second one half price", { exact: true })).toHaveCount(0);
  await page.getByRole("button", { name: "Clear basket", exact: true }).click();
  await expect(page.getByLabel("Order total")).toHaveText("$0.00");
  await expect(page.getByText("Your basket is waiting")).toBeVisible();
});
