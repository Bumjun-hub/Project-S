"use client";

import Link from "next/link";
import type { ReactNode } from "react";
import { useEffect, useRef, useState } from "react";
import { motion, useInView } from "framer-motion";
import { LandingStartSection } from "@/features/landing/components/LandingStartSection";
import styles from "@/features/landing/components/LandingTimelineDetails.module.css";

const barLines = [
  { metric: "어깨", diff: "+2cm", width: "74%" },
  { metric: "총장", diff: "유사", width: "59%" },
  { metric: "품", diff: "약간 여유", width: "68%" },
] as const;

const flowSteps = ["프로필 입력", "기준 옷 등록", "상품 선택", "실측 비교", "결과 확인"] as const;

const inputFields = [
  { label: "키", value: "172cm" },
  { label: "몸무게", value: "63kg" },
  { label: "기준 옷", value: "Nike Hoodie M" },
  { label: "어깨", value: "52cm" },
] as const;

/** 허브(중앙 PROBLEM) ~ 주변 카드 대략 중심 (viewBox 0~100 %) */
const HUB_LINE_TARGETS: readonly [number, number][] = [
  [69, 26],
  [33, 52],
  [71, 48],
  [36, 70],
];

type IdleKind = "card" | "result" | "timeline" | "none";

const idleDurationSec: Record<IdleKind, number> = {
  card: 6.6,
  result: 7.2,
  timeline: 5.8,
  none: 0,
};

type ScatterOffset = { x: number; y: number };

function useIdleAfterReveal(extraDelayMs: number) {
  const ref = useRef<HTMLDivElement | null>(null);
  const inView = useInView(ref, { once: true, amount: 0.08 });
  const [idle, setIdle] = useState(false);

  useEffect(() => {
    if (!inView) return undefined;
    const id = window.setTimeout(() => setIdle(true), 420 + extraDelayMs);
    return () => window.clearTimeout(id);
  }, [extraDelayMs, inView]);

  return { ref, inView, idle };
}

function ShowcaseFloatPiece({
  className,
  children,
  delayedMs = 0,
  idleKind,
  enterY = 32,
  scatter,
}: {
  className?: string;
  children: ReactNode;
  delayedMs?: number;
  idleKind: IdleKind;
  enterY?: number;
  scatter?: ScatterOffset;
}) {
  const { ref, inView, idle } = useIdleAfterReveal(delayedMs);
  const idleOn = idle && idleKind !== "none";
  const dur = idleDurationSec[idleKind];
  const useScatter = scatter != null;

  const idleAnimate =
    idleKind === "timeline"
      ? { opacity: [0.94, 1, 0.94] }
      : idleKind === "result"
        ? { y: [0, -6, 0] }
        : idleKind === "card"
          ? { y: [0, -5, 0] }
          : {};

  const initialState = useScatter
    ? { opacity: 0, x: scatter.x, y: scatter.y, scale: 0.9 }
    : { opacity: 0, y: enterY };

  const activeState = useScatter
    ? { opacity: 1, x: 0, y: 0, scale: 1 }
    : { opacity: 1, y: 0 };

  return (
    <motion.div
      ref={ref}
      className={className}
      initial={initialState}
      animate={inView ? activeState : initialState}
      transition={
        useScatter
          ? {
              delay: delayedMs / 1000,
              type: "spring",
              stiffness: 86,
              damping: 14,
              mass: 0.82,
            }
          : { duration: 0.56, delay: delayedMs / 1000, ease: [0.22, 1, 0.36, 1] }
      }
    >
      <motion.div whileHover={{ y: -3 }} transition={{ duration: 0.2, ease: "easeOut" }}>
        <motion.div
          animate={idleOn ? idleAnimate : idleKind === "timeline" ? { opacity: 1 } : { y: 0 }}
          transition={
            idleOn
              ? { duration: dur, repeat: Infinity, ease: "easeInOut" }
              : { duration: 0.32 }
          }
        >
          {children}
        </motion.div>
      </motion.div>
    </motion.div>
  );
}

function AmbientFloatPiece({
  className,
  children,
  delayedMs = 0,
  scatter,
  drift = 5,
}: {
  className?: string;
  children: ReactNode;
  delayedMs?: number;
  scatter: ScatterOffset;
  drift?: number;
}) {
  const { ref, inView, idle } = useIdleAfterReveal(delayedMs);
  const idleOn = idle && inView;

  return (
    <motion.div
      ref={ref}
      className={className}
      initial={{ opacity: 0, x: scatter.x, y: scatter.y, scale: 0.94 }}
      animate={inView ? { opacity: 1, x: 0, y: 0, scale: 1 } : { opacity: 0, x: scatter.x, y: scatter.y, scale: 0.94 }}
      transition={{
        delay: delayedMs / 1000,
        type: "spring",
        stiffness: 82,
        damping: 16,
        mass: 0.75,
      }}
    >
      <motion.div
        animate={idleOn ? { y: [0, -drift, 0], opacity: [0.78, 1, 0.78] } : { y: 0, opacity: 1 }}
        transition={
          idleOn
            ? { duration: 5.4, repeat: Infinity, ease: "easeInOut" }
            : { duration: 0.3, ease: "easeOut" }
        }
      >
        {children}
      </motion.div>
    </motion.div>
  );
}

export function LandingTimelineDetails() {
  const hubRef = useRef<HTMLDivElement>(null);
  const hubInView = useInView(hubRef, { once: true, amount: 0.12 });

  return (
    <div>
      <section className={styles.showcase} aria-label="Project S 분석 기능 쇼케이스">
        <div className={styles.overlay} aria-hidden />

        <div className={styles.floatRoot}>
          <motion.svg
            className={styles.hubLinks}
            viewBox="0 0 100 100"
            preserveAspectRatio="none"
            aria-hidden
            initial={{ opacity: 0 }}
            animate={hubInView ? { opacity: 0.95 } : { opacity: 0 }}
            transition={{ delay: 0.4, duration: 0.75, ease: "easeOut" }}
          >
            {HUB_LINE_TARGETS.map(([tx, ty], i) => (
              <line key={i} x1="50" y1="46" x2={tx} y2={ty} />
            ))}
          </motion.svg>

          <div ref={hubRef} className={styles.problemHub}>
            <ShowcaseFloatPiece className={styles.problemHubInner} delayedMs={0} idleKind="none">
              <span className={styles.hubEyebrow}>PROBLEM</span>
              <h3 className={styles.hubProblemTitle}>
                브랜드마다 같은 M이어도
                <br />
                실제 실측은 다릅니다
              </h3>
              <p className={styles.hubProblemBody}>
                작은 수치 차이가 착용감 실패로 이어집니다. 사이즈 표기보다 실측 비교가 더 정확합니다.
              </p>
            </ShowcaseFloatPiece>
          </div>

          <AmbientFloatPiece
            className={`${styles.microGlass} ${styles.aiMatchScore} ${styles.depthStrong}`}
            delayedMs={280}
            scatter={{ x: -18, y: 10 }}
            drift={4}
          >
            <p className={styles.microKicker}>Fit Confidence</p>
            <p className={styles.microMetricValue}>92%</p>
          </AmbientFloatPiece>

          <AmbientFloatPiece
            className={`${styles.microGlass} ${styles.aiTooltipA} ${styles.depthSoft}`}
            delayedMs={360}
            scatter={{ x: 16, y: 14 }}
            drift={3}
          >
            <p className={styles.microTooltipText}>Similar fit to your Nike Hoodie</p>
          </AmbientFloatPiece>

          <AmbientFloatPiece
            className={`${styles.microGlass} ${styles.aiTooltipB} ${styles.depthSoft}`}
            delayedMs={420}
            scatter={{ x: -14, y: 11 }}
            drift={3}
          >
            <p className={styles.microTooltipText}>Shoulder fit adjusted from your reference</p>
          </AmbientFloatPiece>

          <AmbientFloatPiece
            className={`${styles.microGlass} ${styles.miniMetricsPanel} ${styles.depthMid}`}
            delayedMs={520}
            scatter={{ x: -24, y: 8 }}
            drift={4}
          >
            <p className={styles.microKicker}>Live Metrics</p>
            <div className={styles.miniMetricRow}>
              <span>Shoulder</span>
              <span>94%</span>
            </div>
            <div className={styles.miniTrack}><span style={{ width: "94%" }} /></div>
            <div className={styles.miniMetricRow}>
              <span>Length</span>
              <span>88%</span>
            </div>
            <div className={styles.miniTrack}><span style={{ width: "88%" }} /></div>
            <div className={styles.miniMetricRow}>
              <span>Fit Balance</span>
              <span>91%</span>
            </div>
            <div className={styles.miniTrack}><span style={{ width: "91%" }} /></div>
          </AmbientFloatPiece>

          <AmbientFloatPiece
            className={`${styles.microPill} ${styles.statusBadgeA} ${styles.depthMid}`}
            delayedMs={400}
            scatter={{ x: 20, y: 12 }}
            drift={4}
          >
            Size Matched
          </AmbientFloatPiece>
          <AmbientFloatPiece
            className={`${styles.microPill} ${styles.statusBadgeB} ${styles.depthStrong}`}
            delayedMs={480}
            scatter={{ x: -16, y: 10 }}
            drift={4}
          >
            Best Match
          </AmbientFloatPiece>
          <AmbientFloatPiece
            className={`${styles.microPill} ${styles.statusBadgeC} ${styles.depthSoft}`}
            delayedMs={200}
            scatter={{ x: 14, y: 8 }}
            drift={3}
          >
            Semi Oversized
          </AmbientFloatPiece>
          <AmbientFloatPiece
            className={`${styles.microPill} ${styles.statusBadgeD} ${styles.depthSoft}`}
            delayedMs={320}
            scatter={{ x: -12, y: 9 }}
            drift={3}
          >
            Fit Stable
          </AmbientFloatPiece>

          <AmbientFloatPiece
            className={`${styles.microPill} ${styles.measureChipA} ${styles.depthSoft}`}
            delayedMs={440}
            scatter={{ x: 16, y: 7 }}
            drift={3}
          >
            Shoulder +2cm
          </AmbientFloatPiece>
          <AmbientFloatPiece
            className={`${styles.microPill} ${styles.measureChipB} ${styles.depthSoft}`}
            delayedMs={500}
            scatter={{ x: -13, y: 8 }}
            drift={3}
          >
            Length Similar
          </AmbientFloatPiece>
          <AmbientFloatPiece
            className={`${styles.microPill} ${styles.measureChipC} ${styles.depthSoft}`}
            delayedMs={560}
            scatter={{ x: 15, y: 10 }}
            drift={3}
          >
            Relaxed Width
          </AmbientFloatPiece>
          <AmbientFloatPiece
            className={`${styles.microPill} ${styles.measureChipD} ${styles.depthSoft}`}
            delayedMs={620}
            scatter={{ x: -17, y: 9 }}
            drift={3}
          >
            Drop Shoulder Match
          </AmbientFloatPiece>

          <AmbientFloatPiece
            className={`${styles.brandTag} ${styles.brandTagA} ${styles.depthSoft}`}
            delayedMs={340}
            scatter={{ x: 20, y: 10 }}
            drift={3}
          >
            Nike
          </AmbientFloatPiece>
          <AmbientFloatPiece
            className={`${styles.brandTag} ${styles.brandTagB} ${styles.depthSoft}`}
            delayedMs={260}
            scatter={{ x: -18, y: 12 }}
            drift={3}
          >
            Musinsa
          </AmbientFloatPiece>
          <AmbientFloatPiece
            className={`${styles.brandTag} ${styles.brandTagC} ${styles.depthSoft}`}
            delayedMs={460}
            scatter={{ x: 13, y: 8 }}
            drift={3}
          >
            Matin Kim
          </AmbientFloatPiece>
          <AmbientFloatPiece
            className={`${styles.brandTag} ${styles.brandTagD} ${styles.depthSoft}`}
            delayedMs={540}
            scatter={{ x: -16, y: 9 }}
            drift={3}
          >
            Thisisneverthat
          </AmbientFloatPiece>

          <ShowcaseFloatPiece
            className={`${styles.scatterCard} ${styles.scatterCompare}`}
            delayedMs={260}
            idleKind="card"
            scatter={{ x: -22, y: 12 }}
          >
            <p className={styles.sectionEyebrowMuted}>브랜드 실측</p>
            <div className={styles.compareBlock}>
              <p className={styles.compareBrand}>Nike M</p>
              <div className={styles.compareMeasures}>
                <span>총장 69</span>
                <span>어깨 52</span>
              </div>
            </div>
            <hr className={styles.compareHr} />
            <div className={styles.compareBlock}>
              <p className={styles.compareBrand}>Musinsa M</p>
              <div className={styles.compareMeasures}>
                <span>총장 72</span>
                <span>어깨 56</span>
              </div>
            </div>
          </ShowcaseFloatPiece>

          <ShowcaseFloatPiece
            className={`${styles.scatterCard} ${styles.scatterInput}`}
            delayedMs={140}
            idleKind="card"
            scatter={{ x: 24, y: -5 }}
          >
            <span className={styles.sectionEyebrow}>INPUT EXPERIENCE</span>
            <p className={styles.sectionSubtitle}>입력 화면 그대로, 분석 기준을 빠르게 준비</p>
            <ul className={styles.inputRows}>
              {inputFields.map((row) => (
                <li key={row.label} className={styles.inputRow}>
                  <span className={styles.inputRowLabel}>{row.label}</span>
                  <span className={styles.inputRowValue}>{row.value}</span>
                </li>
              ))}
            </ul>
          </ShowcaseFloatPiece>

          <div className={styles.resultWrap}>
            <div className={styles.resultPanelAnchor}>
              <ShowcaseFloatPiece
                className={`${styles.scatterCard} ${styles.resultPanel}`}
                delayedMs={380}
                idleKind="result"
                scatter={{ x: -28, y: 4 }}
              >
                <span className={styles.sectionEyebrowMuted}>FIT RESULT SHOWCASE</span>
                <div className={styles.resultHeader}>
                  <div>
                    <h3 className={styles.resultTitle}>
                      추천 사이즈 <span className={styles.sizeAccent}>M</span>
                    </h3>
                    <p className={styles.resultSub}>예상 핏: 세미 오버핏</p>
                  </div>
                  <span className={styles.badge}>Fit Measurement</span>
                </div>

                <p className={styles.compareTitle}>실측 비교</p>

                {barLines.map((row) => (
                  <div key={row.metric} className={styles.barBlock}>
                    <div className={styles.barMeta}>
                      <span>{row.metric}</span>
                      <span>{row.diff}</span>
                    </div>
                    <div className={styles.barTrack}>
                      <div className={styles.barFill} style={{ width: row.width }} />
                    </div>
                  </div>
                ))}
              </ShowcaseFloatPiece>
            </div>
          </div>

          <ShowcaseFloatPiece
            className={`${styles.scatterCard} ${styles.scatterFlow}`}
            delayedMs={500}
            idleKind="timeline"
            scatter={{ x: 22, y: -16 }}
          >
            <span className={styles.sectionEyebrow}>FLOW TIMELINE</span>
            <nav className={styles.flowNav} aria-label="서비스 단계">
              <div className={styles.timelineRail} aria-hidden />
              <ul className={styles.timelineList}>
                {flowSteps.map((step, i) => (
                  <li key={step} className={styles.timelineItem}>
                    <span className={styles.timelineDot} aria-hidden />
                    <p className={styles.timelineText}>
                      <span className={styles.idx}>{String(i + 1).padStart(2, "0")}</span>
                      {step}
                    </p>
                  </li>
                ))}
              </ul>
            </nav>
          </ShowcaseFloatPiece>

          <div className={styles.ctaBlock}>
            <ShowcaseFloatPiece delayedMs={480} idleKind="none" scatter={{ x: 0, y: -14 }}>
              <LandingStartSection stylePreset="showcase" />
            </ShowcaseFloatPiece>
          </div>
        </div>
      </section>

      <footer className={styles.footerNote}>
        <span>추천은 입력한 실측과 상품 사이즈표를 기준으로 한 참고 결과입니다.</span>
        <span>
          <Link href="/privacy">개인정보</Link> · <Link href="/terms">이용약관</Link>
        </span>
      </footer>
    </div>
  );
}
