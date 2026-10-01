// 이 파일은 ‘소개 시작 → 저장된 단계 순서’에 맞지 않으면 필요한 페이지로 돌립니다.
"use client";

import { usePathname, useRouter } from "next/navigation";
import { type ReactNode, useContext, useEffect, useState } from "react";
import type { MyFitState } from "@/features/my-fit/types";
import type { UserProfileState } from "@/features/profile/types";
import { isMyFitSaved, isProfileSaved } from "@/lib/flow-completion";
import type { SequentialFlowRequirement } from "@/lib/flow-gate-needs";
import { waitPersistHydration } from "@/lib/wait-flow-persist-hydration";
import { useFitReferenceStore } from "@/stores/fitReferenceStore";
import { useFlowBootstrapStore } from "@/stores/flowBootstrapStore";
import { useUserProfileStore } from "@/stores/userProfileStore";
import { AuthReadyContext, safeReturnTo, useSessionIdentity } from "@/lib/auth-session";

export type SequentialFlowGateProps = {
  children: ReactNode;
  needs: SequentialFlowRequirement[];
};

function firstBlockingPath(
  introAcknowledged: boolean,
  profile: UserProfileState,
  myFit: MyFitState,
  needs: SequentialFlowRequirement[],
): string | null {
  const needIntro = needs.includes("intro");
  const needProfile = needs.includes("profile");
  const needMyFit = needs.includes("myFit");

  if (needIntro && !introAcknowledged) return "/";
  if (needProfile && !isProfileSaved(profile)) return "/profile";
  if (needMyFit && !isMyFitSaved(myFit)) return "/my-fit";
  return null;
}

export function SequentialFlowGate({ children, needs }: SequentialFlowGateProps) {
  const router = useRouter();
  const pathname = usePathname();
  const identity = useSessionIdentity();
  const sessionReady = useContext(AuthReadyContext);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    let cancelled = false;

    void waitPersistHydration([
      useFlowBootstrapStore.persist,
      useUserProfileStore.persist,
      useFitReferenceStore.persist,
    ]).then(() => {
      if (!cancelled) setHydrated(true);
    });

    return () => {
      cancelled = true;
    };
  }, []);

  const introAcknowledged = useFlowBootstrapStore((s) => s.introAcknowledged);
  const profile = useUserProfileStore((s) => s.profile);
  const myFit = useFitReferenceStore((s) => s.myFit);

  const mismatch = hydrated ? (!identity ? "/login" : firstBlockingPath(introAcknowledged, profile, myFit, needs)) : null;

  useEffect(() => {
    if (!hydrated || !sessionReady || !pathname) return;

    const target = !identity ? "/login" : firstBlockingPath(introAcknowledged, profile, myFit, needs);
    if (!target || target === pathname) return;

    const destination = safeReturnTo(new URLSearchParams(window.location.search).get("returnTo") || pathname);
    router.replace(`${target}?returnTo=${encodeURIComponent(destination)}`);
  }, [hydrated, sessionReady, router, pathname, identity, introAcknowledged, profile, myFit, needs]);

  const blocked = !hydrated || !sessionReady || mismatch !== null;

  if (!hydrated || blocked) {
    return (
      <main style={{ padding: "2rem", maxWidth: 560 }}>
        <p style={{ margin: 0, color: "var(--muted)" }}>설정 불러오는 중…</p>
      </main>
    );
  }

  return <div key={identity}>{children}</div>;
}
