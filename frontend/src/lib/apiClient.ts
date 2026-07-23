const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:8080";

export const AUTH_STORAGE_KEYS = {
  accessToken: "project-s-access-token",
  tokenType: "project-s-token-type",
  email: "project-s-member-email",
  nickname: "project-s-member-nickname",
} as const;

interface ErrorResponse {
  success: false;
  code: string;
  message: string;
}

export class ApiError extends Error {
  public readonly status: number;
  public readonly code: string | null;
  public readonly responseMessage: string;

  constructor(
    status: number,
    code: string | null,
    message: string,
  ) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.code = code;
    this.responseMessage = message;
  }
}

export function getAccessToken(): string | null {
  if (typeof window === "undefined") return null;
  return window.localStorage.getItem(AUTH_STORAGE_KEYS.accessToken);
}

function buildApiUrl(path: string): string {
  const baseUrl = API_BASE_URL.replace(/\/+$/, "");
  const normalizedPath = path.replace(/^\/+/, "");
  return `${baseUrl}/${normalizedPath}`;
}

function isObject(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function isErrorResponse(value: unknown): value is ErrorResponse {
  return (
    isObject(value) &&
    value.success === false &&
    typeof value.code === "string" &&
    typeof value.message === "string"
  );
}

async function parseErrorResponse(response: Response): Promise<ErrorResponse | null> {
  try {
    const payload: unknown = await response.json();
    return isErrorResponse(payload) ? payload : null;
  } catch {
    return null;
  }
}

function isAbortError(error: unknown): boolean {
  return error instanceof Error && error.name === "AbortError";
}

function createHeaders(options?: RequestInit): Headers {
  const headers = new Headers(options?.headers);
  const body = options?.body;
  const hasBody = body != null;
  const isFormData =
    typeof FormData !== "undefined" &&
    body instanceof FormData;

  if (hasBody && !isFormData && !headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
  }

  const accessToken = getAccessToken();
  if (accessToken && !headers.has("Authorization")) {
    headers.set("Authorization", `Bearer ${accessToken}`);
  }

  return headers;
}

export async function apiRequest<T>(
  path: string,
  options?: RequestInit,
): Promise<T> {
  const url = buildApiUrl(path);
  const headers = createHeaders(options);

  let response: Response;
  try {
    response = await fetch(url, {
      ...options,
      headers,
    });
  } catch (error: unknown) {
    if (error instanceof ApiError || isAbortError(error)) {
      throw error;
    }
    throw new ApiError(0, null, "서버에 연결할 수 없습니다.");
  }

  if (response.status === 204) {
    return undefined as T;
  }

  if (!response.ok) {
    const errorResponse = await parseErrorResponse(response);
    const message =
      errorResponse?.message ||
      response.statusText ||
      `HTTP 오류가 발생했습니다. (${response.status})`;

    throw new ApiError(
      response.status,
      errorResponse?.code ?? null,
      message,
    );
  }

  return (await response.json()) as T;
}
