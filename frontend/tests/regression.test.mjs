import test from "node:test";
import assert from "node:assert/strict";
import { tokenExpired, getAccessToken, AUTH_STORAGE_KEYS } from "../src/lib/auth-storage.ts";
import { mapRecommendationResponseToRecord } from "../src/features/recommend/lib/recommendationMapper.ts";
import { paginate } from "../src/lib/pagination.ts";
import { QueryClient } from "@tanstack/react-query";
import { resetSessionCache } from "../src/lib/reset-session-cache.ts";

const jwt = (payload) => `header.${Buffer.from(JSON.stringify(payload)).toString("base64url")}.signature`;

test("expired, malformed and missing-expiry tokens are not usable", () => {
  assert.equal(tokenExpired(jwt({ exp: Date.now() / 1000 - 1 })), true);
  assert.equal(tokenExpired(jwt({ exp: Date.now() / 1000 + 60 })), false);
  assert.equal(tokenExpired(jwt({})), true);
  assert.equal(tokenExpired("invalid-token"), true);
});

test("demo tokens are accepted only in explicitly enabled demo mode", () => {
  const previous = process.env.NEXT_PUBLIC_DEMO_MODE;
  try {
    process.env.NEXT_PUBLIC_DEMO_MODE = "false";
    assert.equal(tokenExpired("demo-access-token"), true);
    process.env.NEXT_PUBLIC_DEMO_MODE = "true";
    assert.equal(tokenExpired("demo-access-token"), false);
  } finally {
    if (previous === undefined) delete process.env.NEXT_PUBLIC_DEMO_MODE;
    else process.env.NEXT_PUBLIC_DEMO_MODE = previous;
  }
});

test("server-side rendering does not access browser storage", () => {
  assert.equal(getAccessToken(), null);
});

test("expired browser credentials are never attached to requests", () => {
  const storage = new Map();
  globalThis.window = {};
  globalThis.localStorage = { getItem: (key) => storage.get(key) ?? null };
  try {
    storage.set(AUTH_STORAGE_KEYS.accessToken, jwt({ exp: 1 }));
    assert.equal(getAccessToken(), null);
    const valid = jwt({ exp: Date.now() / 1000 + 60 });
    storage.set(AUTH_STORAGE_KEYS.accessToken, valid);
    assert.equal(getAccessToken(), valid);
    storage.clear();
    assert.equal(getAccessToken(), null);
  } finally {
    delete globalThis.window;
    delete globalThis.localStorage;
  }
});

test("recommendation mapper preserves the database ID, creation time and full comparison snapshot", () => {
  const comparisons = [{ area: "CHEST_WIDTH", message: "snapshot" }, { area: "TOTAL_LENGTH", message: "snapshot 2" }];
  const response = { historyId: 42, createdAt: "2026-10-01T06:00:00", productCode: "p-test", productName: "shirt", brand: "brand", recommendedSize: "M", matchScore: 91, sizeScore: 0.8, reason: "reason", comparisons };
  const mapped = mapRecommendationResponseToRecord(response);
  assert.equal(mapped.id, "42");
  assert.equal(mapped.createdAt, response.createdAt);
  assert.deepEqual(mapped.comparisons, comparisons);
  assert.deepEqual(mapped.fitInsights, ["snapshot", "snapshot 2"]);
});

test("page slicing preserves the total and correct page boundaries", () => {
  const first = paginate([1, 2, 3, 4, 5], 0, 2);
  const last = paginate([1, 2, 3, 4, 5], 2, 2);
  assert.deepEqual(first.content, [1, 2]);
  assert.deepEqual(last.content, [5]);
  assert.equal(last.totalElements, 5);
  assert.equal(last.totalPages, 3);
  assert.equal(paginate([], 0, 12).totalPages, 0);
});

test("session initialization does not cancel an in-flight public products request", async () => {
  const client = new QueryClient({ defaultOptions: { queries: { retry: false, gcTime: Infinity } } });
  let resolveProducts;
  const request = client.fetchQuery({ queryKey: ["products", "page"], queryFn: () => new Promise((resolve) => { resolveProducts = resolve; }) });
  resetSessionCache(client);
  assert.ok(client.getQueryCache().find({ queryKey: ["products", "page"] }));
  resolveProducts([{ id: "p-oxford-01" }]);
  assert.deepEqual(await request, [{ id: "p-oxford-01" }]);
  assert.deepEqual(client.getQueryData(["products", "page"]), [{ id: "p-oxford-01" }]);
  client.clear();
});

test("account changes remove private caches and cancel outstanding private requests", async () => {
  const client = new QueryClient({ defaultOptions: { queries: { retry: false, gcTime: Infinity } } });
  client.setQueryData(["body-profile", "me", "old-user"], { height: 175 });
  client.setQueryData(["recommendation-history", "old-user", 0], { content: [{ id: 42 }] });
  client.setQueryData(["products", "page"], [{ id: "p-public" }]);
  let requestCancelled = false;
  const pending = client.fetchQuery({ queryKey: ["private-pending", "old-user"], queryFn: ({ signal }) => new Promise(() => {
    signal.addEventListener("abort", () => { requestCancelled = true; });
  }) }).catch(() => undefined);
  resetSessionCache(client);
  await pending;
  assert.equal(requestCancelled, true);
  assert.equal(client.getQueryData(["body-profile", "me", "old-user"]), undefined);
  assert.equal(client.getQueryData(["recommendation-history", "old-user", 0]), undefined);
  assert.equal(client.getQueryCache().find({ queryKey: ["private-pending", "old-user"] }), undefined);
  assert.deepEqual(client.getQueryData(["products", "page"]), [{ id: "p-public" }]);
  client.clear();
});
