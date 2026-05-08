// 이 파일은 상품 조회용 TanStack Query key를 정의합니다.
export const productQueryKeys = {
  all: ["products"] as const,
  detail: (id: string) => [...productQueryKeys.all, "detail", id] as const,
};
