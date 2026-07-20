// 이 파일은 추천 분석 기록 화면의 UI와 상호작용을 담당합니다.
"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { EmptyState } from "@/components/common/EmptyState";
import { FlowFooterNav } from "@/components/common/FlowFooterNav";
import { PageContainer } from "@/components/layout/PageContainer";
import { useAnalysisHistoryStore } from "@/features/history/store";
import type { RecommendationRecord } from "@/features/history/types";
import styles from "./HistoryScreen.module.css";

function estimateFitFromSummary(summary: string) {
  if (summary.includes("오버")) return "오버핏";
  if (summary.includes("레귤러")) return "레귤러핏";
  if (summary.includes("슬림")) return "슬림핏";
  return "세미 오버핏";
}

function mostCommonRecommendedSize(records: RecommendationRecord[]): string {
  if (records.length === 0) return "—";
  const counts = new Map<string, number>();
  for (const r of records) {
    counts.set(r.recommendedSize, (counts.get(r.recommendedSize) ?? 0) + 1);
  }
  let best = records[0]!.recommendedSize;
  let bestN = -1;
  for (const [label, n] of counts) {
    if (n > bestN) {
      bestN = n;
      best = label;
    }
  }
  return best;
}

export default function HistoryScreen() {
  const router = useRouter();
  const history = useAnalysisHistoryStore((s) => s.history);
  const clearHistory = useAnalysisHistoryStore((s) => s.clearHistory);
  const setLastResult = useAnalysisHistoryStore((s) => s.setLastResult);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    setReady(true);
  }, []);

  const stats = useMemo(() => {
    const total = history.length;
    const recent =
      history[0] != null ? `${history[0].brand} · ${history[0].productName}` : "—";
    const topSize = mostCommonRecommendedSize(history);
    return { total, recent, topSize };
  }, [history]);

  if (!ready) {
    return (
      <PageContainer maxWidth={1100}>
        <p style={{ color: "var(--muted)" }}>불러오는 중…</p>
      </PageContainer>
    );
  }

  return (
    <PageContainer maxWidth={1100}>
      <div className={styles.page}>
        <header>
          <h1 style={{ marginTop: 0, marginBottom: "0.35rem" }}>분석 기록</h1>
          <p className={styles.lead}>
            브라우저에 저장됩니다(최대 40건). 새 기기와는 공유되지 않습니다.
          </p>
        </header>

        <section className={styles.statsGrid} aria-label="요약">
          <article className={styles.statCard}>
            <span className={styles.statLabel}>TOTAL</span>
            <p className={styles.statValue}>{stats.total}</p>
            <p className={styles.statSub}>총 분석 횟수</p>
          </article>
          <article className={styles.statCard}>
            <span className={styles.statLabel}>LATEST</span>
            <p className={styles.statValue}>{stats.recent}</p>
            <p className={styles.statSub}>가장 최근 분석 상품</p>
          </article>
          <article className={styles.statCard}>
            <span className={styles.statLabel}>MODE SIZE</span>
            <p className={styles.statValue}>{stats.topSize}</p>
            <p className={styles.statSub}>가장 많이 나온 추천 사이즈</p>
          </article>
        </section>

        <h2 className={styles.sectionTitle}>RECENT RUNS</h2>

        {history.length === 0 ? (
          <div className={styles.emptyWrap}>
            <EmptyState
              title="저장된 분석 기록이 없습니다"
              description="상품 목록에서 핏 분석을 실행하면 여기에 쌓입니다."
            >
              <FlowFooterNav items={[{ href: "/products", label: "상품 탐색으로 이동", variant: "primary" }]} />
            </EmptyState>
          </div>
        ) : (
          <ul className={styles.listGrid}>
            {history.map((h) => (
              <li key={h.id} className={styles.recordCard}>
                <p className={styles.recordDate}>{new Date(h.createdAt).toLocaleString("ko-KR")}</p>
                <p className={styles.recordTitle}>{h.productName}</p>
                <p className={styles.recordMeta}>
                  권장 사이즈 <strong>{h.recommendedSize}</strong>
                  {" · "}
                  예상 핏 {estimateFitFromSummary(h.summary)}
                </p>
                <div className={styles.badgeRow}>
                  <span className={styles.badgeFit}>AI FIT</span>
                </div>
                <div className={styles.actions}>
                  <button
                    type="button"
                    className={`${styles.btn} ${styles.btnGhost}`}
                    onClick={() => {
                      setLastResult(h);
                      router.push("/result");
                    }}
                  >
                    결과 다시보기
                  </button>
                  <Link href={`/products/${h.productId}`} className={`${styles.btn} ${styles.btnPrimary}`}>
                    상품 상세
                  </Link>
                </div>
              </li>
            ))}
          </ul>
        )}

        <div className={styles.toolbar}>
          <button
            type="button"
            className={styles.btnDanger}
            onClick={() => {
              if (history.length && confirm("모든 기록을 지울까요?")) clearHistory();
            }}
            disabled={history.length === 0}
          >
            기록 비우기
          </button>
        </div>

        <FlowFooterNav
          items={[
            { href: "/products", label: "상품 탐색" },
            { href: "/", label: "홈" },
          ]}
        />
      </div>
    </PageContainer>
  );
}
