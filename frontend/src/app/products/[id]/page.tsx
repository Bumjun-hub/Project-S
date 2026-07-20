// 이 파일은 상품 상세(`/products/[id]`) 라우트를 렌더링합니다.
import { SequentialFlowGate } from "@/components/common/SequentialFlowGate";
import ProductDetailScreen from "@/features/product/components/ProductDetailScreen";
import { FLOW_GATE_FULL_SAVED } from "@/lib/flow-gate-needs";

export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return (
    <SequentialFlowGate needs={FLOW_GATE_FULL_SAVED}>
      <ProductDetailScreen productId={id} />
    </SequentialFlowGate>
  );
}
