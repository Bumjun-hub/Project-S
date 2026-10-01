import { mkdir } from "node:fs/promises";
import { join, resolve } from "node:path";
import type { Page } from "@playwright/test";
import { test, expect, login, fillProfile, fillReference, DEMO_PRODUCT_NAME } from "../e2e/fixtures";

const screenshotDirectory = resolve("docs/screenshots");

async function capture(page: Page, name: string, project: string) {
  // Scroll through the actual page to load lazy images and reveal on-scroll UI.
  // Reduced-motion mode keeps screenshots stable without changing page contents.
  await page.evaluate(async () => {
    await document.fonts.ready;
    const frame = () => new Promise<void>((resolve) => requestAnimationFrame(() => resolve()));
    const height = document.documentElement.scrollHeight;
    for (let y = 0; y < height; y += Math.max(200, window.innerHeight / 2)) {
      window.scrollTo(0, y);
      await frame();
      await frame();
    }
    window.scrollTo(0, 0);
    await frame();
    await frame();
  });
  await page.waitForFunction(() => [...document.images].every((img) => img.complete && img.naturalWidth > 0));
  await expect.poll(() => page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth), {
    message: `${name}: horizontal overflow`,
  }).toBe(true);
  await page.screenshot({ path: join(screenshotDirectory, `${name}-${project}.png`), fullPage: true, animations: "disabled" });
}

test("실제 데모 사용자 흐름에서 포트폴리오 화면 캡처", async ({ page }, testInfo) => {
  await mkdir(screenshotDirectory, { recursive: true });
  await page.goto("/");
  await expect(page.getByRole("heading", { level: 1 })).toContainText("나에게 맞는 사이즈");
  await capture(page, "landing", testInfo.project.name);

  await page.goto("/products");
  await page.getByRole("link", { name: DEMO_PRODUCT_NAME, exact: true }).click();
  await expect(page.getByRole("heading", { name: "실측 사이즈표", exact: true })).toBeVisible();
  await capture(page, "product-detail", testInfo.project.name);

  await page.getByRole("link", { name: "기준 옷으로 핏 분석하기", exact: true }).click();
  await login(page, "portfolio-demo@example.invalid");
  await fillProfile(page);
  await fillReference(page);
  await expect(page).toHaveURL(/\/result$/);
  await expect(page.getByRole("region", { name: "FIT BREAKDOWN", exact: true }).getByRole("heading", { level: 3 })).toHaveCount(4);
  await page.getByRole("button", { name: "잘 맞아요", exact: true }).click();
  await expect(page.getByRole("button", { name: "잘 맞아요", exact: true })).toHaveAttribute("aria-pressed", "true");
  await capture(page, "recommendation-result", testInfo.project.name);

  await page.getByRole("link", { name: "분석 기록 보기", exact: true }).click();
  await page.reload();
  await expect(page.getByRole("heading", { name: "분석 기록", exact: true })).toBeVisible();
  await expect(page.getByRole("button", { name: "결과 다시보기", exact: true })).toHaveCount(1);
  await expect(page.getByRole("button", { name: "잘 맞아요", exact: true })).toHaveAttribute("aria-pressed", "true");
  await capture(page, "analysis-history", testInfo.project.name);
});
