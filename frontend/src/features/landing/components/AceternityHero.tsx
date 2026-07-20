"use client";

import { motion } from "framer-motion";
import { Ruler, Shirt, Tag, type LucideIcon } from "lucide-react";
import { FlowStepCaption } from "@/components/common/FlowStepCaption";
import styles from "@/features/landing/components/AceternityHero.module.css";

const headlineSegments = [
  { text: "내 옷 실측", tone: "keyA" as const }, // blue
  { text: "을 기준으로", tone: "base" as const },
  { br: true as const },
  { text: "사이즈 실패", tone: "keyB" as const }, // white
  { text: "를 줄이는", tone: "base" as const },
  { br: true as const },
  { text: "추천 플로우", tone: "keyC" as const }, // violet
] as const;

const headlineContainer = {
  hidden: {},
  show: { transition: { staggerChildren: 0.18, delayChildren: 0.18 } },
};

const headlineWord = {
  hidden: { opacity: 0, y: 10, filter: "blur(6px)" },
  show: { opacity: 1, y: 0, filter: "blur(0px)", transition: { duration: 0.6 } },
};

const toneClass: Record<"base" | "keyA" | "keyB" | "keyC", string> = {
  base: styles.toneBase,
  keyA: styles.toneKeyA,
  keyB: styles.toneKeyB,
  keyC: styles.toneKeyC,
};

const coreTypoCards = [
  {
    icon: Tag,
    keyA: "브랜드",
    mid: "마다 다른",
    keyB: "사이즈",
    post: "기준",
    accentA: "#7bb8ff",
    accentB: "#64a9ff",
  },
  {
    icon: Shirt,
    keyA: "내 기준 옷",
    mid: "과 다른상품",
    keyB: "실측",
    post: "비교",
    accentA: "#9ec8ff",
    accentB: "#7fb8ff",
  },
  {
    icon: Ruler,
    keyA: "권장 사이즈",
    mid: "와 부위별",
    keyB: "핏",
    post: "예측",
    accentA: "#d7b6ff",
    accentB: "#c79fff",
  },
] as const satisfies ReadonlyArray<{
  icon: LucideIcon;
  keyA: string;
  mid: string;
  keyB: string;
  post: string;
  accentA: string;
  accentB: string;
}>;

export function AceternityHero() {
  return (
    <section className={styles.section}>
      <div className={styles.inner}>
        <FlowStepCaption step={1} label="프로젝트 소개" align="center" />

        <div className={styles.stack}>
          <div className={styles.intro}>
            <motion.p
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
              className={styles.eyebrow}
            >
              AI Fit Recommender · Project S
            </motion.p>
            <motion.h1
              variants={headlineContainer}
              initial="hidden"
              animate="show"
              className={styles.headline}
            >
              {headlineSegments.map((seg, idx) => {
                if ("br" in seg) return <br key={`br-${idx}`} />;
                return (
                  <motion.span
                    key={`${seg.text}-${idx}`}
                    variants={headlineWord}
                    className={`${styles.headlineSegment} ${toneClass[seg.tone]}`}
                  >
                    {seg.text}
                  </motion.span>
                );
              })}
            </motion.h1>
            <motion.p
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.55, delay: 0.12 }}
              className={styles.lede}
            >
              키와 몸무게만으로 판단하지 않고, <br /> 실제로 잘 맞는 옷의 실측과 상품 사이즈표를 함께 비교합니다.
            </motion.p>
          </div>

          <motion.div
            initial="hidden"
            animate="show"
            variants={{ hidden: {}, show: { transition: { staggerChildren: 0.18, delayChildren: 0.7 } } }}
            className={styles.cardGrid}
          >
            {coreTypoCards.map((item) => (
              <motion.article
                key={item.keyA}
                variants={{ hidden: { opacity: 0, x: -18, y: 8 }, show: { opacity: 1, x: 0, y: 0 } }}
                transition={{ duration: 0.45 }}
                className={styles.cardArticle}
              >
                <div className={styles.typoCard}>
                  <div className={styles.iconRing}>
                    <item.icon strokeWidth={2} className={styles.iconSvg} aria-hidden />
                  </div>

                  <div className={styles.divider} aria-hidden />

                  <div className={styles.cardCopy}>
                    <p className={styles.cardLine1}>
                      {item.keyA} {item.mid}
                    </p>
                    <p className={styles.cardLine2}>
                      <span style={{ color: item.accentA }}>{item.keyB}</span>{" "}
                      <span style={{ color: item.accentB }}>{item.post}</span>
                    </p>
                  </div>
                </div>
              </motion.article>
            ))}
          </motion.div>
        </div>
      </div>
    </section>
  );
}
