// 이 파일은 신체 프로필 조회/생성/수정용 TanStack Query 훅을 정의합니다.
"use client";

import {
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import {
  createBodyProfile,
  getMyBodyProfile,
  updateBodyProfile,
} from "@/features/profile/api";
import { ApiError } from "@/lib/apiClient";

export const bodyProfileQueryKeys = {
  all: ["body-profile"] as const,
  me: () => [...bodyProfileQueryKeys.all, "me"] as const,
};

export function useBodyProfileQuery() {
  return useQuery({
    queryKey: bodyProfileQueryKeys.me(),
    queryFn: getMyBodyProfile,
    staleTime: 5 * 60 * 1000,
    retry: (failureCount, error) => {
      if (
        error instanceof ApiError &&
        error.status === 404 &&
        error.code === "BODY_PROFILE_NOT_FOUND"
      ) {
        return false;
      }

      return failureCount < 1;
    },
  });
}

export function useCreateBodyProfileMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createBodyProfile,
    onSuccess: (createdProfile) => {
      queryClient.setQueryData(
        bodyProfileQueryKeys.me(),
        createdProfile,
      );
    },
  });
}

export function useUpdateBodyProfileMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: updateBodyProfile,
    onSuccess: (updatedProfile) => {
      queryClient.setQueryData(
        bodyProfileQueryKeys.me(),
        updatedProfile,
      );
    },
  });
}
