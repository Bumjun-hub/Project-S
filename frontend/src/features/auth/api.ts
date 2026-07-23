import type { ApiResponse, LoginRequest, LoginResponseData, SignupRequest, SignupResponseData } from "./types";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:8080";

export class SignupApiError extends Error {
  constructor(
    message: string,
    public readonly kind: "api" | "network",
  ) {
    super(message);
    this.name = "SignupApiError";
  }
}

export class LoginApiError extends Error {
  constructor(
    message: string,
    public readonly kind: "api" | "network",
  ) {
    super(message);
    this.name = "LoginApiError";
  }
}

export async function signup(request: SignupRequest): Promise<SignupResponseData & { message: string }> {
  let response: Response;

  try {
    response = await fetch(`${API_BASE_URL}/api/v1/members`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(request),
    });
  } catch {
    throw new SignupApiError("네트워크 오류가 발생했습니다. 서버 연결 상태를 확인해 주세요.", "network");
  }

  let payload: ApiResponse<SignupResponseData>;
  try {
    payload = (await response.json()) as ApiResponse<SignupResponseData>;
  } catch {
    throw new SignupApiError("서버 응답을 처리할 수 없습니다. 잠시 후 다시 시도해 주세요.", "network");
  }

  if (!response.ok || !payload.success) {
    throw new SignupApiError(payload.message || "회원가입에 실패했습니다.", "api");
  }

  return { ...payload.data, message: payload.message };
}

export async function login(request: LoginRequest): Promise<LoginResponseData & { message: string }> {
  let response: Response;

  try {
    response = await fetch(`${API_BASE_URL}/api/v1/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(request),
    });
  } catch {
    throw new LoginApiError("네트워크 오류가 발생했습니다. 서버 연결 상태를 확인해 주세요.", "network");
  }

  let payload: ApiResponse<LoginResponseData>;
  try {
    payload = (await response.json()) as ApiResponse<LoginResponseData>;
  } catch {
    throw new LoginApiError("서버 응답을 처리할 수 없습니다. 잠시 후 다시 시도해 주세요.", "network");
  }

  if (!response.ok || !payload.success) {
    throw new LoginApiError(payload.message || "로그인에 실패했습니다.", "api");
  }

  return { ...payload.data, message: payload.message };
}
