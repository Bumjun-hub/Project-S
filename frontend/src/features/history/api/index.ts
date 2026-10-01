import type { ApiResponse } from "@/features/profile/types";
import type { FitFeedback, RecommendationRecord } from "@/features/history/types";
import { apiRequest } from "@/lib/apiClient";
import type { PageData } from "@/lib/pagination";
import type { MeasurementComparison } from "@/features/recommend/types";

type RecommendationHistoryData = {
  id: number;
  productCode: string;
  productName: string;
  brand: string;
  recommendedSize: string;
  matchScore: number;
  sizeScore: number;
  reason: string;
  feedback: FitFeedback | null;
  createdAt: string;
  comparisons: MeasurementComparison[];
};

function mapHistoryDataToRecord(data: RecommendationHistoryData): RecommendationRecord {
  return {
    id: String(data.id),
    productId: data.productCode,
    productName: data.productName,
    brand: data.brand,
    recommendedSize: data.recommendedSize,
    summary: data.reason,
    fitInsights: (data.comparisons ?? []).map((comparison) => comparison.message),
    comparisons: data.comparisons ?? [],
    createdAt: data.createdAt,
    matchScore: data.matchScore,
    sizeScore: data.sizeScore,
    feedback: data.feedback,
  };
}

export async function fetchRecommendationHistory(): Promise<RecommendationRecord[]> {
  const response = await apiRequest<ApiResponse<RecommendationHistoryData[]>>(
    "/api/v1/recommendations/history",
  );

  return response.data.map(mapHistoryDataToRecord);
}

export async function fetchRecommendationHistoryPage(page: number): Promise<PageData<RecommendationRecord>> {
  const response = await apiRequest<ApiResponse<PageData<RecommendationHistoryData>>>(`/api/v1/recommendations/history/page?page=${page}&size=12`);
  return { ...response.data, content: response.data.content.map(mapHistoryDataToRecord) };
}

export async function updateRecommendationFeedback(
  historyId: string,
  feedback: FitFeedback,
): Promise<RecommendationRecord> {
  const response = await apiRequest<ApiResponse<RecommendationHistoryData>>(
    `/api/v1/recommendations/history/${historyId}/feedback`,
    {
      method: "PATCH",
      body: JSON.stringify({ feedback }),
    },
  );

  return mapHistoryDataToRecord(response.data);
}
