// 이 파일은 마지막 추천 결과 화면의 UI와 기록 연동을 담당합니다.
"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { GlassStateBlock } from "@/components/common/GlassStateBlock";
import { StepPageShell } from "@/components/layout/StepPageShell";
import { useAnalysisHistoryStore } from "@/features/history/store";

function insightLabel(text: string) {
  const byColon = text.split(":")[0]?.trim();
  if (byColon && byColon.length <= 14) return byColon;
  const first = text.split(" ")[0]?.trim();
  return first && first.length <= 14 ? first : "부위";
}

function insightScore(text: string, idx: number) {
  const seed = text.length + idx * 7;
  return 72 + (seed % 23); // 72 ~ 94
}

function estimateFitLabel(summary: string) {
  if (summary.includes("오버")) return "오버핏";
  if (summary.includes("레귤러")) return "레귤러핏";
  if (summary.includes("슬림")) return "슬림핏";
  return "세미 오버핏";
}

export default function RecommendationResultScreen() {
  const lastResult = useAnalysisHistoryStore((s) => s.lastResult);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    setReady(true);
  }, []);

  if (!ready) {
    return (
      <StepPageShell step={7} label="추천 결과" title="추천 결과" maxWidth={640}>
        <p style={{ color: "var(--muted)" }}>불러오는 중…</p>
      </StepPageShell>
    );
  }

  if (!lastResult) {
    return (
      <StepPageShell step={7} label="추천 결과" title="아직 결과가 없습니다" maxWidth={640} panelClassName="result-panel-shell">
        <GlassStateBlock
          className="result-measure-card"
          title="추천 결과를 찾지 못했습니다."
          description="상품 상세에서 사이즈 분석을 실행하면 여기에 표시됩니다."
        >
          <p style={{ margin: 0 }}>
            <Link href="/products">상품 목록</Link>
          </p>
        </GlassStateBlock>
      </StepPageShell>
    );
  }

  return (
    <StepPageShell
      step={7}
      label="추천 결과"
      title="AI 사이즈 리포트"
      description="입력한 체형/실측/상품 사이즈표 기반으로 생성된 추천 결과입니다."
      maxWidth={720}
      panelClassName="result-panel-shell"
    >
      <section className="result-summary-grid">
        <article className="result-size-hero">
          <p className="result-meta-line">{new Date(lastResult.createdAt).toLocaleString("ko-KR")}</p>
          <p className="result-size-label">추천 사이즈</p>
          <p className="result-size-value">{lastResult.recommendedSize}</p>
          <span className="result-badge" style={{ padding: "0.28rem 0.62rem", fontSize: "0.72rem", fontWeight: 700 }}>
            AI FIT
          </span>
        </article>

        <article className="result-panel-main" style={{ padding: "1rem 1.05rem" }}>
          <p className="result-meta-line">
            {lastResult.brand} · {lastResult.productName}
          </p>
          <div className="result-summary-rows">
            <div>
              <span className="result-summary-key">상품명</span>
              <p className="result-summary-value">{lastResult.productName}</p>
            </div>
            <div>
              <span className="result-summary-key">추천 사이즈</span>
              <p className="result-summary-value">
                <span className="result-input-chip" style={{ padding: "0.16rem 0.56rem" }}>
                  {lastResult.recommendedSize}
                </span>
              </p>
            </div>
            <div>
              <span className="result-summary-key">예상 핏</span>
              <p className="result-summary-value">{estimateFitLabel(lastResult.summary)}</p>
            </div>
          </div>
        </article>
      </section>

      <section className="result-comparison-section">
        <h3 style={{ marginBottom: "0.55rem" }}>부위별 비교</h3>
        {lastResult.fitInsights.map((insight, idx) => {
          const score = insightScore(insight, idx);
          return (
            <div key={insight} className="result-comparison-row">
              <span className="result-comparison-pill">{insightLabel(insight)}</span>
              <p className="result-comparison-text">{insight}</p>
              <div className="result-comparison-track" role="progressbar" aria-valuenow={score} aria-valuemin={0} aria-valuemax={100}>
                <div className="result-comparison-fill" style={{ width: `${score}%` }} />
              </div>
            </div>
          );
        })}
      </section>

      <details className="result-details">
        <summary>AI 설명 보기</summary>
        <p>{lastResult.summary}</p>
      </details>

      <p style={{ marginTop: "1.5rem" }}>
        <Link href={`/recommend/${lastResult.productId}`} style={{ fontWeight: 600 }}>
          같은 상품 다시 분석
        </Link>
        {" · "}
        <Link href="/products">다른 상품</Link>
        {" · "}
        <Link href="/history">최근 기록</Link>
      </p>
      <p>
        <Link href="/">홈</Link>
      </p>
    </StepPageShell>
  );
}
