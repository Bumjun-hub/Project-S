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

export type MyFitApiCategory = "TOP" | "BOTTOM";
export type MyFitApiFeeling = "SMALL" | "EXACT" | "LARGE";

export type MyFitMeasurementArea =
  | "TOTAL_LENGTH"
  | "SHOULDER_WIDTH"
  | "CHEST_WIDTH"
  | "SLEEVE_LENGTH"
  | "WAIST_WIDTH"
  | "HIP_WIDTH"
  | "THIGH_WIDTH"
  | "RISE"
  | "HEM_WIDTH";

export interface MyFitMeasurementRequest {
  area: MyFitMeasurementArea;
  sizeCm: number;
  feeling: MyFitApiFeeling;
}

export interface MyFitEntryRequest {
  category: MyFitApiCategory;
  garmentLabel: string;
  measurements: MyFitMeasurementRequest[];
}

export interface MyFitCreateRequest {
  entries: MyFitEntryRequest[];
}

export interface MyFitUpdateRequest {
  entries?: MyFitEntryRequest[];
}

export interface MyFitMeasurementResponse {
  id: number;
  area: MyFitMeasurementArea;
  sizeCm: number;
  feeling: MyFitApiFeeling;
}

export interface MyFitEntryResponse {
  id: number;
  category: MyFitApiCategory;
  garmentLabel: string;
  measurements: MyFitMeasurementResponse[];
}

export interface MyFitResponse {
  id: number;
  entries: MyFitEntryResponse[];
  createdAt: string;
  updatedAt: string;
}
