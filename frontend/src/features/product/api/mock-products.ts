import type { Product, ProductMeasurementArea } from "@/features/product/types";

const measurementLabels: Record<ProductMeasurementArea, string> = {
  TOTAL_LENGTH: "총장",
  SHOULDER_WIDTH: "어깨너비",
  CHEST_WIDTH: "가슴단면",
  SLEEVE_LENGTH: "소매길이",
  WAIST_WIDTH: "허리단면",
  HIP_WIDTH: "힙단면",
  THIGH_WIDTH: "허벅지단면",
  RISE: "밑위",
  HEM_WIDTH: "밑단단면",
};

function sizes(
  labels: string[],
  rows: Array<Partial<Record<ProductMeasurementArea, number>>>,
) {
  return labels.map((label, index) => ({
    id: index + 1,
    label,
    displayOrder: index + 1,
    measurements: Object.entries(rows[index]).map(([area, sizeCm], measurementIndex) => ({
      id: index * 10 + measurementIndex + 1,
      area: area as ProductMeasurementArea,
      areaLabel: measurementLabels[area as ProductMeasurementArea],
      sizeCm: sizeCm as number,
    })),
  }));
}

const createdAt = "2026-08-01T00:00:00.000Z";

export const mockProducts: Product[] = [
  {
    id: "1", name: "Essential Oxford Shirt", brand: "Project S", category: "상의", priceKrw: 69000,
    description: "여유 있는 실루엣의 데일리 옥스퍼드 셔츠입니다.", createdAt, updatedAt: createdAt,
    sizes: sizes(["S", "M", "L"], [
      { TOTAL_LENGTH: 70, SHOULDER_WIDTH: 47, CHEST_WIDTH: 54, SLEEVE_LENGTH: 60 },
      { TOTAL_LENGTH: 72, SHOULDER_WIDTH: 49, CHEST_WIDTH: 57, SLEEVE_LENGTH: 61 },
      { TOTAL_LENGTH: 74, SHOULDER_WIDTH: 51, CHEST_WIDTH: 60, SLEEVE_LENGTH: 62 },
    ]),
  },
  {
    id: "2", name: "Relaxed Denim Jacket", brand: "Project S", category: "아우터", priceKrw: 129000,
    description: "탄탄한 데님 소재로 완성한 릴랙스 핏 재킷입니다.", createdAt, updatedAt: createdAt,
    sizes: sizes(["M", "L", "XL"], [
      { TOTAL_LENGTH: 66, SHOULDER_WIDTH: 50, CHEST_WIDTH: 58, SLEEVE_LENGTH: 59 },
      { TOTAL_LENGTH: 68, SHOULDER_WIDTH: 52, CHEST_WIDTH: 61, SLEEVE_LENGTH: 61 },
      { TOTAL_LENGTH: 70, SHOULDER_WIDTH: 54, CHEST_WIDTH: 64, SLEEVE_LENGTH: 62 },
    ]),
  },
  {
    id: "3", name: "Wide Cotton Trousers", brand: "Project S", category: "하의", priceKrw: 89000,
    description: "편안한 착용감과 단정한 라인이 돋보이는 코튼 팬츠입니다.", createdAt, updatedAt: createdAt,
    sizes: sizes(["S", "M", "L"], [
      { TOTAL_LENGTH: 101, WAIST_WIDTH: 37, HIP_WIDTH: 51, THIGH_WIDTH: 32, RISE: 31, HEM_WIDTH: 23 },
      { TOTAL_LENGTH: 103, WAIST_WIDTH: 40, HIP_WIDTH: 54, THIGH_WIDTH: 34, RISE: 32, HEM_WIDTH: 24 },
      { TOTAL_LENGTH: 105, WAIST_WIDTH: 43, HIP_WIDTH: 57, THIGH_WIDTH: 36, RISE: 33, HEM_WIDTH: 25 },
    ]),
  },
  {
    id: "4", name: "Merino Crew Knit", brand: "Project S", category: "상의", priceKrw: 99000,
    description: "부드러운 메리노 울 블렌드로 만든 크루넥 니트입니다.", createdAt, updatedAt: createdAt,
    sizes: sizes(["S", "M", "L"], [
      { TOTAL_LENGTH: 64, SHOULDER_WIDTH: 45, CHEST_WIDTH: 52, SLEEVE_LENGTH: 59 },
      { TOTAL_LENGTH: 66, SHOULDER_WIDTH: 47, CHEST_WIDTH: 55, SLEEVE_LENGTH: 60 },
      { TOTAL_LENGTH: 68, SHOULDER_WIDTH: 49, CHEST_WIDTH: 58, SLEEVE_LENGTH: 61 },
    ]),
  },
  {
    id: "5", name: "Nylon Field Parka", brand: "Project S", category: "아우터", priceKrw: 189000,
    description: "가볍고 실용적인 나일론 소재의 필드 파카입니다.", createdAt, updatedAt: createdAt,
    sizes: sizes(["M", "L", "XL"], [
      { TOTAL_LENGTH: 73, SHOULDER_WIDTH: 52, CHEST_WIDTH: 61, SLEEVE_LENGTH: 61 },
      { TOTAL_LENGTH: 75, SHOULDER_WIDTH: 54, CHEST_WIDTH: 64, SLEEVE_LENGTH: 62 },
      { TOTAL_LENGTH: 77, SHOULDER_WIDTH: 56, CHEST_WIDTH: 67, SLEEVE_LENGTH: 63 },
    ]),
  },
  {
    id: "6", name: "Straight Selvedge Jeans", brand: "Project S", category: "하의", priceKrw: 119000,
    description: "시간이 지날수록 자연스러운 멋이 더해지는 셀비지 데님입니다.", createdAt, updatedAt: createdAt,
    sizes: sizes(["28", "30", "32"], [
      { TOTAL_LENGTH: 102, WAIST_WIDTH: 36, HIP_WIDTH: 50, THIGH_WIDTH: 30, RISE: 29, HEM_WIDTH: 20 },
      { TOTAL_LENGTH: 104, WAIST_WIDTH: 39, HIP_WIDTH: 53, THIGH_WIDTH: 32, RISE: 30, HEM_WIDTH: 21 },
      { TOTAL_LENGTH: 106, WAIST_WIDTH: 42, HIP_WIDTH: 56, THIGH_WIDTH: 34, RISE: 31, HEM_WIDTH: 22 },
    ]),
  },
];
