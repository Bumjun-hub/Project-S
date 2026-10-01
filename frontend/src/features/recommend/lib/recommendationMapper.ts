// 이 파일은 Recommendation API 응답을 기존 결과/이력 화면 타입으로 변환합니다.
import type { RecommendationRecord } from "@/features/history/types";
import type { RecommendationData } from "@/features/recommend/types";

export function mapRecommendationResponseToRecord(
  response: RecommendationData,
): RecommendationRecord {
  return {
    id: String(response.historyId),
    productId: response.productCode,
    productName: response.productName,
    brand: response.brand,
    recommendedSize: response.recommendedSize,
    summary: response.reason,
    fitInsights: response.comparisons.map((comparison) => comparison.message),
    createdAt: response.createdAt,
    matchScore: response.matchScore,
    sizeScore: response.sizeScore,
    comparisons: response.comparisons,
  };
}
