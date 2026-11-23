import { test, expect } from "@playwright/test";

test.describe("Character Getter Application Shell & Dashboard", () => {
  test("loads the dashboard and renders core metrics", async ({ page }) => {
    await page.goto("/dashboard");

    // Check title and brand
    await expect(page).toHaveTitle(/Character Getter/);
    await expect(page.getByText("Traveler Dashboard")).toBeVisible();

    // Check key metrics are rendered
    await expect(page.getByText("Available Wishes")).toBeVisible();
    await expect(page.getByText("Primogem Balance")).toBeVisible();
    await expect(page.getByText("Character Pity")).toBeVisible();
    await expect(page.getByText("Owned Characters", { exact: true })).toBeVisible();

    // Check Demo Mode banner is present
    await expect(page.getByText("Demo Mode:")).toBeVisible();
  });

  test("navigates across application routes", async ({ page }) => {
    await page.goto("/dashboard");

    // Click on Characters
    await page.getByRole("link", { name: /Characters/i }).first().click();
    await expect(page).toHaveURL(/.*\/characters/);
    await expect(page.getByText("Character Roster")).toBeVisible();

    // Click on Pull Planner
    await page.getByRole("link", { name: /Pull Planner/i }).first().click();
    await expect(page).toHaveURL(/.*\/pull-planner/);
    await expect(page.getByText("Wish & Pull Planner")).toBeVisible();

    // Click on Settings
    await page.getByRole("link", { name: /Settings/i }).first().click();
    await expect(page).toHaveURL(/.*\/settings/);
    await expect(page.getByText("Settings & Data Management")).toBeVisible();
  });
});
