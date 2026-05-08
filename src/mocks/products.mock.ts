// 이 파일은 개발용 mock 상품 데이터를 제공합니다.
import type { MockProduct } from "@/features/product/types";

export type { MockProduct } from "@/features/product/types";

export const MOCK_PRODUCTS: MockProduct[] = [
  {
    id: "p-oxford-01",
    name: "레귤러 옥스포드 셔츠",
    brand: "모크웍스",
    category: "상의",
    priceKrw: 59000,
    description: "데일리용 기본 핏. 면 혼방, 세미 레귤러 실루엣입니다.",
    chartAxis: "chest",
    sizeChart: [
      { label: "S", min: 88, max: 94 },
      { label: "M", min: 94, max: 100 },
      { label: "L", min: 100, max: 106 },
      { label: "XL", min: 106, max: 114 },
    ],
  },
  {
    id: "p-knit-02",
    name: "라운드 울니트",
    brand: "에디토",
    category: "상의",
    priceKrw: 89000,
    description: "가벼운 울 블렌드 니트. 어깨·소매 라인이 안정적인 핏입니다.",
    chartAxis: "chest",
    sizeChart: [
      { label: "44", min: 90, max: 96 },
      { label: "46", min: 96, max: 102 },
      { label: "48", min: 102, max: 108 },
      { label: "50", min: 108, max: 116 },
    ],
  },
  {
    id: "p-denim-03",
    name: "스트레이트 데님 팬츠",
    brand: "라우트",
    category: "하의",
    priceKrw: 129000,
    description: "미드라이즈 스트레이트. 허리 실측과 사이즈표를 함께 보면 좋습니다.",
    chartAxis: "waist",
    sizeChart: [
      { label: "28", min: 74, max: 78 },
      { label: "30", min: 78, max: 82 },
      { label: "32", min: 82, max: 86 },
      { label: "34", min: 86, max: 92 },
    ],
  },
];

export function getMockProduct(id: string): MockProduct | undefined {
  return MOCK_PRODUCTS.find((p) => p.id === id);
}
