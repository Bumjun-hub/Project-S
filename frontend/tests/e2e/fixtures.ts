import { test as base, expect, type Page } from "@playwright/test";

export const test = base.extend<{ safetyCheck: void }>({
  safetyCheck: [async ({ context }, use) => {
    const apiCalls: string[] = [];
    const pageErrors: string[] = [];
    const watchPage = (page: Page) => page.on("pageerror", (error) => pageErrors.push(error.message));
    context.pages().forEach(watchPage);
    context.on("page", watchPage);
    // Includes new tabs. Demo interactions should not issue any real API request.
    await context.route("**/api/**", async (route) => {
      apiCalls.push(new URL(route.request().url()).pathname);
      await route.abort("blockedbyclient");
    });
    await use();
    expect(apiCalls, "Demo suite attempted a backend API call").toEqual([]);
    expect(pageErrors, "Uncaught browser errors").toEqual([]);
  }, { auto: true }],
});

export { expect };
export const DEMO_PRODUCT_NAME = "Essential Oxford Shirt";

export async function login(page: Page, email = "e2e-owner@example.invalid") {
  await expect(page.getByRole("heading", { name: "로그인", exact: true })).toBeVisible();
  // Validation messages are currently inside the wrapping labels.
  await page.getByLabel(/^이메일/).fill(email);
  await page.getByLabel(/^비밀번호/).fill("DemoTestOnly!");
  await page.getByRole("button", { name: "로그인", exact: true }).click();
  await expect(page.getByText("데모 모드 · 현재 표시되는 상품과 추천 결과는 예시 데이터입니다.")).toBeVisible();
  await expect(page.getByRole("heading", { name: "로그인", exact: true })).toBeHidden();
}

export async function fillProfile(page: Page) {
  await expect(page.getByRole("heading", { name: "체형 정보 입력", exact: true })).toBeVisible();
  await page.getByLabel("키", { exact: true }).fill("175");
  await page.getByLabel("몸무게", { exact: true }).fill("68");
  await page.getByRole("button", { name: "남성", exact: true }).click();
  await page.getByRole("button", { name: "저장 후 다음", exact: true }).click();
  await expect(page.getByRole("heading", { name: "기준 옷 실측 입력", exact: true })).toBeVisible();
}

export async function fillReference(page: Page) {
  await page.getByLabel("기준 옷 이름", { exact: true }).fill("자동 테스트 기준 셔츠");
  for (const [area, size] of [["총장", "72"], ["어깨너비", "46"], ["가슴단면", "50"], ["소매길이", "62"]]) {
    await page.getByLabel(`${area} 실측 (cm)`, { exact: true }).fill(size);
    await page.getByLabel(`${area} 착용감`, { exact: true }).selectOption("exact");
  }
  await page.getByRole("button", { name: "저장 후 계속하기", exact: true }).click();
}

export async function createResult(page: Page) {
  await page.goto("/products");
  await page.getByRole("link", { name: DEMO_PRODUCT_NAME, exact: true }).click();
  await expect(page.getByRole("heading", { name: "실측 사이즈표", exact: true })).toBeVisible();
  await page.getByRole("link", { name: "기준 옷으로 핏 분석하기", exact: true }).click();
  await expect(page).toHaveURL(/\/login\?returnTo=/);
  await login(page);
  await fillProfile(page);
  await fillReference(page);
  await expect(page).toHaveURL(/\/result$/);
  await expect(page.getByRole("heading", { name: DEMO_PRODUCT_NAME, exact: true })).toBeVisible();
}
