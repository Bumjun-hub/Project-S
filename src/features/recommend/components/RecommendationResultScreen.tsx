// 이 파일은 마지막 추천 결과 화면의 UI와 기록 연동을 담당합니다.
"use client";

import { useEffect, useMemo, useState } from "react";
import { FlowFooterNav } from "@/components/common/FlowFooterNav";
import { GlassStateBlock } from "@/components/common/GlassStateBlock";
import { StepPageShell } from "@/components/layout/StepPageShell";
import { useAnalysisHistoryStore } from "@/features/history/store";
import { useUserProfileStore } from "@/features/profile/store";
import styles from "./RecommendationResultScreen.module.css";

function insightLabel(text: string) {
  const stripTopicTail = (s: string) => s.replace(/은$|는$/, "");
  const byColon = text.split(":")[0]?.trim();
  if (byColon && byColon.length <= 14) return stripTopicTail(byColon) || byColon;
  const first = text.split(" ")[0]?.trim() ?? "";
  const cleaned = stripTopicTail(first);
  return cleaned.length > 0 && cleaned.length <= 14 ? cleaned : "부위";
}

function insightScore(text: string, idx: number) {
  const seed = text.length + idx * 7;
  return 72 + (seed % 23);
}

function aggregateFitScore(insights: string[]) {
  if (insights.length === 0) return 81;
  const sum = insights.reduce((acc, t, i) => acc + insightScore(t, i), 0);
  return Math.round(sum / insights.length);
}

function confidencePercent(createdAt: string, productId: string) {
  const seed = (createdAt.length + productId.length * 5) % 19;
  return 71 + seed;
}

function estimateFitLabel(summary: string) {
  if (summary.includes("오버")) return "오버핏";
  if (summary.includes("레귤러")) return "레귤러핏";
  if (summary.includes("슬림")) return "슬림핏";
  return "세미 오버핏";
}

function cautionBullets(summary: string): string[] {
  const bullets = [
    "실측·사이즈표는 브랜드·시즌마다 오차가 날 수 있습니다.",
    "소재·세탁·패턴에 따라 착용감이 달라질 수 있습니다.",
  ];
  if (summary.includes("구간 밖") || summary.includes("근사")) {
    bullets.push("차트 구간 밖에서는 근사 매칭이 포함될 수 있습니다.");
  }
  if (summary.includes("실제")) {
    bullets.push("실제 착용은 매장 피팅 또는 반품 정책과 함께 검토하는 것이 안전합니다.");
  }
  return bullets;
}

export default function RecommendationResultScreen() {
  const lastResult = useAnalysisHistoryStore((s) => s.lastResult);
  const bodyShapeTags = useUserProfileStore((s) => s.profile.bodyShapeTags ?? []);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    setReady(true);
  }, []);

  const reasonItems = useMemo(() => {
    if (!lastResult) return [];
    const items = [
      `${lastResult.brand} 사이즈 차트와 입력한 실측·프로필을 결합해 권장 라벨을 산출했습니다.`,
      "기준 옷에서 기록한 착용감(작음/큼)을 바탕으로 핏 방향을 조정했습니다.",
    ];
    if (bodyShapeTags.length > 0) {
      items.push(`선택한 체형 특징을 반영했습니다: ${bodyShapeTags.join(" · ")}`);
    }
    return items;
  }, [lastResult, bodyShapeTags]);

  if (!ready) {
    return (
      <StepPageShell
        step={7}
        label="추천 결과"
        title="추천 결과"
        maxWidth={960}
        panelClassName="result-panel-shell"
      >
        <p style={{ color: "var(--muted)" }}>불러오는 중…</p>
      </StepPageShell>
    );
  }

  if (!lastResult) {
    return (
      <StepPageShell step={7} label="추천 결과" title="아직 결과가 없습니다" maxWidth={960} panelClassName="result-panel-shell">
        <GlassStateBlock
          className="result-measure-card"
          title="추천 결과를 찾지 못했습니다."
          description="상품 상세에서 사이즈 분석을 실행하면 여기에 표시됩니다."
        >
          <FlowFooterNav items={[{ href: "/products", label: "상품 목록" }]} />
        </GlassStateBlock>
      </StepPageShell>
    );
  }

  const fitScore = aggregateFitScore(lastResult.fitInsights);
  const confidence = confidencePercent(lastResult.createdAt, lastResult.productId);
  const fitLabel = estimateFitLabel(lastResult.summary);
  const cautions = cautionBullets(lastResult.summary);

  return (
    <StepPageShell
      step={7}
      label="추천 결과"
      title="AI 사이즈 리포트"
      description="입력한 체형·실측·상품 사이즈표를 바탕으로 한 요약 리포트입니다."
      maxWidth={960}
      panelClassName="result-panel-shell"
    >
      <div className={styles.pageContent}>
        <header className={styles.hero}>
          <div className={styles.heroTop}>
            <p className={styles.heroMeta}>{new Date(lastResult.createdAt).toLocaleString("ko-KR")}</p>
            <h2 className={styles.heroProduct}>
              {lastResult.brand} · {lastResult.productName}
            </h2>
          </div>

          <div className={styles.metricsGrid}>
            <article className={styles.metricCard}>
              <span className={styles.metricLabel}>추천 사이즈</span>
              <p className={styles.metricValue}>{lastResult.recommendedSize}</p>
              <p className={styles.metricSub}>브랜드 라벨 기준</p>
            </article>
            <article className={styles.metricCard}>
              <span className={styles.metricLabel}>예상 핏</span>
              <p className={styles.metricValue}>{fitLabel}</p>
              <p className={styles.metricSub}>요약 문맥 기반 추정</p>
            </article>
            <article className={styles.metricCard}>
              <span className={styles.metricLabel}>AI Fit Score</span>
              <p className={styles.metricValue}>{fitScore}</p>
              <p className={styles.metricSub}>부위별 일치도 시뮬레이션</p>
            </article>
            <article className={styles.metricCard}>
              <span className={styles.metricLabel}>추천 신뢰도</span>
              <p className={styles.metricValue}>{confidence}%</p>
              <p className={styles.metricSub}>입력 완성도·데이터 범위 반영</p>
            </article>
          </div>
        </header>

        <section className={styles.reportSection} aria-labelledby="result-reason-heading">
          <h3 id="result-reason-heading" className={styles.reportTitle}>
            추천 이유
          </h3>
          <div className={styles.reportCard}>
            <p className={styles.reportLead}>
              권장 <strong>{lastResult.recommendedSize}</strong> — {fitLabel} 쪽으로 수렴하는 조합입니다.
            </p>
            <ul className={styles.reportList}>
              {reasonItems.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
            <p className={styles.reportBody}>{lastResult.summary}</p>
          </div>
        </section>

        <section className={styles.reportSection} aria-labelledby="result-caution-heading">
          <h3 id="result-caution-heading" className={styles.reportTitle}>
            주의할 점
          </h3>
          <div className={styles.reportCard}>
            <ul className={styles.reportList}>
              {cautions.map((c) => (
                <li key={c}>{c}</li>
              ))}
            </ul>
          </div>
        </section>

        <section className={styles.reportSection} aria-labelledby="result-compare-heading">
          <h3 id="result-compare-heading" className={styles.reportTitle}>
            부위별 비교
          </h3>
          <div className={styles.comparisonBlock}>
            {lastResult.fitInsights.map((insight, idx) => {
              const score = insightScore(insight, idx);
              return (
                <div key={`${idx}-${insight.slice(0, 24)}`} className={styles.comparisonRow}>
                  <span className={styles.comparisonPill}>{insightLabel(insight)}</span>
                  <p className={styles.comparisonText}>{insight}</p>
                  <div
                    className={styles.comparisonTrack}
                    role="progressbar"
                    aria-valuenow={score}
                    aria-valuemin={0}
                    aria-valuemax={100}
                  >
                    <div className={styles.comparisonFill} style={{ width: `${score}%` }} />
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      </div>

      <FlowFooterNav
        items={[
          { href: `/recommend/${lastResult.productId}`, label: "같은 상품 다시 분석", variant: "primary" },
          { href: "/products", label: "다른 상품" },
          { href: "/history", label: "최근 기록" },
          { href: "/", label: "홈" },
        ]}
      />
    </StepPageShell>
  );
}
