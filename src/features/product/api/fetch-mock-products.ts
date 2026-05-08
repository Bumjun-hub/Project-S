// 이 파일은 mock 상품 데이터를 조회하는 API 함수를 제공합니다.
import { MOCK_PRODUCTS, getMockProduct } from "@/mocks/products.mock";
import type { MockProduct } from "@/features/product/types";

/** 네트워크처럼 약간의 지연을 둔 목 목록 로더(TanStack Query 소비용). */
export async function fetchMockProducts(): Promise<MockProduct[]> {
  await new Promise((r) => setTimeout(r, 150));
  return MOCK_PRODUCTS;
}

export async function fetchMockProductById(id: string): Promise<MockProduct | null> {
  await new Promise((r) => setTimeout(r, 80));
  const p = getMockProduct(id);
  return p ?? null;
}
