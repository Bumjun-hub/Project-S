"use client";

import Link from "next/link";
import { motion } from "framer-motion";

const container = {
  initial: { opacity: 0, y: 14 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, amount: 0.25 },
  transition: { duration: 0.5 },
} as const;

function GlassCard({
  title,
  description,
  accent,
}: {
  title: string;
  description: string;
  accent: string;
}) {
  return (
    <motion.article
      whileHover={{ y: -5, scale: 1.01 }}
      transition={{ type: "spring", stiffness: 210, damping: 20 }}
      style={{
        borderRadius: 18,
        padding: "1.05rem",
        border: "1px solid rgba(255,255,255,0.2)",
        background: "linear-gradient(160deg, rgba(24,24,24,0.94), rgba(12,12,12,0.96))",
        boxShadow: "0 8px 24px rgba(0, 0, 0, 0.42)",
      }}
    >
      <span
        style={{
          display: "inline-block",
          borderRadius: 999,
          padding: "0.2rem 0.55rem",
          background: accent,
          color: "#0c0c0c",
          fontSize: "0.74rem",
          fontWeight: 700,
          marginBottom: "0.5rem",
        }}
      >
        Feature
      </span>
      <h3 style={{ margin: "0 0 0.4rem", fontSize: "1.03rem", color: "#f5f5f5", lineHeight: 1.3 }}>{title}</h3>
      <p style={{ margin: 0, color: "#d3d3d3", lineHeight: 1.68, fontSize: "0.93rem" }}>{description}</p>
    </motion.article>
  );
}

export function AceternityLandingDetails() {
  return (
    <div style={{ marginTop: "1.3rem", display: "grid", gap: "1rem" }}>
      <motion.section
        {...container}
        style={{
          borderRadius: 20,
          padding: "1.2rem",
          border: "1px solid rgba(255,255,255,0.18)",
          background: "linear-gradient(160deg, #111111 0%, #1c1c1c 100%)",
          color: "#f1f1f1",
        }}
      >
        <h2 style={{ margin: "0 0 0.5rem", fontSize: "1.2rem", lineHeight: 1.3 }}>왜 Project S인가요?</h2>
        <p style={{ margin: 0, lineHeight: 1.75, color: "#d0d0d0", maxWidth: "66ch" }}>
          프로필과 실측을 같이 써서 추상적인 사이즈 추천이 아니라, 사용자 옷 기준으로 어디가 작거나
          크게 느껴질지까지 설명하는 흐름을 제공합니다.
        </p>
      </motion.section>

      <motion.section
        {...container}
        style={{ display: "grid", gap: 10, gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))" }}
      >
        <GlassCard
          title="실측 + 착용감 저장"
          description="상의/하의 카테고리별로 세부 치수와 작았음/컸음을 함께 저장합니다."
          accent="linear-gradient(90deg,#7596bf,#7f78ad)"
        />
        <GlassCard
          title="부위별 핏 비교"
          description="추천 결과에서 가슴단면/허리단면 등 부위 단위로 큰지 작은지 비교합니다."
          accent="linear-gradient(90deg,#7773aa,#5f98bd)"
        />
        <GlassCard
          title="로컬 히스토리"
          description="최근 분석 기록을 즉시 복기하고 같은 상품을 다시 분석할 수 있습니다."
          accent="linear-gradient(90deg,#5eaa9d,#678cb8)"
        />
      </motion.section>

      <motion.section
        {...container}
        style={{
          borderRadius: 20,
          padding: "1.2rem",
          border: "1px solid rgba(255,255,255,0.18)",
          background: "linear-gradient(160deg, rgba(18,18,18,0.95), rgba(28,28,28,0.92))",
          color: "#f1f1f1",
        }}
      >
        <h2 style={{ margin: "0 0 0.5rem", fontSize: "1.2rem", lineHeight: 1.3 }}>진행 순서</h2>
        <div style={{ display: "grid", gap: 8, gridTemplateColumns: "repeat(auto-fit, minmax(120px, 1fr))" }}>
          {["소개", "프로필", "기준 옷", "상품 분석", "결과/기록"].map((step, idx) => (
            <div
              key={step}
              style={{
                borderRadius: 12,
                border: "1px solid rgba(255,255,255,0.2)",
                padding: "0.72rem 0.65rem",
                textAlign: "center",
                background: "rgba(255,255,255,0.05)",
              }}
            >
              <p style={{ margin: 0, fontSize: "0.74rem", color: "#bbbbbb", lineHeight: 1.4 }}>STEP {idx + 1}</p>
              <p style={{ margin: "0.25rem 0 0", fontSize: "0.92rem", color: "#f2f2f2", lineHeight: 1.4 }}>{step}</p>
            </div>
          ))}
        </div>
      </motion.section>

      <motion.section
        {...container}
        style={{
          borderRadius: 20,
          padding: "1.2rem",
          border: "1px solid rgba(255,255,255,0.18)",
          background:
            "radial-gradient(circle at 20% 10%, rgba(255,255,255,0.1), transparent 48%), linear-gradient(150deg, #101010, #181818 60%, #232323)",
          color: "#f1f1f1",
        }}
      >
        <h2 style={{ margin: "0 0 0.4rem", fontSize: "1.2rem", lineHeight: 1.3 }}>정책 안내</h2>
        <p style={{ marginTop: 0, marginBottom: "0.75rem", color: "#d0d0d0", lineHeight: 1.72, maxWidth: "66ch" }}>
          현재 프로토타입에서는 입력 데이터가 브라우저 로컬스토리지에 저장되며 외부 서버와 동기화되지 않습니다.
        </p>
        <p style={{ margin: 0, fontSize: "0.92rem", color: "#f2f2f2" }}>
          <Link href="/privacy">개인정보</Link>
          {" · "}
          <Link href="/terms">이용약관</Link>
        </p>
      </motion.section>
    </div>
  );
}
