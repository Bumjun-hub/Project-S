// 이 파일은 상품 목록(`/products`) 라우트를 렌더링합니다.
import { SequentialFlowGate } from "@/components/common/SequentialFlowGate";
import ProductListScreen from "@/features/product/components/ProductListScreen";
import { FLOW_GATE_FULL_SAVED } from "@/lib/flow-gate-needs";

export default function ProductsPage() {
  return (
    <SequentialFlowGate needs={FLOW_GATE_FULL_SAVED}>
      <ProductListScreen />
    </SequentialFlowGate>
  );
}
