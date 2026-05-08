"use client";

import { motion } from "framer-motion";
import { Ruler, Shirt, Tag, type LucideIcon } from "lucide-react";
import { FlowStepCaption } from "@/components/common/FlowStepCaption";

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

function segmentStyle(tone: "base" | "keyA" | "keyB" | "keyC") {
  if (tone === "keyA") return { fontWeight: 900, fontSize: "1.2em", color: "#4da6ff" } as const; // blue
  if (tone === "keyB") return { fontWeight: 900, fontSize: "1.2em", color: "#ffffff" } as const; // white
  if (tone === "keyC") return { fontWeight: 900, fontSize: "1.2em", color: "#c29bff" } as const; // violet
  return { fontWeight: 650, color: "#ffffff" } as const;
}

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
    <section
      style={{
        width: "100%",
        padding: "clamp(1.6rem, 4vw, 2.4rem) clamp(1.35rem, 4.5vw, 3rem) clamp(3.6rem, 8vw, 5.1rem)",
        color: "#f5f5f5",
      }}
    >
      <div
        style={{
          maxWidth: "min(1180px, 100%)",
          margin: "0 auto",
        }}
      >
        <FlowStepCaption step={1} label="프로젝트 소개" align="center" />

        <div style={{ display: "grid", gap: "clamp(1.4rem, 3.2vw, 2.2rem)" }}>
          <div style={{ minWidth: 0, display: "grid", gap: "0.75rem" }}>
            <motion.p
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
              style={{
                margin: 0,
                color: "#c8c8c8",
                letterSpacing: "0.02em",
                fontSize: "0.86rem",
                fontWeight: 500,
              }}
            >
              AI Fit Recommender · Project S
            </motion.p>
            <motion.h1
              variants={headlineContainer}
              initial="hidden"
              animate="show"
              style={{
                margin: 0,
                lineHeight: 1.2,
                fontSize: "clamp(1.75rem, 3.3vw, 2.7rem)",
                fontWeight: 650,
                maxWidth: "21ch",
                letterSpacing: "-0.02em",
              }}
            >
              {headlineSegments.map((seg, idx) => {
                if ("br" in seg) return <br key={`br-${idx}`} />;
                return (
                  <motion.span
                    key={`${seg.text}-${idx}`}
                    variants={headlineWord}
                    style={{
                      display: "inline-block",
                      paddingInline: "0.06em",
                      ...segmentStyle(seg.tone),
                    }}
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
              style={{
                margin: "0.35rem 0 0",
                color: "#dcdcdc",
                lineHeight: 1.75,
                fontSize: "0.98rem",
                maxWidth: "58ch",
                whiteSpace: "pre-line",
              }}
            >
              키와 몸무게만으로 판단하지 않고, <br></br> 실제로 잘 맞는 옷의 실측과 상품 사이즈표를 함께 비교합니다.
            </motion.p>
          </div>

          <motion.div
            initial="hidden"
            animate="show"
            variants={{ hidden: {}, show: { transition: { staggerChildren: 0.18, delayChildren: 0.7 } } }}
            style={{
              width: "100%",
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(120px, 1fr))",
              gap: "1.5rem",
            }}
          >
            {coreTypoCards.map((item) => (
              <motion.article
                key={item.keyA}
                variants={{ hidden: { opacity: 0, x: -18, y: 8 }, show: { opacity: 1, x: 0, y: 0 } }}
                transition={{ duration: 0.45 }}
                style={{
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                }}
              >
                <div
                  style={{
                    width: 320,
                    height: 250,
                    borderRadius: 14,
                    padding: "1.05rem 0.95rem 1rem",
                    display: "grid",
                    gridTemplateRows: "auto auto 1fr",
                    alignContent: "start",
                    textAlign: "center",
                    border: "1px solid rgba(199, 212, 238, 0.34)",
                    background:
                      "linear-gradient(165deg, rgba(14,18,30,0.32) 0%, rgba(10,12,22,0.80) 55%, rgba(8,10,18,0.78) 100%)",
                    boxShadow: "0 10px 28px rgba(0,0,0,0.36)",
                    color: "#f2f5ff",
                    lineHeight: 1.12,
                    fontSize: "clamp(1.25rem, 2.2vw, 1.65rem)",
                    letterSpacing: "-0.01em",
                  }}
                >
                  <div
                    style={{
                      width: 73,
                      height: 70,
                      marginInline: "auto",
                      borderRadius: "50%",
                      display: "grid",
                      placeItems: "center",
                      fontSize: "1.9rem",
                      lineHeight: 1,
                      background: "radial-gradient(circle, rgba(122,151,210,0.3), rgba(122,151,210,0.11) 65%, rgba(10,12,18,0.15) 100%)",
                      border: "1px solid rgba(182,199,235,0.34)",
                    }}
                  >
                    <item.icon
                      size={36}
                      strokeWidth={2}
                      style={{ color: "#bcd2ff", filter: "drop-shadow(0 0 6px rgba(160, 190, 255, 0.25))" }}
                    />
                  </div>

                  <div
                    style={{
                      height: 1,
                      width: "66%",
                      margin: "1.12rem auto 1.02rem",
                      background: "linear-gradient(90deg, transparent, rgba(218,228,246,0.48), transparent)",
                    }}
                  />

                  <div style={{ display: "grid", gap: "0.52rem", alignContent: "center" }}>
                    <p
                      style={{
                        margin: 0,
                        color: "#dfe8ff",
                        fontSize: "1.58rem",
                        fontWeight: 520,
                        lineHeight: 1.08,
                        whiteSpace: "nowrap",
                        letterSpacing: "-0.02em",
                      }}
                    >
                      {item.keyA} {item.mid}
                    </p>
                    <p style={{ margin: 0, fontSize: "2.08rem", fontWeight: 860, letterSpacing: "-0.02em", lineHeight: 1.03 }}>
                      <span style={{ color: item.accentA }}>{item.keyB}</span> <span style={{ color: item.accentB }}>{item.post}</span>
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
