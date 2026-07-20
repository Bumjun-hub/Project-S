// 이 파일은 랜딩에서 순서 시작을 신호하는 클라이언트 플래그를 저장합니다.
"use client";

import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

type FlowBootstrapState = {
  introAcknowledged: boolean;
  acknowledgeIntro: () => void;
};

export const useFlowBootstrapStore = create<FlowBootstrapState>()(
  persist(
    (set) => ({
      introAcknowledged: false,
      acknowledgeIntro: () => set({ introAcknowledged: true }),
    }),
    {
      name: "project-s-flow-bootstrap",
      storage: createJSONStorage(() => localStorage),
      partialize: (s) => ({ introAcknowledged: s.introAcknowledged }),
    },
  ),
);
