import { mockProducts } from "@/features/product/api/mock-products";
import type { RecommendationData } from "@/features/recommend/types";

export function createMockRecommendation(productCode: string): RecommendationData {
  const product = mockProducts.find((item) => item.id === productCode) ?? mockProducts[0];
  const size = product.sizes[Math.min(1, product.sizes.length - 1)];

  return {
    productCode: product.id,
    productName: product.name,
    brand: product.brand,
    recommendedSize: size.label,
    matchScore: 91,
    sizeScore: 90,
    reason: "데모 체형과 기준 옷 정보를 바탕으로 가장 균형 잡힌 사이즈를 추천합니다.",
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
