// 이 파일은 사용자 프로필 입력(`/profile`) 라우트를 렌더링합니다.
import { SequentialFlowGate } from "@/components/common/SequentialFlowGate";
import ProfileScreen from "@/features/profile/components/ProfileScreen";
import { FLOW_GATE_INTRO_ONLY } from "@/lib/flow-gate-needs";

export default function ProfilePage() {
  return (
    <SequentialFlowGate needs={FLOW_GATE_INTRO_ONLY}>
      <ProfileScreen />
    </SequentialFlowGate>
  );
}
