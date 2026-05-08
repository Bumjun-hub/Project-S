// 이 파일은 체험 순서 고정과 리다이렉트 판별에 사용하는 완료 조건 헬퍼를 둡니다.
import type { MyFitState } from "@/features/my-fit/types";
import type { UserProfileState } from "@/features/profile/types";

/** 프로필 화면의 ‘저장’과 동일: 키·몸무게가 유효한 숫자로 들어 있는지 */
export function isProfileSaved(profile: UserProfileState): boolean {
  const h = profile.heightCm;
  const w = profile.weightKg;
  return h != null && !Number.isNaN(h) && w != null && !Number.isNaN(w);
}

/** 기준 옷 실측 화면의 ‘저장’과 동일: 이름 비어 있지 않음 + 가슴 실측 필수 */
export function isMyFitSaved(myFit: MyFitState): boolean {
  if (!myFit || typeof myFit !== "object" || !("entries" in myFit) || !myFit.entries) {
    return false;
  }
  return (Object.keys(myFit.entries) as Array<keyof MyFitState["entries"]>).some((key) => {
    const entry = myFit.entries[key];
    if (!entry || entry.garmentLabel.trim() === "") return false;
    return entry.measurements.some(
      (m) => m.sizeCm != null && !Number.isNaN(m.sizeCm) && m.feeling != null,
    );
  });
}
