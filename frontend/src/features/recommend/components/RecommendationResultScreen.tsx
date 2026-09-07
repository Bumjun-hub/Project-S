"use client";

import { AlertTriangle, Check, ChevronDown, Ruler } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { animate, motion, useReducedMotion } from "framer-motion";
import { FlowFooterNav } from "@/components/common/FlowFooterNav";
import { GlassStateBlock } from "@/components/common/GlassStateBlock";
import { StepPageShell } from "@/components/layout/StepPageShell";
import { useAnalysisHistoryStore } from "@/features/history/store";
import { useUserProfileStore } from "@/features/profile/store";
import type { MeasurementComparison } from "@/features/recommend/types";
import styles from "./RecommendationResultScreen.module.css";

function formatCm(value: number) {
  return `${value > 0 ? "+" : ""}${value.toFixed(1)}cm`;
}

function comparisonProgress(comparison: MeasurementComparison) {
  return Math.max(8, Math.min(100, Math.round(100 - comparison.absoluteDifferenceCm * 18)));
}

function fitLabel(summary: string) {
  if (summary.includes("오버")) return "세미 오버핏";
  if (summary.includes("슬림")) return "슬림핏";
  if (summary.includes("정사이즈")) return "정사이즈";
  return "편안한 핏";
}

export default function RecommendationResultScreen() {
  const lastResult = useAnalysisHistoryStore((state) => state.lastResult);
  const bodyShapeTags = useUserProfileStore((state) => state.profile.bodyShapeTags ?? []);
  const [ready, setReady] = useState(false);
  const [openArea, setOpenArea] = useState<string | null>(null);
  const [displayedScore, setDisplayedScore] = useState(0);
  const shouldReduceMotion = useReducedMotion();
  const resultMatchScore = lastResult?.matchScore ?? 0;

  useEffect(() => setReady(true), []);

  useEffect(() => {
    if (!lastResult || shouldReduceMotion) {
      setDisplayedScore(resultMatchScore);
      return;
    }

    const controls = animate(0, resultMatchScore, {
      duration: 0.85,
      delay: 0.3,
      ease: [0.22, 1, 0.36, 1],
      onUpdate: (value) => setDisplayedScore(Math.round(value)),
    });

    return () => controls.stop();
  }, [lastResult, resultMatchScore, shouldReduceMotion]);

  const reasonItems = useMemo(() => {
    if (!lastResult) return [];
    return [
      "기준 옷의 착용감과 상품 실측을 부위별로 비교했어요.",
      bodyShapeTags.length ? `선택한 체형 특징을 함께 반영했어요: ${bodyShapeTags.join(" · ")}` : "평소 선호하는 착용감을 함께 반영했어요.",
    ];
  }, [bodyShapeTags, lastResult]);

  if (!ready) {
    return <StepPageShell step={7} label="추천 결과" title="추천 결과" maxWidth={960} panelClassName="result-panel-shell"><p>불러오는 중이에요.</p></StepPageShell>;
  }

  if (!lastResult) {
    return (
      <StepPageShell step={7} label="추천 결과" title="아직 결과가 없어요" maxWidth={960} panelClassName="result-panel-shell">
        <GlassStateBlock className="result-measure-card" title="추천 결과를 찾지 못했어요" description="상품 상세에서 사이즈 분석을 실행하면 여기에 표시됩니다.">
          <FlowFooterNav items={[{ href: "/products", label: "상품 목록" }]} />
        </GlassStateBlock>
      </StepPageShell>
    );
  }

  const matchScore = resultMatchScore;
  const isLowConfidence = matchScore < 50;
  const label = fitLabel(lastResult.summary);
  const comparisons = lastResult.comparisons ?? [];

  return (
    <StepPageShell step={7} label="추천 결과" title="맞춤 사이즈 추천" description="기준 옷의 착용감과 상품 실측을 비교한 결과예요." maxWidth={960} panelClassName="result-panel-shell">
      <div className={styles.pageContent}>
        <motion.section
          className={styles.recommendationHero}
          aria-labelledby="recommended-size-heading"
          initial={shouldReduceMotion ? false : { opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
        >
          <div className={styles.productMeta}>
            <p>{new Date(lastResult.createdAt).toLocaleString("ko-KR")}</p>
            <h2>{lastResult.brand} · {lastResult.productName}</h2>
          </div>
          <div className={styles.resultSummary}>
            <div><span>추천 사이즈</span><motion.strong id="recommended-size-heading" initial={shouldReduceMotion ? false : { opacity: 0, scale: 0.72 }} animate={{ opacity: 1, scale: 1 }} transition={{ type: "spring", stiffness: 280, damping: 18, delay: 0.12 }}>{lastResult.recommendedSize}</motion.strong></div>
            <div className={styles.fitCopy}><b>{label}</b><p>내 기준 옷과 비교한 결과예요.</p></div>
            <motion.div className={styles.scoreBadge} initial={shouldReduceMotion ? false : { opacity: 0, x: 12 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.35, delay: 0.2 }}><span>일치도</span><b>{displayedScore}%</b></motion.div>
          </div>
          <div className={styles.scoreTrack}><motion.i initial={shouldReduceMotion ? { width: `${matchScore}%` } : { width: "0%" }} animate={{ width: `${matchScore}%` }} transition={{ duration: 0.8, delay: 0.3, ease: [0.22, 1, 0.36, 1] }} /></div>
        </motion.section>

        {isLowConfidence ? (
          <section className={styles.cautionBanner} aria-label="추천 정확도 안내">
            <AlertTriangle size={20} /><div><b>추천 정확도가 낮아요.</b><p>현재 상품은 기준 옷과 차이가 커요. 아래 부위별 비교를 확인하거나 다른 상품도 비교해 보세요.</p></div>
          </section>
        ) : null}

        <motion.section className={styles.reportSection} aria-labelledby="reason-heading" initial={shouldReduceMotion ? false : { opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: 0.35 }}>
          <h3 id="reason-heading">추천 근거</h3>
          <div className={styles.reasonCard}>
            <p className={styles.reasonLead}><strong>{lastResult.recommendedSize}</strong> 사이즈가 현재 기준에서 가장 가까운 선택이에요.</p>
            <ul>{reasonItems.map((item) => <li key={item}><Check size={15} />{item}</li>)}</ul>
            <p className={styles.summary}>{lastResult.summary}</p>
          </div>
        </motion.section>

        <motion.section className={styles.reportSection} aria-labelledby="comparison-heading" initial={shouldReduceMotion ? false : { opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: 0.45 }}>
          <div className={styles.sectionHeading}><div><h3 id="comparison-heading">부위별 비교</h3><p>항목을 누르면 상세 수치와 설명을 볼 수 있어요.</p></div><Ruler size={20} /></div>
          <div className={styles.comparisonList}>
            {comparisons.map((comparison) => {
              const isOpen = openArea === comparison.area;
              const score = comparisonProgress(comparison);
              return (
                <motion.article key={comparison.area} className={styles.comparisonItem} initial={shouldReduceMotion ? false : { opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.28, delay: 0.5 + comparisons.indexOf(comparison) * 0.07 }}>
                  <button type="button" onClick={() => setOpenArea(isOpen ? null : comparison.area)} aria-expanded={isOpen}>
                    <span className={styles.areaName}>{comparison.areaLabel}</span>
                    <span className={styles.areaResult}>{formatCm(comparison.differenceCm)}</span>
                    <span className={styles.areaStatus}>{comparison.absoluteDifferenceCm <= 3 ? "적당함" : comparison.differenceCm < 0 ? "작음" : "큼"}</span>
                    <ChevronDown className={isOpen ? styles.chevronOpen : undefined} size={18} />
                  </button>
                  {isOpen ? <div className={styles.comparisonDetails}><p>기준 {comparison.myFitSizeCm.toFixed(1)}cm · 목표 {comparison.targetSizeCm.toFixed(1)}cm · 상품 {comparison.productSizeCm.toFixed(1)}cm</p><p>{comparison.message}</p><div><i style={{ width: `${score}%` }} /></div></div> : null}
                </motion.article>
              );
            })}
          </div>
        </motion.section>
      </div>
      <FlowFooterNav items={[{ href: `/recommend/${lastResult.productId}`, label: "같은 상품 다시 분석", variant: "primary" }, { href: "/products", label: "다른 상품 고르기" }, { href: "/history", label: "최근 기록" }]} />
    </StepPageShell>
  );
}
