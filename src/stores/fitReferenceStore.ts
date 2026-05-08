// 이 파일은 사용자의 기준 핏 정보를 저장하는 전역 클라이언트 저장소를 정의합니다.
"use client";

import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import type { FitCategoryEntry, MyFitState } from "@/features/my-fit/types";

export type { MyFitState } from "@/features/my-fit/types";

const emptyEntry = (): FitCategoryEntry => ({
  garmentLabel: "",
  measurements: [],
});

const defaultMyFit: MyFitState = {
  selectedCategory: "top",
  entries: {
    top: emptyEntry(),
    bottom: emptyEntry(),
    etc: emptyEntry(),
  },
};

type FitReferenceStore = {
  myFit: MyFitState;
  setMyFit: (m: Partial<MyFitState>) => void;
};

export const useFitReferenceStore = create<FitReferenceStore>()(
  persist(
    (set) => ({
      myFit: defaultMyFit,
      setMyFit: (m) => set((s) => ({ myFit: { ...s.myFit, ...m } })),
    }),
    {
      name: "project-s-fit-reference",
      version: 2,
      migrate: (persistedState: unknown) => {
        const state = persistedState as { myFit?: unknown } | undefined;
        const raw = (state?.myFit ?? {}) as Record<string, unknown>;

        if (raw && typeof raw === "object" && "entries" in raw) {
          const next = raw as Partial<MyFitState>;
          return {
            myFit: {
              selectedCategory: next.selectedCategory ?? "top",
              entries: {
                top: next.entries?.top ?? emptyEntry(),
                bottom: next.entries?.bottom ?? emptyEntry(),
                etc: next.entries?.etc ?? emptyEntry(),
              },
            },
          };
        }

        return { myFit: defaultMyFit };
      },
      storage: createJSONStorage(() => localStorage),
      partialize: (s) => ({ myFit: s.myFit }),
    },
  ),
);
