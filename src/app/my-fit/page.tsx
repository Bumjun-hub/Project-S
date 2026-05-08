// 이 파일은 기준 핏 입력(`/my-fit`) 라우트를 렌더링합니다.
import { SequentialFlowGate } from "@/components/common/SequentialFlowGate";
import MyFitScreen from "@/features/my-fit/components/MyFitScreen";
import { FLOW_GATE_UP_TO_PROFILE } from "@/lib/flow-gate-needs";

export default function MyFitPage() {
  return (
    <SequentialFlowGate needs={FLOW_GATE_UP_TO_PROFILE}>
      <MyFitScreen />
    </SequentialFlowGate>
  );
}
