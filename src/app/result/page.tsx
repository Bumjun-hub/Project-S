// 이 파일은 추천 결과(`/result`) 라우트를 렌더링합니다.
import { SequentialFlowGate } from "@/components/common/SequentialFlowGate";
import RecommendationResultScreen from "@/features/recommend/components/RecommendationResultScreen";
import { FLOW_GATE_FULL_SAVED } from "@/lib/flow-gate-needs";

export default function ResultPage() {
  return (
    <SequentialFlowGate needs={FLOW_GATE_FULL_SAVED}>
      <RecommendationResultScreen />
    </SequentialFlowGate>
  );
}
