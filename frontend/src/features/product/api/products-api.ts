// 이 파일은 실제 Product API 조회 함수를 제공합니다.
import type { ApiResponse } from "@/features/profile/types";
import type { Product } from "@/features/product/types";
import { ApiError, apiRequest } from "@/lib/apiClient";
import { isDemoMode } from "@/lib/demo-mode";
import { mockProducts } from "./mock-products";
import { paginate, type PageData } from "@/lib/pagination";

export type ProductPageParams = { page?: number; size?: number; category?: string; search?: string };

export async function fetchProductPage({ page = 0, size = 12, category = "all", search = "" }: ProductPageParams = {}): Promise<PageData<Product>> {
  if (isDemoMode) {
    const query = search.trim().toLowerCase();
    return paginate(mockProducts.filter((product) => (category === "all" || product.category === category)
      && `${product.name} ${product.brand} ${product.description}`.toLowerCase().includes(query)), page, size);
  }
  const params = new URLSearchParams({ page: String(page), size: String(size), category, search });
  const response = await apiRequest<ApiResponse<PageData<Product>>>(`/api/v1/products/page?${params}`);
  return response.data;
}

export async function fetchProducts(): Promise<Product[]> {
  if (isDemoMode) return mockProducts;

  const response = await apiRequest<ApiResponse<Product[]>>("/api/v1/products");
  return response.data;
}

export async function fetchProductById(id: string): Promise<Product | null> {
  if (isDemoMode) {
    return mockProducts.find((product) => product.id === id) ?? null;
  }

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
