import { test, expect, login, fillProfile, fillReference, createResult, DEMO_PRODUCT_NAME } from "./fixtures";

test("비로그인 상품 탐색·검색·빈 상태 및 없는 상품", async ({ page }) => {
  await page.goto("/products");
  await expect(page.getByRole("heading", { name: "상품 탐색", exact: true })).toBeVisible();
  await expect(page.getByRole("link", { name: DEMO_PRODUCT_NAME, exact: true })).toBeVisible();
  await page.getByRole("searchbox", { name: "상품 검색" }).fill("Oxford");
  await expect(page.getByRole("link", { name: DEMO_PRODUCT_NAME, exact: true })).toBeVisible();
  await expect(page.getByRole("link", { name: "핏 분석하기", exact: true })).toHaveCount(1);
  await page.getByRole("searchbox", { name: "상품 검색" }).fill("no-such-e2e-product");
  await expect(page.getByRole("heading", { name: "조건에 맞는 상품이 없습니다" })).toBeVisible();
  await page.goto("/products/no-such-e2e-product");
  await expect(page.getByRole("heading", { name: "페이지를 찾을 수 없습니다", exact: true })).toBeVisible();
});

test("비로그인 보호 화면은 로그인으로 이동", async ({ page }) => {
  for (const path of ["/history", "/result", "/profile", "/my-fit"]) {
    await page.goto(path);
    await expect(page).toHaveURL(/\/login\?returnTo=/);
    await expect(page.getByRole("heading", { name: "로그인", exact: true })).toBeVisible();
  }
});

test("로그인 입력 검증과 외부 returnTo 차단", async ({ page }) => {
  await page.goto("/login?returnTo=https%3A%2F%2Fexample.invalid");
  await page.getByRole("button", { name: "로그인", exact: true }).click();
  await expect(page.getByText("이메일을 입력해 주세요.")).toBeVisible();
  await expect(page.getByText("비밀번호를 입력해 주세요.")).toBeVisible();
  await page.getByLabel(/^이메일/).fill("invalid-email");
  await page.getByRole("button", { name: "로그인", exact: true }).click();
  await expect(page.getByText("올바른 이메일 형식이 아닙니다.")).toBeVisible();
  await login(page);
  await expect(page).toHaveURL(/\/products$/);
});

test("프로필과 기준 옷의 잘못된 실측 입력 차단", async ({ page }) => {
  await page.goto("/login?returnTo=%2Fprofile");
  await login(page);
  await page.getByLabel("키", { exact: true }).fill("99");
  await page.getByLabel("몸무게", { exact: true }).fill("68");
  await page.getByRole("button", { name: "남성", exact: true }).click();
  await page.getByRole("button", { name: "저장 후 다음", exact: true }).click();
  await expect(page.getByText("키는 100~250cm, 몸무게는 20~300kg 범위로 입력해 주세요.")).toBeVisible();
  await fillProfile(page);
  await page.getByLabel("기준 옷 이름", { exact: true }).fill("검증용 셔츠");
  await page.getByRole("button", { name: "저장 후 계속하기", exact: true }).click();
  await expect(page.getByText("실측 사이즈를 1개 이상 입력해 주세요.")).toBeVisible();
  await page.getByLabel("총장 실측 (cm)", { exact: true }).fill("-1");
  await page.getByLabel("총장 착용감", { exact: true }).selectOption("exact");
  await page.getByRole("button", { name: "저장 후 계속하기", exact: true }).click();
  await expect(page.getByText("실측은 0 초과 300cm 이하로 입력하고, 각 부위의 착용감도 선택해 주세요.")).toBeVisible();
  await fillReference(page);
  await expect(page).toHaveURL(/\/products$/);
});

test("상품에서 로그인·추천·피드백·이력 새로고침·다시보기", async ({ page }, testInfo) => {
  await createResult(page);
  const breakdown = page.getByRole("region", { name: "FIT BREAKDOWN", exact: true });
  await expect(breakdown.getByRole("heading", { level: 3 })).toHaveCount(4);
  await page.getByRole("button", { name: "잘 맞아요", exact: true }).click();
  await expect(page.getByRole("button", { name: "잘 맞아요", exact: true })).toHaveAttribute("aria-pressed", "true");
  await page.getByRole("link", { name: "분석 기록 보기", exact: true }).click();
  await expect(page).toHaveURL(/\/history$/);
  await page.reload();
  await expect(page.getByRole("heading", { name: "분석 기록", exact: true })).toBeVisible();
  await expect(page.getByRole("button", { name: "결과 다시보기", exact: true })).toHaveCount(1);
  await expect(page.getByRole("button", { name: "잘 맞아요", exact: true })).toHaveAttribute("aria-pressed", "true");
  await testInfo.attach("history-proof", { body: await page.screenshot({ fullPage: true }), contentType: "image/png" });
  await page.getByRole("button", { name: "결과 다시보기", exact: true }).click();
  await expect(page.getByRole("region", { name: "FIT BREAKDOWN", exact: true }).getByRole("heading", { level: 3 })).toHaveCount(4);
  await expect(page.getByRole("button", { name: "잘 맞아요", exact: true })).toHaveAttribute("aria-pressed", "true");
});

test("로그아웃 후 다른 계정에는 개인 기록·입력이 남지 않음", async ({ page }) => {
  await createResult(page);
  await page.getByRole("button", { name: "Logout", exact: true }).click();
  await page.goto("/history");
  await expect(page.getByRole("heading", { name: "로그인", exact: true })).toBeVisible();
  await login(page, "e2e-other@example.invalid");
  await expect(page.getByRole("heading", { name: "저장된 분석 기록이 없습니다" })).toBeVisible();
  await page.goto("/profile");
  await expect(page.getByLabel("키", { exact: true })).toHaveValue("");
  await expect(page.getByLabel("몸무게", { exact: true })).toHaveValue("");
  // A new account must complete its own profile before the reference form opens.
  await fillProfile(page);
  await expect(page.getByLabel("기준 옷 이름", { exact: true })).toHaveValue("");
  await expect(page.getByLabel("총장 실측 (cm)", { exact: true })).toHaveValue("");
});

test("다른 탭의 계정 변경 시 기존 탭 입력 상태도 초기화", async ({ page, context }) => {
  await page.goto("/login?returnTo=%2Fprofile");
  await login(page);
  await fillProfile(page);
  await page.goto("/profile");
  await expect(page.getByLabel("키", { exact: true })).toHaveValue("175");
  const otherTab = await context.newPage();
  await otherTab.goto("/login?returnTo=%2Fhistory");
  await login(otherTab, "e2e-other-tab@example.invalid");
  await expect(page.getByLabel("키", { exact: true })).toHaveValue("");
  await expect(page.getByLabel("몸무게", { exact: true })).toHaveValue("");
  await otherTab.close();
});

test("메뉴에서 Analysis History 이동 및 모바일 Escape·포커스", async ({ page, isMobile }, testInfo) => {
  await page.goto("/login");
  await login(page);
  if (isMobile) {
    const toggle = page.getByRole("button", { name: "메뉴 열기", exact: true });
    await toggle.click();
    await expect(page.getByRole("button", { name: "메뉴 닫기", exact: true })).toHaveAttribute("aria-expanded", "true");
    await page.keyboard.press("Escape");
    await expect(toggle).toHaveAttribute("aria-expanded", "false");
    await expect(toggle).toBeFocused();
    await toggle.click();
  }
  await page.getByRole("navigation", { name: "주요 메뉴", exact: true }).getByRole("link", { name: "Analysis History", exact: true }).click();
  await expect(page.getByRole("heading", { name: "분석 기록", exact: true })).toBeVisible();
  if (isMobile) await expect(page.getByRole("button", { name: "메뉴 열기", exact: true })).toHaveAttribute("aria-expanded", "false");
  const overflow = await page.evaluate(() => document.documentElement.scrollWidth > window.innerWidth);
  expect(overflow, "History page has horizontal overflow").toBe(false);
  await testInfo.attach("navigation-proof", { body: await page.screenshot({ fullPage: true }), contentType: "image/png" });
});
