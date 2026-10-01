// 이 파일은 상품 추천 분석 실행 화면과 결과 저장 흐름을 담당합니다.
"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { GlassStateBlock } from "@/components/common/GlassStateBlock";
import { StepPageShell } from "@/components/layout/StepPageShell";
import { useAnalysisHistoryStore } from "@/features/history/store";
import { useFitReferenceStore } from "@/features/my-fit/store";
import { useUserProfileStore } from "@/features/profile/store";
import { createRecommendation } from "@/features/recommend/api";
import { mapRecommendationResponseToRecord } from "@/features/recommend/lib/recommendationMapper";
import { ApiError } from "@/lib/apiClient";

function getRecommendationErrorMessage(error: unknown): string {
  if (error instanceof ApiError) {
    if (error.status === 401) return "로그인이 필요합니다.";
    if (error.code === "MY_FIT_NOT_FOUND") return "먼저 기준 옷 정보를 등록해주세요.";
    if (error.code === "PRODUCT_NOT_FOUND") return "상품 정보를 찾을 수 없습니다.";
    if (error.code === "RECOMMENDATION_NOT_AVAILABLE") {
      return "기준 옷과 상품 사이에 비교할 수 있는 실측 정보가 부족합니다.";
    }
  }

  return "추천 결과를 불러오지 못했습니다. 잠시 후 다시 시도해주세요.";
}

export default function RecommendRunnerScreen({ productId }: { productId: string }) {
  const router = useRouter();
  const profile = useUserProfileStore((s) => s.profile);
  const myFit = useFitReferenceStore((s) => s.myFit);
  const commitRecommendation = useAnalysisHistoryStore((s) => s.commitRecommendation);

  const [error, setError] = useState<string | null>(null);
  const [retryAttempt, setRetryAttempt] = useState(0);
  const requestKey = useRef<{ productCode: string; key: string } | null>(null);
  const { mutateAsync } = useMutation({
    mutationFn: (code: string) => {
      if (requestKey.current?.productCode !== code) {
        requestKey.current = { productCode: code, key: crypto.randomUUID() };
      }
      return createRecommendation(code, requestKey.current.key);
    },
  });

  useEffect(() => {
    let cancelled = false;

    async function run() {
      setError(null);
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

      try {
        const response = await mutateAsync(productId);
        if (cancelled) return;

        const record = mapRecommendationResponseToRecord(response);
        commitRecommendation(record);
        router.replace("/result");
      } catch (caughtError) {
        if (!cancelled) setError(getRecommendationErrorMessage(caughtError));
      }
    }

    void run();

    return () => {
      cancelled = true;
    };
  }, [productId, profile, myFit, commitRecommendation, router, mutateAsync, retryAttempt]);

  if (error) {
    return (
      <StepPageShell step={6} label="사이즈 분석" title="분석 불가" maxWidth={560} panelClassName="result-panel-shell">
        <GlassStateBlock className="result-measure-card" title="입력 조건을 확인해 주세요." description={error}>
          <button type="button" onClick={() => setRetryAttempt((attempt) => attempt + 1)}>다시 시도</button>
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
      title="사이즈를 비교하고 있어요"
      description="기준 옷의 착용감과 상품 실측표를 비교해 권장 라벨을 계산합니다."
      maxWidth={560}
      panelClassName="result-panel-shell"
    >
      <GlassStateBlock
        className="result-measure-card"
        title="실측 비교 엔진 실행 중"
        description="기준 실측 보정 → 상품 사이즈별 오차 비교 → 매칭 점수 계산"
      />
    </StepPageShell>
  );
}
