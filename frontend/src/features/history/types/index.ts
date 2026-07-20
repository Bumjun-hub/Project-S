// 이 파일은 추천 분석 기록에서 사용하는 타입을 정의합니다.
export type RecommendationRecord = {
  id: string;
  productId: string;
  productName: string;
  brand: string;
  recommendedSize: string;
  summary: string;
  fitInsights: string[];
  createdAt: string;
};
