export type SignupRequest = {
  email: string;
  password: string;
  nickname: string;
};

export type SignupResponseData = {
  memberId: number;
  email: string;
  nickname: string;
};

export type LoginRequest = {
  email: string;
  password: string;
};

export type LoginResponseData = {
  accessToken: string;
  tokenType: string;
  memberId: number;
  email: string;
  nickname: string;
};

export type ApiSuccess<T> = {
  success: true;
  message: string;
  data: T;
};

export type ApiFailure = {
  success: false;
  code?: string;
  message: string;
};

export type ApiResponse<T> = ApiSuccess<T> | ApiFailure;
