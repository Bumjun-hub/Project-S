// 이 파일은 상품 추천 분석 실행 화면과 결과 저장 흐름을 담당합니다.
"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { GlassStateBlock } from "@/components/common/GlassStateBlock";
import { StepPageShell } from "@/components/layout/StepPageShell";
import { useAnalysisHistoryStore } from "@/features/history/store";
import { useFitReferenceStore } from "@/features/my-fit/store";
import { useUserProfileStore } from "@/features/profile/store";
import { stableRecommendationRecordId } from "@/features/recommend/utils/stable-record-id";
import { getMockProduct } from "@/mocks/products.mock";
import { buildMockRecommendation, delayMs } from "@/mocks/recommendation.mock";

export default function RecommendRunnerScreen({ productId }: { productId: string }) {
  const router = useRouter();
  const profile = useUserProfileStore((s) => s.profile);
  const myFit = useFitReferenceStore((s) => s.myFit);
  const commitRecommendation = useAnalysisHistoryStore((s) => s.commitRecommendation);

  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function run() {
      const product = getMockProduct(productId);
      if (!product) {
        setError("상품을 찾을 수 없습니다.");
        return;
      }
      if (profile.heightCm == null || profile.weightKg == null) {
        setError("프로필(키·몸무게)을 먼저 입력해 주세요.");
        return;
      }
      const hasAnyMyFit = (Object.keys(myFit.entries) as Array<keyof typeof myFit.entries>).some((k) => {
        const entry = myFit.entries[k];
        return (
          entry.garmentLabel.trim() !== "" &&
          entry.measurements.some((m) => m.sizeCm != null && m.feeling != null)
        );
      });
      if (!hasAnyMyFit) {
        setError("기준 옷 실측(카테고리/사이즈/착용감)을 먼저 입력해 주세요.");
        return;
      }
      await delayMs(900);
      if (cancelled) return;
      const base = buildMockRecommendation({ product, profile, myFit });
      const record = {
        ...base,
        id: stableRecommendationRecordId(productId, profile, myFit),
        createdAt: new Date().toISOString(),
      };
      commitRecommendation(record);
      router.replace("/result");
    }

    void run();

    return () => {
      cancelled = true;
    };
  }, [productId, profile, myFit, commitRecommendation, router]);

  if (error) {
    return (
      <StepPageShell step={6} label="사이즈 분석" title="분석 불가" maxWidth={560} panelClassName="result-panel-shell">
        <GlassStateBlock className="result-measure-card" title="입력 조건을 확인해 주세요." description={error}>
          <p style={{ margin: 0 }}>
            <Link href="/profile">프로필</Link>
            {" · "}
            <Link href="/my-fit">기준 옷</Link>
            {" · "}
            <Link href="/products">상품</Link>
          </p>
        </GlassStateBlock>
      </StepPageShell>
    );
  }

  return (
    <StepPageShell
      step={6}
      label="사이즈 분석"
      title="mock AI 분석 중…"
      description="프로필·기준 옷·상품 사이즈표를 합쳐 권장 라벨을 만듭니다."
      maxWidth={560}
      panelClassName="result-panel-shell"
    >
      <GlassStateBlock
        className="result-measure-card"
        title="분석 파이프라인 실행 중"
        description="입력값 정규화 → 브랜드 차트 매칭 → 권장 라벨 계산"
      />
    </StepPageShell>
  );
}
