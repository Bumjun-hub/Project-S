// 이 파일은 상품 상세 화면과 추천 시작 동선을 정의합니다.
import Link from "next/link";
import { notFound } from "next/navigation";
import { FlowStepCaption } from "@/components/common/FlowStepCaption";
import { PageContainer } from "@/components/layout/PageContainer";
import { getMockProduct } from "@/mocks/products.mock";

export default function ProductDetailScreen({ productId }: { productId: string }) {
  const product = getMockProduct(productId);
  if (!product) notFound();

  return (
    <PageContainer maxWidth={720}>
      <FlowStepCaption step={5} label="상품 상세" />
      <p style={{ margin: "0 0 0.25rem", fontSize: "0.85rem", color: "var(--muted)" }}>
        {product.brand} · {product.category}
      </p>
      <h1 style={{ marginTop: 0 }}>{product.name}</h1>
      <p style={{ fontSize: "1.1rem" }}>{product.priceKrw.toLocaleString("ko-KR")}원</p>
      <p style={{ lineHeight: 1.6 }}>{product.description}</p>

      <h2 style={{ fontSize: "1rem", marginTop: "1.5rem" }}>사이즈표 (mock)</h2>
      <p style={{ fontSize: "0.85rem", color: "var(--muted)" }}>
        축: {product.chartAxis === "chest" ? "가슴 둘레(cm)" : "허리 둘레(cm)"}
      </p>
      <table style={{ width: "100%", borderCollapse: "collapse", marginTop: "0.5rem" }}>
        <thead>
          <tr>
            <th style={{ border: "1px solid var(--border)", padding: "0.5rem", textAlign: "left" }}>
              라벨
            </th>
            <th style={{ border: "1px solid var(--border)", padding: "0.5rem", textAlign: "left" }}>
              최소
            </th>
            <th style={{ border: "1px solid var(--border)", padding: "0.5rem", textAlign: "left" }}>
              최대
            </th>
          </tr>
        </thead>
        <tbody>
          {product.sizeChart.map((row) => (
            <tr key={row.label}>
              <td style={{ border: "1px solid var(--border)", padding: "0.5rem" }}>{row.label}</td>
              <td style={{ border: "1px solid var(--border)", padding: "0.5rem" }}>{row.min}</td>
              <td style={{ border: "1px solid var(--border)", padding: "0.5rem" }}>{row.max}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <p style={{ marginTop: "1.5rem" }}>
        <Link
          href={`/recommend/${product.id}`}
          style={{ fontWeight: 600, textDecoration: "underline" }}
        >
          이 상품 사이즈 분석 (mock AI)
        </Link>
      </p>
      <p style={{ marginTop: "1rem" }}>
        <Link href="/products">← 목록</Link>
      </p>
    </PageContainer>
  );
}
