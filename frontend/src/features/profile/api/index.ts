import { apiRequest } from "@/lib/apiClient";

import type {
  ApiResponse,
  BodyProfileCreateRequest,
  BodyProfileResponse,
  BodyProfileUpdateRequest,
} from "@/features/profile/types";

export async function createBodyProfile(
  request: BodyProfileCreateRequest,
): Promise<BodyProfileResponse> {
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
  const response = await apiRequest<ApiResponse<BodyProfileResponse>>(
    "/api/v1/body-profiles/me",
  );

  return response.data;
}

export async function updateBodyProfile(
  request: BodyProfileUpdateRequest,
): Promise<BodyProfileResponse> {
  const response = await apiRequest<ApiResponse<BodyProfileResponse>>(
    "/api/v1/body-profiles/me",
    {
      method: "PATCH",
      body: JSON.stringify(request),
    },
  );

  return response.data;
}
