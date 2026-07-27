// 이 파일은 상품 목록 조회를 위한 TanStack Query 훅을 정의합니다.
"use client";

import { useQuery } from "@tanstack/react-query";
import { fetchProducts } from "@/features/product/api/products-api";
import { productQueryKeys } from "@/features/product/api/query-keys";

export function useProductsQuery() {
  return useQuery({
    queryKey: productQueryKeys.all,
    queryFn: fetchProducts,
  });
}
