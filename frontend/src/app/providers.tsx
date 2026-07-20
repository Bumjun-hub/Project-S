// 이 파일은 브라우저에서 사용할 전역 React Provider들을 묶어 제공합니다.
"use client";

import { QueryClientProvider } from "@tanstack/react-query";
import { getQueryClient } from "@/lib/queryClient";

export function AppProviders({ children }: Readonly<{ children: React.ReactNode }>) {
  const queryClient = getQueryClient();
  return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
}
