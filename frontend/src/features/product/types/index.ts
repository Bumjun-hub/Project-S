// 이 파일은 상품 도메인에서 사용하는 타입을 정의합니다.
export type ProductMeasurementArea =
  | "TOTAL_LENGTH"
  | "SHOULDER_WIDTH"
  | "CHEST_WIDTH"
  | "SLEEVE_LENGTH"
  | "WAIST_WIDTH"
  | "HIP_WIDTH"
  | "THIGH_WIDTH"
  | "RISE"
  | "HEM_WIDTH";

export type ProductMeasurement = {
  id: number;
  area: ProductMeasurementArea;
  areaLabel: string;
  sizeCm: number;
};

export type ProductSize = {
  id: number;
  label: string;
  displayOrder: number;
  measurements: ProductMeasurement[];
};

export type Product = {
  id: string;
  name: string;
  brand: string;
  category: string;
  priceKrw: number;
  description: string;
  sizes: ProductSize[];
  createdAt: string;
  updatedAt: string;
};

export type MockProduct = Product;
