// 이 파일은 사용자 프로필 입력값과 관련 타입을 정의합니다.
export type UserProfileState = {
  heightCm: number | null;
  weightKg: number | null;
  gender: "" | "male" | "female" | "other";
  /** 체형 특징 태그(프로필 화면에서 다중 선택). */
  bodyShapeTags: string[];
};

export type BodyProfileGender =
  | "MALE"
  | "FEMALE";

export type BodyFeature =
  | "DEVELOPED_UPPER_BODY"
  | "DEVELOPED_LOWER_BODY"
  | "BROAD_SHOULDERS"
  | "NEEDS_THIGH_ROOM"
  | "CONCERNED_ABOUT_ABDOMEN"
  | "LONG_ARMS"
  | "LONG_LEGS"
  | "PREFERS_RELAXED_FIT";

export interface BodyProfileCreateRequest {
  height: number;
  weight: number;
  gender: BodyProfileGender;
  bodyFeatures: BodyFeature[];
}

export interface BodyProfileUpdateRequest {
  height?: number;
  weight?: number;
  gender?: BodyProfileGender;
  bodyFeatures?: BodyFeature[];
}

export interface BodyProfileResponse {
  id: number;
  height: number;
  weight: number;
  gender: BodyProfileGender;
  bodyFeatures: BodyFeature[];
  createdAt: string;
  updatedAt: string;
}

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}
