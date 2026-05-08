// 이 파일은 TanStack Query 클라이언트를 생성하고 공유합니다.
import { QueryClient } from "@tanstack/react-query";

export function createAppQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 60 * 1000,
      },
    },
  });
}

let browserQueryClient: QueryClient | undefined;

export function getQueryClient() {
  if (typeof window === "undefined") {
    return createAppQueryClient();
  }
  if (!browserQueryClient) {
    browserQueryClient = createAppQueryClient();
  }
  return browserQueryClient;
}
