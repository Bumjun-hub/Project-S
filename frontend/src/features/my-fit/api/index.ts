import { ApiError, apiRequest } from "@/lib/apiClient";
import { isDemoMode } from "@/lib/demo-mode";

import type { ApiResponse } from "@/features/profile/types";
import type {
  MyFitCreateRequest,
  MyFitResponse,
  MyFitUpdateRequest,
} from "@/features/my-fit/types";

function toDemoMyFitResponse(request: MyFitCreateRequest | MyFitUpdateRequest): MyFitResponse {
  return {
    id: 1,
    entries: (request.entries ?? []).map((entry, entryIndex) => ({
      id: entryIndex + 1,
      category: entry.category,
      garmentLabel: entry.garmentLabel,
      measurements: entry.measurements.map((measurement, measurementIndex) => ({
        id: entryIndex * 10 + measurementIndex + 1,
        ...measurement,
      })),
    })),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
}

export async function createMyFit(
  request: MyFitCreateRequest,
): Promise<MyFitResponse> {
  if (isDemoMode) return toDemoMyFitResponse(request);

  const response = await apiRequest<ApiResponse<MyFitResponse>>(
    "/api/v1/my-fits",
    {
      method: "POST",
      body: JSON.stringify(request),
    },
  );

  return response.data;
}

export async function getMyFit(): Promise<MyFitResponse> {
  if (isDemoMode) {
    throw new ApiError(404, "MY_FIT_NOT_FOUND", "데모 기준 옷 정보를 입력해 주세요.");
  }

  const response = await apiRequest<ApiResponse<MyFitResponse>>(
    "/api/v1/my-fits/me",
  );

  return response.data;
}

export async function updateMyFit(
  request: MyFitUpdateRequest,
): Promise<MyFitResponse> {
  if (isDemoMode) return toDemoMyFitResponse(request);

  const response = await apiRequest<ApiResponse<MyFitResponse>>(
    "/api/v1/my-fits/me",
    {
      method: "PATCH",
      body: JSON.stringify(request),
    },
  );

  return response.data;
}
