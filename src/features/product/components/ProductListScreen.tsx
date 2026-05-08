// 이 파일은 상품 목록 화면과 로딩/빈 상태 처리를 정의합니다.
"use client";

import Link from "next/link";
import { Card } from "@/components/common/Card";
import { EmptyState } from "@/components/common/EmptyState";
import { FlowStepCaption } from "@/components/common/FlowStepCaption";
import { Skeleton } from "@/components/common/Skeleton";
import { PageContainer } from "@/components/layout/PageContainer";
import { useProductsQuery } from "@/features/product/api/use-products-query";

export default function ProductListScreen() {
  const { data, isPending, isError } = useProductsQuery();

  return (
    <PageContainer maxWidth={720}>
      <FlowStepCaption step={4} label="상품 목록" />
      <h1 style={{ marginTop: 0 }}>상품</h1>
      <p style={{ color: "var(--muted)" }}>목록은 TanStack Query + mock API입니다.</p>

      {isPending ? (
        <div style={{ display: "grid", gap: "1rem" }}>
          <Skeleton height={88} />
          <Skeleton height={88} />
          <Skeleton height={88} />
        </div>
      ) : null}

      {isError ? (
        <EmptyState title="목록을 불러오지 못했습니다" description="잠시 후 다시 시도해 주세요." />
      ) : null}

      {!isPending && !isError && data && data.length === 0 ? (
        <EmptyState title="상품이 없습니다" />
      ) : null}

      {!isPending && data && data.length > 0 ? (
        <ul style={{ listStyle: "none", padding: 0, display: "grid", gap: "1rem" }}>
          {data.map((p) => (
            <li key={p.id}>
              <Card>
                <p style={{ margin: "0 0 0.25rem", fontSize: "0.8rem", color: "var(--muted)" }}>
                  {p.brand} · {p.category}
                </p>
                <h2 style={{ margin: "0 0 0.5rem", fontSize: "1.1rem" }}>
                  <Link href={`/products/${p.id}`}>{p.name}</Link>
                </h2>
                <p style={{ margin: 0 }}>{p.priceKrw.toLocaleString("ko-KR")}원</p>
              </Card>
            </li>
          ))}
        </ul>
      ) : null}

      <p style={{ marginTop: "1.5rem" }}>
        <Link href="/my-fit">← 기준 옷 실측</Link>
        {" · "}
        <Link href="/history">최근 기록</Link>
      </p>
    </PageContainer>
  );
}
