// 이 파일은 추천 분석 기록을 저장하고 조회하는 클라이언트 상태 저장소를 정의합니다.
"use client";

import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import type { RecommendationRecord } from "@/features/history/types";

export type { RecommendationRecord } from "@/features/history/types";

type AnalysisHistoryStore = {
  lastResult: RecommendationRecord | null;
  history: RecommendationRecord[];
  setLastResult: (r: RecommendationRecord | null) => void;
  commitRecommendation: (r: RecommendationRecord) => void;
  clearHistory: () => void;
};

export const useAnalysisHistoryStore = create<AnalysisHistoryStore>()(
  persist(
    (set) => ({
      lastResult: null,
      history: [],

      setLastResult: (r) => set({ lastResult: r }),
      commitRecommendation: (r) =>
        set((s) => ({
          lastResult: r,
          history: [r, ...s.history.filter((h) => h.id !== r.id)].slice(0, 40),
        })),
      clearHistory: () => set({ history: [] }),
    }),
    {
      name: "project-s-analysis-history",
      storage: createJSONStorage(() => localStorage),
      partialize: (s) => ({
        lastResult: s.lastResult,
        history: s.history,
      }),
    },
  ),
);
