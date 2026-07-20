// 이 파일은 추천 기록을 안정적으로 식별하기 위한 ID 생성 유틸을 제공합니다.
import type { MyFitState } from "@/features/my-fit/types";

/** 동일 입력의 중복 기록(Strict Mode 등)은 같은 id로 합친다. */
export function stableRecommendationRecordId(
  productId: string,
  profile: { heightCm: number | null; weightKg: number | null },
  myFit: Pick<MyFitState, "entries">,
) {
  const fitHash = encodeURIComponent(JSON.stringify(myFit.entries));
  return `rec-${productId}-${profile.heightCm}-${profile.weightKg}-${fitHash}`;
}
