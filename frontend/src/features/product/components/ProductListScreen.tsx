// 이 파일은 상품 목록 화면과 로딩/빈 상태 처리를 정의합니다.
"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { EmptyState } from "@/components/common/EmptyState";
import { FlowFooterNav } from "@/components/common/FlowFooterNav";
import { FlowStepCaption } from "@/components/common/FlowStepCaption";
import { Input } from "@/components/common/Input";
import { Skeleton } from "@/components/common/Skeleton";
import { PageContainer } from "@/components/layout/PageContainer";
import { useProductsQuery } from "@/features/product/api/use-products-query";
import type { Product } from "@/features/product/types";
import styles from "./ProductListScreen.module.css";

type CategoryFilter = "all" | "상의" | "하의" | "아우터";

const FILTER_OPTIONS: Array<{ value: CategoryFilter; label: string }> = [
  { value: "all", label: "전체" },
  { value: "상의", label: "상의" },
  { value: "하의", label: "하의" },
  { value: "아우터", label: "아우터" },
];

function matchesSearch(p: Product, q: string) {
  const t = q.trim().toLowerCase();
  if (t === "") return true;
  return (
    p.name.toLowerCase().includes(t) ||
    p.brand.toLowerCase().includes(t) ||
    p.category.toLowerCase().includes(t) ||
    p.description.toLowerCase().includes(t)
  );
}

export default function ProductListScreen() {
  const { data, isPending, isError } = useProductsQuery();
  const [category, setCategory] = useState<CategoryFilter>("all");
  const [search, setSearch] = useState("");

  const filtered = useMemo(() => {
    if (!data) return [];
    return data.filter((p) => {
      const catOk = category === "all" || p.category === category;
      return catOk && matchesSearch(p, search);
    });
  }, [data, category, search]);

  return (
    <PageContainer maxWidth={1100}>
      <FlowStepCaption step={4} label="상품 탐색" />
      <div className={styles.page}>
        <header>
          <h1 style={{ marginTop: 0, marginBottom: "0.35rem" }}>상품 탐색</h1>
          <p className={styles.metaHint}>TanStack Query + Product API · 실측 사이즈표 기반 분석</p>
        </header>

        <section className={styles.intro} aria-label="페이지 안내">
          <p className={styles.introText}>
            내 체형 정보와 기준 옷을 바탕으로 핏을 분석할 상품을 선택하세요.
          </p>
        </section>

        <div className={styles.toolbar}>
          <div className={styles.filterRow} role="tablist" aria-label="카테고리 필터">
            {FILTER_OPTIONS.map((opt) => {
              const active = category === opt.value;
              return (
                <button
                  key={opt.value}
                  type="button"
                  role="tab"
                  aria-selected={active}
                  className={`${styles.filterPill}${active ? ` ${styles.filterPillActive}` : ""}`}
                  onClick={() => setCategory(opt.value)}
                >
                  {opt.label}
                </button>
              );
            })}
          </div>
          <div className={styles.searchWrap}>
            <Input
              type="search"
              placeholder="브랜드, 상품명, 설명 검색…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              aria-label="상품 검색"
            />
          </div>
        </div>

        {isPending ? (
          <div className={styles.grid} aria-busy="true" aria-label="목록 로딩">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className={styles.card}>
                <Skeleton height={200} width="100%" />
                <div className={styles.cardBody}>
                  <Skeleton height={14} width="55%" />
                  <Skeleton height={22} width="88%" />
                  <Skeleton height={18} width="40%" />
                </div>
              </div>
            ))}
          </div>
        ) : null}

        {isError ? (
          <EmptyState title="목록을 불러오지 못했습니다" description="잠시 후 다시 시도해 주세요." />
        ) : null}

        {!isPending && !isError && data && data.length === 0 ? (
          <EmptyState title="상품이 없습니다" />
        ) : null}

        {!isPending && !isError && data && data.length > 0 && filtered.length === 0 ? (
          <EmptyState
            title="조건에 맞는 상품이 없습니다"
            description="필터나 검색어를 바꿔 다시 시도해 주세요."
          />
        ) : null}

        {!isPending && filtered.length > 0 ? (
          <ul className={styles.grid} style={{ listStyle: "none", padding: 0, margin: 0 }}>
            {filtered.map((p) => (
              <li key={p.id} className={styles.card}>
                <div className={styles.cardImageWrap}>
                  <div className={styles.imagePlaceholder} aria-hidden>
                    <span className={styles.imageTag}>Look</span>
                  </div>
                </div>
                <div className={styles.cardBody}>
                  <p className={styles.cardMeta}>
                    {p.brand} · {p.category}
                  </p>
                  <h2 className={styles.cardTitle}>
                    <Link href={`/products/${p.id}`} className={styles.cardTitleLink}>
                      {p.name}
                    </Link>
                  </h2>
                  <p className={styles.price}>{p.priceKrw.toLocaleString("ko-KR")}원</p>
                  <div className={styles.badgeRow}>
                    <span className={styles.badge}>분석 가능</span>
                  </div>
                  <div className={styles.actions}>
                    <Link href={`/products/${p.id}`} className={styles.btnSecondary}>
                      상세 보기
                    </Link>
                    <Link href={`/recommend/${p.id}`} className={styles.btnPrimary}>
                      핏 분석하기
                    </Link>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        ) : null}

        <FlowFooterNav
          items={[
            { href: "/my-fit", label: "기준 옷 실측" },
            { href: "/history", label: "최근 기록" },
            { href: "/", label: "홈" },
          ]}
        />
      </div>
    </PageContainer>
  );
}
