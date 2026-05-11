// 이 파일은 사용자 프로필 정보를 저장하는 전역 클라이언트 저장소를 정의합니다.
"use client";

import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import type { UserProfileState } from "@/features/profile/types";

export type { UserProfileState } from "@/features/profile/types";

const defaultProfile: UserProfileState = {
  heightCm: null,
  weightKg: null,
  gender: "",
  bodyShapeTags: [],
};

type UserProfileStore = {
  profile: UserProfileState;
  setProfile: (p: Partial<UserProfileState>) => void;
};

export const useUserProfileStore = create<UserProfileStore>()(
  persist(
    (set) => ({
      profile: defaultProfile,
      setProfile: (p) =>
        set((s) => ({ profile: { ...s.profile, ...p } })),
    }),
    {
      name: "project-s-user-profile",
      storage: createJSONStorage(() => localStorage),
      partialize: (s) => ({ profile: s.profile }),
      merge: (persisted, current) => {
        const p = persisted as Partial<UserProfileStore> | undefined;
        if (!p?.profile) return current as UserProfileStore;
        return {
          ...(current as UserProfileStore),
          profile: {
            ...(current as UserProfileStore).profile,
            ...p.profile,
            bodyShapeTags: p.profile.bodyShapeTags ?? [],
          },
        };
      },
    },
  ),
);
