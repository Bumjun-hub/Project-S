// 이 파일은 추천 API 호출 함수를 제공합니다.
import type { ApiResponse } from "@/features/profile/types";
import type {
  RecommendationCreateRequest,
  RecommendationData,
} from "@/features/recommend/types";
import { apiRequest } from "@/lib/apiClient";
import { isDemoMode } from "@/lib/demo-mode";
import { createMockRecommendation } from "./mock-recommendation";

export async function createRecommendation(productCode: string): Promise<RecommendationData> {
  if (isDemoMode) return createMockRecommendation(productCode);

  const response = await apiRequest<ApiResponse<RecommendationData>>(
    "/api/v1/recommendations",
    {
      method: "POST",
      body: JSON.stringify({
        productCode,
      } satisfies RecommendationCreateRequest),
    },
  );

  return response.data;
}
