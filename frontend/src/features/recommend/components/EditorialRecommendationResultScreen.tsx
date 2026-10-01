"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { animate, motion, useReducedMotion } from "framer-motion";
import { AlertTriangle, ArrowRight, Check, CircleCheck, CircleMinus, CirclePlus } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { FlowFooterNav } from "@/components/common/FlowFooterNav";
import { GlassStateBlock } from "@/components/common/GlassStateBlock";
import { StepPageShell } from "@/components/layout/StepPageShell";
import { updateRecommendationFeedback } from "@/features/history/api";
import { useAnalysisHistoryStore } from "@/features/history/store";
import type { FitFeedback } from "@/features/history/types";
import { getProductImageSrc } from "@/features/product/lib/product-image";
import { readSessionIdentity, useSessionIdentity } from "@/lib/auth-session";
import type { MeasurementComparison } from "@/features/recommend/types";
import { isDemoMode } from "@/lib/demo-mode";
import styles from "./EditorialRecommendationResultScreen.module.css";

const feedbackOptions: Array<{
  value: FitFeedback;
  label: string;
  icon: typeof CircleMinus;
}> = [
  { value: "SMALL", label: "작았어요", icon: CircleMinus },
  { value: "GOOD", label: "잘 맞아요", icon: CircleCheck },
  { value: "LARGE", label: "컸어요", icon: CirclePlus },
];

function formatCm(value: number) {
  return `${value > 0 ? "+" : ""}${value.toFixed(1)} cm`;
}

function fitMarkerPosition(comparison: MeasurementComparison) {
  return Math.max(14, Math.min(82, 58 - comparison.differenceCm * 7));
}

function comparisonStatus(comparison: MeasurementComparison) {
  if (comparison.absoluteDifferenceCm <= 1) return "이상적인 범위";
  if (comparison.absoluteDifferenceCm <= 3) return "편안한 여유";
  return comparison.differenceCm < 0 ? "조금 타이트함" : "여유 있는 편";
}

export default function EditorialRecommendationResultScreen() {
  const lastResult = useAnalysisHistoryStore((state) => state.lastResult);
  const commitRecommendation = useAnalysisHistoryStore((state) => state.commitRecommendation);
  const identity = useSessionIdentity();
  const queryClient = useQueryClient();
  const [ready, setReady] = useState(false);
  const [displayedScore, setDisplayedScore] = useState(0);
  const [feedbackMessage, setFeedbackMessage] = useState("");
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
      delay: 0.22,
      ease: [0.22, 1, 0.36, 1],
      onUpdate: (value) => setDisplayedScore(Math.round(value)),
    });

    return () => controls.stop();
  }, [lastResult, resultMatchScore, shouldReduceMotion]);

  const feedbackMutation = useMutation({
    mutationFn: (feedback: FitFeedback) => updateRecommendationFeedback(lastResult?.id ?? "", feedback),
    onSuccess: (updated) => {
      if (readSessionIdentity() !== identity) return;
      const currentResult = useAnalysisHistoryStore.getState().lastResult;
      if (currentResult?.id === updated.id) commitRecommendation(updated);
      void queryClient.invalidateQueries({ queryKey: ["recommendation-history", identity] });
      setFeedbackMessage("피드백이 저장됐어요. 분석 기록에서 확인할 수 있어요.");
    },
    onError: () => setFeedbackMessage("피드백을 저장하지 못했어요. 잠시 후 다시 시도해 주세요."),
  });

  const comparisons = useMemo(() => lastResult?.comparisons ?? [], [lastResult]);

  const balanceAreas = useMemo(
    () => comparisons.slice(0, 3).map((comparison) => comparison.areaLabel).join(" · "),
    [comparisons],
  );

  const handleFeedback = (feedback: FitFeedback) => {
    if (!lastResult) return;
    setFeedbackMessage("");

    if (isDemoMode) {
      commitRecommendation({ ...lastResult, feedback });
      setFeedbackMessage("데모 기록에 피드백을 반영했어요.");
      return;
    }

    feedbackMutation.mutate(feedback);
  };

  if (!ready) {
    return (
      <StepPageShell step={7} label="추천 결과" title="추천 결과" maxWidth={960} panelClassName="result-panel-shell">
        <p>불러오는 중이에요.</p>
      </StepPageShell>
    );
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

  return (
    <main className={styles.resultPage}>
      <motion.section
        className={styles.productPanel}
        aria-labelledby="result-product-title"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: shouldReduceMotion ? 0 : 0.45 }}
      >
        <nav className={styles.breadcrumb} aria-label="현재 위치">
          <Link href="/products">Products</Link>
          <span aria-hidden>/</span>
          <span>Fit result</span>
        </nav>

        <div className={styles.productHeading}>
          <p>{lastResult.brand}</p>
          <h1 id="result-product-title">{lastResult.productName}</h1>
          <span>EVERYDAY BETTER FIT</span>
        </div>

        <div className={styles.productImage}>
          <Image
            src={getProductImageSrc(lastResult.productId)}
            alt={`${lastResult.brand} ${lastResult.productName}`}
            fill
            priority
            sizes="(max-width: 980px) 100vw, 50vw"
          />
        </div>

        <p className={styles.imageCaption}>
          <span aria-hidden />
          SAME BASICS.
          <br />A BETTER YOU.
        </p>
      </motion.section>

      <motion.section
        className={styles.analysisPanel}
        aria-labelledby="recommended-size-heading"
        initial={{ opacity: 0, x: 24 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: shouldReduceMotion ? 0 : 0.58, ease: [0.22, 1, 0.36, 1] }}
      >
        <div className={styles.analysisKicker}>
          <span>FIT INTELLIGENCE<br />FOR A MORE YOU</span>
          <i aria-hidden />
          <b>PROJECT S</b>
        </div>

        <section className={styles.resultSummary}>
          <div className={styles.sizeBlock}>
            <span>YOUR RECOMMENDED SIZE</span>
            <strong id="recommended-size-heading">{lastResult.recommendedSize}</strong>
          </div>
          <div className={styles.matchBlock}>
            <p><strong>{displayedScore}%</strong> match</p>
            <div className={styles.scoreTrack} aria-label={`추천 일치도 ${matchScore}%`}>
              <motion.i
                initial={{ width: 0 }}
                animate={{ width: `${matchScore}%` }}
                transition={{ duration: shouldReduceMotion ? 0 : 0.8, delay: shouldReduceMotion ? 0 : 0.2, ease: [0.22, 1, 0.36, 1] }}
              />
            </div>
            <p>{balanceAreas ? `${balanceAreas} 등 비교한 부위의 오차가 가장 작은 선택이에요.` : "저장된 추천 사유를 아래에서 확인해 주세요."}</p>
          </div>
        </section>

        {isLowConfidence ? (
          <section className={styles.cautionBanner} aria-label="추천 정확도 안내">
            <AlertTriangle size={18} aria-hidden />
            <p><b>일치도가 낮은 편이에요.</b> 부위별 실측 차이를 확인하거나 다른 상품과 비교해 보세요.</p>
          </section>
        ) : null}

        <section className={styles.breakdown} aria-labelledby="breakdown-heading">
          <div className={styles.sectionTitleRow}>
            <h2 id="breakdown-heading">FIT BREAKDOWN</h2>
            <div className={styles.legend} aria-label="비교 범례">
              <span><i className={styles.fitDot} aria-hidden />내 목표 실측</span>
              <span><i className={styles.productDot} aria-hidden />상품 실측</span>
            </div>
          </div>

          {comparisons.length ? (
            <div className={styles.comparisonList}>
              {comparisons.map((comparison) => (
                <article className={styles.comparisonRow} key={comparison.area}>
                  <div className={styles.areaCopy}>
                    <h3>{comparison.areaLabel}</h3>
                    <p>{comparison.message}</p>
                  </div>
                  <div className={styles.measureTrack} aria-label={`${comparison.areaLabel}: 목표 ${comparison.targetSizeCm.toFixed(1)}cm, 상품 ${comparison.productSizeCm.toFixed(1)}cm`}>
                    <span className={styles.trackLine} aria-hidden />
                    <span className={styles.fitMarker} style={{ left: `${fitMarkerPosition(comparison)}%` }}>
                      <b>{comparison.targetSizeCm.toFixed(1)} cm</b>
                      <i aria-hidden />
                    </span>
                    <span className={styles.productMarker}>
                      <b>{comparison.productSizeCm.toFixed(1)} cm</b>
                      <i aria-hidden />
                    </span>
                  </div>
                  <div className={styles.difference}>
                    <strong>{formatCm(comparison.differenceCm)}</strong>
                    <span>{comparisonStatus(comparison)}</span>
                  </div>
                </article>
              ))}
            </div>
          ) : (
            <p className={styles.emptyBreakdown}>부위별 상세 수치는 최근 분석에서 확인할 수 있어요.</p>
          )}
        </section>

        <section className={styles.reason} aria-labelledby="reason-heading">
          <h2 id="reason-heading">WHY THIS SIZE?</h2>
          <div>
            <span className={styles.reasonIcon}><Check size={18} aria-hidden /></span>
            <p><strong>{lastResult.recommendedSize} 사이즈</strong>는 기준 옷의 실측과 착용감으로 보정한 목표 실측에 가장 가까운 선택이에요. {lastResult.summary}<br />일치도는 실측 비교 점수이며, 실제 착용 성공 확률은 아닙니다. 체형 태그나 착용 피드백은 현재 계산에 사용되지 않습니다.</p>
          </div>
        </section>

        <section className={styles.feedback} aria-labelledby="feedback-heading">
          <h2 id="feedback-heading">HOW DID THIS FIT?</h2>
          <div className={styles.feedbackButtons}>
            {feedbackOptions.map((option) => {
              const Icon = option.icon;
              const isActive = lastResult.feedback === option.value;
              return (
                <button
                  key={option.value}
                  type="button"
                  className={isActive ? styles.feedbackActive : undefined}
                  aria-pressed={isActive}
                  disabled={feedbackMutation.isPending}
                  onClick={() => handleFeedback(option.value)}
                >
                  <Icon size={24} aria-hidden />
                  {option.label}
                </button>
              );
            })}
          </div>
          {feedbackMessage ? <p className={styles.feedbackMessage} role="status">{feedbackMessage}</p> : null}
        </section>

        <div className={styles.actions}>
          <Link href="/products" className={styles.primaryAction}>
            다른 상품 보기 <ArrowRight size={19} aria-hidden />
          </Link>
          <Link href="/history" className={styles.secondaryAction}>분석 기록 보기</Link>
        </div>

        <p className={styles.analysisFooter}>BETTER FITS<br />A BRIGHTER EVERYDAY <span aria-hidden /></p>
      </motion.section>
    </main>
  );
}
