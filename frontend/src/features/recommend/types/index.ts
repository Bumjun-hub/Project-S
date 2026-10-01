// 이 파일은 추천 분석 요청과 결과 타입을 정의합니다.
export type RecommendRunnerProps = {
  productId: string;
};

export type RecommendationFeeling = "SMALL" | "EXACT" | "LARGE";

export type RecommendationMeasurementArea =
  | "TOTAL_LENGTH"
  | "SHOULDER_WIDTH"
  | "CHEST_WIDTH"
  | "SLEEVE_LENGTH"
  | "WAIST_WIDTH"
  | "HIP_WIDTH"
  | "THIGH_WIDTH"
  | "RISE"
  | "HEM_WIDTH";

export type RecommendationCreateRequest = {
  productCode: string;
};

export type MeasurementComparison = {
  area: RecommendationMeasurementArea;
  areaLabel: string;
  myFitSizeCm: number;
  feeling: RecommendationFeeling;
  adjustmentCm: number;
  targetSizeCm: number;
  productSizeCm: number;
  differenceCm: number;
  absoluteDifferenceCm: number;
  message: string;
};

export type RecommendationData = {
  historyId: number | string;
  createdAt: string;
  productCode: string;
  productName: string;
  brand: string;
  recommendedSize: string;
  matchScore: number;
  sizeScore: number;
  reason: string;
  comparisons: MeasurementComparison[];
};
