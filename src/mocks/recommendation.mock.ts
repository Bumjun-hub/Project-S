// 이 파일은 개발용 mock 추천 결과 생성 로직을 제공합니다.
import type { MockProduct } from "@/features/product/types";
import type { FitCategory, FitMeasurement, MyFitState } from "@/features/my-fit/types";
import type { RecommendationRecord } from "@/features/history/types";
import type { UserProfileState } from "@/features/profile/types";

function pickNearestLabel(
  product: MockProduct,
  valueCm: number,
): { label: string; reason: string } {
  const axisLabel = product.chartAxis === "chest" ? "가슴" : "허리";
  const inBand = product.sizeChart.find((r) => valueCm >= r.min && valueCm <= r.max);
  if (inBand) {
    return {
      label: inBand.label,
      reason: `${axisLabel} 실측 ${valueCm}cm이 해당 브랜드 표의 ${inBand.label} 구간 안에 포함됩니다.`,
    };
  }
  let nearest = product.sizeChart[0]!;
  let bestDist = Infinity;
  for (const row of product.sizeChart) {
    const mid = (row.min + row.max) / 2;
    const d = Math.abs(valueCm - mid);
    if (d < bestDist) {
      bestDist = d;
      nearest = row;
    }
  }
  return {
    label: nearest.label,
    reason: `${axisLabel} 실측 ${valueCm}cm에 가장 가까운 표 중심값은 ${nearest.label}입니다(구간 밖 근사).`,
  };
}

function pickEntryCategory(product: MockProduct): FitCategory {
  if (product.category === "하의") return "bottom";
  if (product.category === "상의") return "top";
  return "etc";
}

function pickMainReferenceCm(myFit: MyFitState, category: FitCategory, axis: MockProduct["chartAxis"]) {
  const preferredArea = axis === "chest" ? "가슴단면" : "허리단면";
  const entry = myFit.entries[category];
  const fromPreferred = entry.measurements.find((m) => m.area === preferredArea && m.sizeCm != null)?.sizeCm;
  if (fromPreferred != null) return fromPreferred;
  return entry.measurements.find((m) => m.sizeCm != null)?.sizeCm ?? null;
}

function estimateProductMeasurements(
  product: MockProduct,
  recommendedLabel: string,
): Record<string, number> {
  const row = product.sizeChart.find((r) => r.label === recommendedLabel) ?? product.sizeChart[0]!;
  const mid = (row.min + row.max) / 2;
  if (product.chartAxis === "chest") {
    return {
      총장: Math.round((mid * 0.72) * 10) / 10,
      어깨너비: Math.round((mid / 2.2) * 10) / 10,
      가슴단면: Math.round(mid * 10) / 10,
      소매길이: Math.round((mid * 0.62) * 10) / 10,
    };
  }
  return {
    총장: Math.round((mid * 1.23) * 10) / 10,
    허리단면: Math.round(mid * 10) / 10,
    "엉덩이 단면": Math.round((mid * 1.22) * 10) / 10,
    "허벅지 단면": Math.round((mid * 0.72) * 10) / 10,
    밑위: Math.round((mid * 0.42) * 10) / 10,
    밑단단면: Math.round((mid * 0.31) * 10) / 10,
  };
}

function classifyFit(measurement: FitMeasurement, estimatedCm: number): string {
  if (measurement.sizeCm == null || measurement.feeling == null) return "";
  const targetOffset = measurement.feeling === "small" ? 1.5 : -1.5;
  const score = estimatedCm - measurement.sizeCm - targetOffset;
  if (score >= 1.8) return `${measurement.area}는 기존보다 크게 느껴질 가능성이 높습니다.`;
  if (score <= -1.8) return `${measurement.area}는 기존보다 작게 느껴질 가능성이 높습니다.`;
  return `${measurement.area}는 기존과 비슷할 가능성이 높습니다.`;
}

export function buildMockRecommendation(input: {
  product: MockProduct;
  profile: UserProfileState;
  myFit: MyFitState;
}): Omit<RecommendationRecord, "id" | "createdAt"> {
  const category = pickEntryCategory(input.product);
  const chestEstimate =
    input.profile.weightKg != null ? Math.round(72 + input.profile.weightKg * 0.35) : 96;
  const waistEstimate =
    input.profile.weightKg != null ? Math.round(70 + input.profile.weightKg * 0.32) : 80;
  const mainRef =
    pickMainReferenceCm(input.myFit, category, input.product.chartAxis) ??
    (input.product.chartAxis === "chest" ? chestEstimate : waistEstimate);

  const valueCm = mainRef;
  const { label, reason } = pickNearestLabel(input.product, valueCm);
  const estimated = estimateProductMeasurements(input.product, label);

  const entry = input.myFit.entries[category];
  const fitInsights = entry.measurements
    .filter((m) => m.sizeCm != null && m.feeling != null && estimated[m.area] != null)
    .map((m) => classifyFit(m, estimated[m.area]!));

  const heightBit =
    input.profile.heightCm != null ? ` 신장 ${input.profile.heightCm}cm` : "";
  const weightBit =
    input.profile.weightKg != null ? `·체중 ${input.profile.weightKg}kg` : "";

  const garmentBit =
    entry.garmentLabel.trim() !== ""
      ? ` 기준 ${category === "top" ? "상의" : category === "bottom" ? "하의" : "기타"} 「${entry.garmentLabel}」 실측을 반영했습니다.`
      : " 기준 옷 실측이 없어 프로필 기반 추정 값을 사용했습니다.";

  const insightBit =
    fitInsights.length > 0 ? ` 부위별 예상: ${fitInsights.join(" ")}` : " 부위별 비교 데이터가 부족합니다.";

  const summary = `[Mock AI] ${input.product.brand} ${input.product.name}: 권장 ${label}. ${reason}${garmentBit}${insightBit} (${heightBit}${weightBit} 프로필 참고). 실제 핏은 소재·패턴에 따라 달라질 수 있습니다.`;

  return {
    productId: input.product.id,
    productName: input.product.name,
    brand: input.product.brand,
    recommendedSize: label,
    summary,
    fitInsights,
  };
}

export function delayMs(ms: number) {
  return new Promise<void>((resolve) => setTimeout(resolve, ms));
}
