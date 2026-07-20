// 이 파일은 상품별 추천 실행(`/recommend/[productId]`) 라우트를 렌더링합니다.
import { SequentialFlowGate } from "@/components/common/SequentialFlowGate";
import RecommendRunnerScreen from "@/features/recommend/components/RecommendRunnerScreen";
import { FLOW_GATE_FULL_SAVED } from "@/lib/flow-gate-needs";

export default async function Page({
  params,
}: {
  params: Promise<{ productId: string }>;
}) {
  const { productId } = await params;
  return (
    <SequentialFlowGate needs={FLOW_GATE_FULL_SAVED}>
      <RecommendRunnerScreen productId={productId} />
    </SequentialFlowGate>
  );
}
