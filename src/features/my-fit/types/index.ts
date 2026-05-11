// 이 파일은 기준 핏 입력값과 관련 타입을 정의합니다.
export type FitCategory = "top" | "bottom" | "etc";
export type FitFeeling = "small" | "exact" | "large";

export type FitMeasurement = {
  area: string;
  sizeCm: number | null;
  feeling: FitFeeling | null;
};

export type FitCategoryEntry = {
  garmentLabel: string;
  measurements: FitMeasurement[];
};

export type MyFitState = {
  selectedCategory: FitCategory;
  entries: Record<FitCategory, FitCategoryEntry>;
};
