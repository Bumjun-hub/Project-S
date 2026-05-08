// 이 파일은 추천 분석 기록 화면의 UI와 상호작용을 담당합니다.
"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Button } from "@/components/common/Button";
import { PageContainer } from "@/components/layout/PageContainer";
import { Card } from "@/components/common/Card";
import { useAnalysisHistoryStore } from "@/features/history/store";

export default function HistoryScreen() {
  const history = useAnalysisHistoryStore((s) => s.history);
  const clearHistory = useAnalysisHistoryStore((s) => s.clearHistory);
  const setLastResult = useAnalysisHistoryStore((s) => s.setLastResult);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    setReady(true);
  }, []);

  if (!ready) {
    return (
      <PageContainer maxWidth={720}>
        <p style={{ color: "var(--muted)" }}>불러오는 중…</p>
      </PageContainer>
    );
  }

  return (
    <PageContainer maxWidth={720}>
      <h1 style={{ marginTop: 0 }}>최근 분석 기록</h1>
      <p style={{ color: "var(--muted)" }}>
        브라우저에 저장됩니다(최대 40건). 새 기기와는 공유되지 않습니다.
      </p>
      {history.length === 0 ? (
        <p>저장된 기록이 없습니다.</p>
      ) : (
        <ul style={{ listStyle: "none", padding: 0, display: "grid", gap: "0.75rem" }}>
          {history.map((h) => (
            <li key={h.id}>
              <Card style={{ padding: "0.75rem 1rem" }}>
                <p style={{ margin: "0 0 0.25rem", fontSize: "0.8rem", color: "var(--muted)" }}>
                  {new Date(h.createdAt).toLocaleString("ko-KR")}
                </p>
                <p style={{ margin: "0 0 0.35rem", fontWeight: 600 }}>
                  {h.brand} — {h.productName}
                </p>
                <p style={{ margin: 0 }}>권장: {h.recommendedSize}</p>
                <p style={{ marginTop: "0.5rem", fontSize: "0.9rem" }}>
                  <Button
                    type="button"
                    onClick={() => setLastResult(h)}
                    style={{ marginRight: "0.75rem" }}
                  >
                    결과로 보기
                  </Button>
                  <Link href={`/products/${h.productId}`}>상품 상세</Link>
                </p>
              </Card>
            </li>
          ))}
        </ul>
      )}
      <p style={{ marginTop: "1.5rem" }}>
        <Button
          type="button"
          onClick={() => {
            if (history.length && confirm("모든 기록을 지울까요?")) clearHistory();
          }}
          disabled={history.length === 0}
        >
          기록 비우기
        </Button>
      </p>
      <p>
        <Link href="/products">상품 목록</Link>
        {" · "}
        <Link href="/">홈</Link>
      </p>
    </PageContainer>
  );
}
