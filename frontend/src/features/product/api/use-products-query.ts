// 이 파일은 상품 목록 조회를 위한 TanStack Query 훅을 정의합니다.
"use client";

import { useQuery } from "@tanstack/react-query";
import { fetchProductPage, type ProductPageParams } from "@/features/product/api/products-api";
import { productQueryKeys } from "@/features/product/api/query-keys";

export function useProductsQuery(params: ProductPageParams = {}) {
  return useQuery({
    queryKey: [...productQueryKeys.all, "page", params],
    queryFn: () => fetchProductPage(params),
  });
}
