import type { Query, QueryClient } from "@tanstack/react-query";

export function resetSessionCache(queryClient: QueryClient) {
  // Public product requests can already be in flight when session hydration
  // completes. Cancelling/clearing them leaves mounted observers loading.
  const privateQueries = { predicate: (query: Query) => query.queryKey[0] !== "products" };
  void queryClient.cancelQueries(privateQueries);
  queryClient.removeQueries(privateQueries);
}
