// 이 파일은 실제 Product API 조회 함수를 제공합니다.
import type { ApiResponse } from "@/features/profile/types";
import type { Product } from "@/features/product/types";
import { ApiError, apiRequest } from "@/lib/apiClient";

export async function fetchProducts(): Promise<Product[]> {
  const response = await apiRequest<ApiResponse<Product[]>>("/api/v1/products");
  return response.data;
}

export async function fetchProductById(id: string): Promise<Product | null> {
  try {
    const response = await apiRequest<ApiResponse<Product>>(`/api/v1/products/${id}`);
    return response.data;
  } catch (error) {
    if (error instanceof ApiError && error.status === 404) {
      return null;
    }
    throw error;
  }
}
