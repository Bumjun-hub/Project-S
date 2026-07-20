// 이 파일은 상품 도메인에서 사용하는 타입을 정의합니다.
export type SizeChartRow = { label: string; min: number; max: number };

export type MockProduct = {
  id: string;
  name: string;
  brand: string;
  category: string;
  priceKrw: number;
  description: string;
  chartAxis: "chest" | "waist";
  sizeChart: SizeChartRow[];
};
