import type { ApiResponse } from "@/features/profile/types";
import type { RecommendationRecord } from "@/features/history/types";
import { apiRequest } from "@/lib/apiClient";

type RecommendationHistoryData = {
  id: number;
  productCode: string;
  productName: string;
  brand: string;
  recommendedSize: string;
  matchScore: number;
  sizeScore: number;
  reason: string;
  createdAt: string;
};

function mapHistoryDataToRecord(data: RecommendationHistoryData): RecommendationRecord {
  return {
    id: String(data.id),
    productId: data.productCode,
    productName: data.productName,
    brand: data.brand,
    recommendedSize: data.recommendedSize,
    summary: data.reason,
    fitInsights: [],
    createdAt: data.createdAt,
    matchScore: data.matchScore,
    sizeScore: data.sizeScore,
  };
}

export async function fetchRecommendationHistory(): Promise<RecommendationRecord[]> {
  const response = await apiRequest<ApiResponse<RecommendationHistoryData[]>>(
    "/api/v1/recommendations/history",
  );

  return response.data.map(mapHistoryDataToRecord);
}
