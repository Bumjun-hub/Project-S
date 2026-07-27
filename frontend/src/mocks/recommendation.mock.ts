// 이 파일은 개발용 mock 추천 결과 생성 로직을 제공합니다.
import type { Product, ProductMeasurementArea, ProductSize } from "@/features/product/types";
import type { FitCategory, FitMeasurement, MyFitState } from "@/features/my-fit/types";
import type { RecommendationRecord } from "@/features/history/types";
import type { UserProfileState } from "@/features/profile/types";

const PRIMARY_AREA_BY_CATEGORY: Record<FitCategory, ProductMeasurementArea> = {
  top: "CHEST_WIDTH",
  bottom: "WAIST_WIDTH",
  etc: "CHEST_WIDTH",
};

function pickNearestLabel(
  product: Product,
  area: ProductMeasurementArea,
  valueCm: number,
): { label: string; reason: string } {
  const rows = product.sizes
    .map((size) => ({
      label: size.label,
      measurement: size.measurements.find((m) => m.area === area),
    }))
    .filter((row): row is { label: string; measurement: NonNullable<typeof row.measurement> } =>
      Boolean(row.measurement),
    );
  const areaLabel = rows[0]?.measurement.areaLabel ?? "주요 부위";
  let nearest = rows[0]!;
  let bestDist = Infinity;

  for (const row of rows) {
    const d = Math.abs(valueCm - row.measurement.sizeCm);
    if (d < bestDist) {
      bestDist = d;
      nearest = row;
    }
  }

  return {
    label: nearest.label,
    reason: `${areaLabel} 실측 ${valueCm}cm에 가장 가까운 상품 실측은 ${nearest.label}입니다.`,
  };
}

function pickEntryCategory(product: Product): FitCategory {
  if (product.category === "하의") return "bottom";
  if (product.category === "상의") return "top";
  return "etc";
}

function pickMainReferenceCm(myFit: MyFitState, category: FitCategory, preferredArea: ProductMeasurementArea) {
  const preferredAreaLabel = preferredArea === "WAIST_WIDTH" ? "허리단면" : "가슴단면";
  const entry = myFit.entries[category];
  const fromPreferred = entry.measurements.find((m) => m.area === preferredAreaLabel && m.sizeCm != null)?.sizeCm;
  if (fromPreferred != null) return fromPreferred;
  return entry.measurements.find((m) => m.sizeCm != null)?.sizeCm ?? null;
}

function estimateProductMeasurements(
  product: Product,
  recommendedLabel: string,
): Record<string, number> {
  const size: ProductSize = product.sizes.find((s) => s.label === recommendedLabel) ?? product.sizes[0]!;
  return Object.fromEntries(size.measurements.map((measurement) => [measurement.areaLabel, measurement.sizeCm]));
}

/** 마지막 음절 받침 유무에 따라 조사 은/는 선택 */
function topicParticle(topic: string): "은" | "는" {
  if (topic.length === 0) return "는";
  const last = topic[topic.length - 1]!;
  const code = last.charCodeAt(0);
  if (code >= 0xac00 && code <= 0xd7a3) {
    const jong = (code - 0xac00) % 28;
    return jong === 0 ? "는" : "은";
  }
  return "는";
}

function classifyFit(measurement: FitMeasurement, estimatedCm: number): string {
  if (measurement.sizeCm == null || measurement.feeling == null) return "";
  const targetOffset = measurement.feeling === "small" ? 1.5 : measurement.feeling === "large" ? -1.5 : 0;
  const score = estimatedCm - measurement.sizeCm - targetOffset;
  const p = topicParticle(measurement.area);
  if (score >= 1.8) return `${measurement.area}${p} 기존보다 크게 느껴질 가능성이 높습니다.`;
  if (score <= -1.8) return `${measurement.area}${p} 기존보다 작게 느껴질 가능성이 높습니다.`;
  return `${measurement.area}${p} 기존과 비슷할 가능성이 높습니다.`;
}

export function buildMockRecommendation(input: {
  product: Product;
  profile: UserProfileState;
  myFit: MyFitState;
}): Omit<RecommendationRecord, "id" | "createdAt"> {
  const category = pickEntryCategory(input.product);
  const primaryArea = PRIMARY_AREA_BY_CATEGORY[category];
  const chestEstimate =
    input.profile.weightKg != null ? Math.round(72 + input.profile.weightKg * 0.35) : 96;
  const waistEstimate =
    input.profile.weightKg != null ? Math.round(70 + input.profile.weightKg * 0.32) : 80;
  const mainRef =
    pickMainReferenceCm(input.myFit, category, primaryArea) ??
    (primaryArea === "CHEST_WIDTH" ? chestEstimate : waistEstimate);

  const valueCm = mainRef;
  const { label, reason } = pickNearestLabel(input.product, primaryArea, valueCm);
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
