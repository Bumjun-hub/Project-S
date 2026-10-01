import { mockProducts } from "@/features/product/api/mock-products";
import type { RecommendationData } from "@/features/recommend/types";

export function createMockRecommendation(productCode: string): RecommendationData {
  const product = mockProducts.find((item) => item.id === productCode) ?? mockProducts[0];
  const size = product.sizes[Math.min(1, product.sizes.length - 1)];

  return {
    historyId: `demo-${crypto.randomUUID()}`,
    createdAt: new Date().toISOString(),
    productCode: product.id,
    productName: product.name,
    brand: product.brand,
    recommendedSize: size.label,
    matchScore: 91,
    sizeScore: 90,
    reason: "상품 실측표를 이용한 예시 결과입니다. 실제 추천은 기준 옷 실측과 착용감을 비교합니다.",
    comparisons: size.measurements.slice(0, 4).map((measurement) => ({
      area: measurement.area,
      areaLabel: measurement.areaLabel,
      myFitSizeCm: measurement.sizeCm,
      feeling: "EXACT",
      adjustmentCm: 0,
      targetSizeCm: measurement.sizeCm,
      productSizeCm: measurement.sizeCm,
      differenceCm: 0,
      absoluteDifferenceCm: 0,
      message: `${measurement.areaLabel} 수치가 기준 옷과 잘 맞습니다.`,
    })),
  };
}
