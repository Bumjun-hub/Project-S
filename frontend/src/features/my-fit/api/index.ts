import { apiRequest } from "@/lib/apiClient";

import type { ApiResponse } from "@/features/profile/types";
import type {
  MyFitCreateRequest,
  MyFitResponse,
  MyFitUpdateRequest,
} from "@/features/my-fit/types";

export async function createMyFit(
  request: MyFitCreateRequest,
): Promise<MyFitResponse> {
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
  const response = await apiRequest<ApiResponse<MyFitResponse>>(
    "/api/v1/my-fits/me",
  );

  return response.data;
}

export async function updateMyFit(
  request: MyFitUpdateRequest,
): Promise<MyFitResponse> {
  const response = await apiRequest<ApiResponse<MyFitResponse>>(
    "/api/v1/my-fits/me",
    {
      method: "PATCH",
      body: JSON.stringify(request),
    },
  );

  return response.data;
}
