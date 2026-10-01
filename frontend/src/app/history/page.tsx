// 이 파일은 추천 분석 기록(`/history`) 라우트를 렌더링합니다.
import { SequentialFlowGate } from "@/components/common/SequentialFlowGate";
import HistoryScreen from "@/features/history/components/HistoryScreen";
import type { SequentialFlowRequirement } from "@/lib/flow-gate-needs";
const AUTH_ONLY: SequentialFlowRequirement[] = [];

export default function HistoryPage() {
  return (
    <SequentialFlowGate needs={AUTH_ONLY}>
      <HistoryScreen />
    </SequentialFlowGate>
  );
}
