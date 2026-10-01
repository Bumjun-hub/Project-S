// 이 파일은 추천 결과(`/result`) 라우트를 렌더링합니다.
import { SequentialFlowGate } from "@/components/common/SequentialFlowGate";
import EditorialRecommendationResultScreen from "@/features/recommend/components/EditorialRecommendationResultScreen";
import type { SequentialFlowRequirement } from "@/lib/flow-gate-needs";
const AUTH_ONLY: SequentialFlowRequirement[] = [];

export default function ResultPage() {
  return (
    <SequentialFlowGate needs={AUTH_ONLY}>
      <EditorialRecommendationResultScreen />
    </SequentialFlowGate>
  );
}
