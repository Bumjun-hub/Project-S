import { ApiError, apiRequest } from "@/lib/apiClient";
import { isDemoMode } from "@/lib/demo-mode";

import type {
  ApiResponse,
  BodyProfileCreateRequest,
  BodyProfileResponse,
  BodyProfileUpdateRequest,
} from "@/features/profile/types";

export async function createBodyProfile(
  request: BodyProfileCreateRequest,
): Promise<BodyProfileResponse> {
  if (isDemoMode) {
    return {
      id: 1,
      ...request,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
  }

  const response = await apiRequest<ApiResponse<BodyProfileResponse>>(
    "/api/v1/body-profiles",
    {
      method: "POST",
      body: JSON.stringify(request),
    },
  );

  return response.data;
}

export async function getMyBodyProfile(): Promise<BodyProfileResponse> {
  if (isDemoMode) {
    throw new ApiError(404, "BODY_PROFILE_NOT_FOUND", "데모 프로필을 입력해 주세요.");
  }

  const response = await apiRequest<ApiResponse<BodyProfileResponse>>(
    "/api/v1/body-profiles/me",
  );

  return response.data;
}

export async function updateBodyProfile(
  request: BodyProfileUpdateRequest,
): Promise<BodyProfileResponse> {
  if (isDemoMode) {
    return {
      id: 1,
      height: request.height ?? 172,
      weight: request.weight ?? 63,
      gender: request.gender ?? "MALE",
      bodyFeatures: request.bodyFeatures ?? [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
  }

  const response = await apiRequest<ApiResponse<BodyProfileResponse>>(
    "/api/v1/body-profiles/me",
    {
      method: "PATCH",
      body: JSON.stringify(request),
    },
  );

  return response.data;
}
