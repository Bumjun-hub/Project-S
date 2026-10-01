// 이 파일은 브라우저에서 사용할 전역 React Provider들을 묶어 제공합니다.
"use client";

import { QueryClientProvider } from "@tanstack/react-query";
import { getQueryClient } from "@/lib/queryClient";
import { useEffect, useState } from "react";
import { AuthReadyContext, synchronizeSession } from "@/lib/auth-session";
import { waitPersistHydration } from "@/lib/wait-flow-persist-hydration";
import { useUserProfileStore } from "@/stores/userProfileStore";
import { useFitReferenceStore } from "@/stores/fitReferenceStore";
import { useFlowBootstrapStore } from "@/stores/flowBootstrapStore";
import { useAnalysisHistoryStore } from "@/features/history/store";

export function AppProviders({ children }: Readonly<{ children: React.ReactNode }>) {
  const queryClient = getQueryClient();
  const [ready, setReady] = useState(false);
  useEffect(() => {
    let cancelled = false;
    void waitPersistHydration([useUserProfileStore.persist, useFitReferenceStore.persist,
      useFlowBootstrapStore.persist, useAnalysisHistoryStore.persist]).then(() => {
      if (cancelled) return;
      synchronizeSession();
      setReady(true);
    });
    const sync = (event: StorageEvent) => {
      if (event.key?.startsWith("project-s-")) synchronizeSession();
    };
    window.addEventListener("storage", sync);
    const interval = window.setInterval(synchronizeSession, 30000);
    return () => { cancelled = true; window.removeEventListener("storage", sync); window.clearInterval(interval); };
  }, []);
  return <QueryClientProvider client={queryClient}><AuthReadyContext.Provider value={ready}>{children}</AuthReadyContext.Provider></QueryClientProvider>;
}
