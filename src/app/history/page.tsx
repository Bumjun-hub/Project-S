// 이 파일은 추천 분석 기록(`/history`) 라우트를 렌더링합니다.
import { SequentialFlowGate } from "@/components/common/SequentialFlowGate";
import HistoryScreen from "@/features/history/components/HistoryScreen";
import { FLOW_GATE_FULL_SAVED } from "@/lib/flow-gate-needs";

export default function HistoryPage() {
  return (
    <SequentialFlowGate needs={FLOW_GATE_FULL_SAVED}>
      <HistoryScreen />
    </SequentialFlowGate>
  );
}
