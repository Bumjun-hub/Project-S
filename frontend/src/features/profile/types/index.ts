// 이 파일은 사용자 프로필 입력값과 관련 타입을 정의합니다.
export type UserProfileState = {
  heightCm: number | null;
  weightKg: number | null;
  gender: "" | "male" | "female" | "other";
  /** 체형 특징 태그(프로필 화면에서 다중 선택). */
  bodyShapeTags: string[];
};
