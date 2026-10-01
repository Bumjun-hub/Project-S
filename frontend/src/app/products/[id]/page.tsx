// 이 파일은 상품 상세(`/products/[id]`) 라우트를 렌더링합니다.
import ProductDetailScreen from "@/features/product/components/ProductDetailScreen";

export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return (
    <ProductDetailScreen productId={id} />
  );
}
