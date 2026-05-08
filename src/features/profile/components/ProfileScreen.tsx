// 이 파일은 사용자 프로필 입력 화면과 저장 동작을 정의합니다.
"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { GlassCTA } from "@/components/common/GlassCTA";
import { Input } from "@/components/common/Input";
import { Select } from "@/components/common/Select";
import { StepPageShell } from "@/components/layout/StepPageShell";
import type { UserProfileState } from "@/features/profile/types";
import { useUserProfileStore } from "@/features/profile/store";

const GENDER_OPTIONS: Array<{ value: UserProfileState["gender"]; label: string }> = [
  { value: "", label: "선택 안 함" },
  { value: "male", label: "남성" },
  { value: "female", label: "여성" },
  { value: "other", label: "기타" },
];

export default function ProfileScreen() {
  const router = useRouter();
  const profile = useUserProfileStore((s) => s.profile);
  const setProfile = useUserProfileStore((s) => s.setProfile);

  const [height, setHeight] = useState(profile.heightCm?.toString() ?? "");
  const [weight, setWeight] = useState(profile.weightKg?.toString() ?? "");
  const [gender, setGender] = useState<UserProfileState["gender"]>(profile.gender);

  function submit(e: React.FormEvent) {
    e.preventDefault();
    const h = height.trim() === "" ? null : Number(height);
    const w = weight.trim() === "" ? null : Number(weight);
    if (h == null || Number.isNaN(h) || w == null || Number.isNaN(w)) {
      alert("키와 몸무게를 숫자로 입력해 주세요.");
      return;
    }
    setProfile({ heightCm: h, weightKg: w, gender: gender || "" });
    router.push("/my-fit");
  }

  return (
    <StepPageShell
      step={2}
      label="사용자 프로필"
      title="체형 정보 입력"
      description="1분 안에 끝나는 onboarding입니다. 아래 항목만 입력하면 추천 정확도가 올라갑니다."
      maxWidth={520}
      panelClassName="profile-panel"
    >
      <form className="profile-onboarding-form" onSubmit={submit}>
        <section className="profile-step-block">
          <p className="profile-step-index">STEP 1</p>
          <label className="profile-field">
            <span className="profile-field-label">키</span>
            <Input
              name="height"
              inputMode="decimal"
              value={height}
              onChange={(e) => setHeight(e.target.value)}
              placeholder="예: 172"
              required
            />
          </label>
        </section>

        <section className="profile-step-block">
          <p className="profile-step-index">STEP 2</p>
          <label className="profile-field">
            <span className="profile-field-label">몸무게</span>
            <Input
              name="weight"
              inputMode="decimal"
              value={weight}
              onChange={(e) => setWeight(e.target.value)}
              placeholder="예: 63"
              required
            />
          </label>
        </section>

        <section className="profile-step-block">
          <p className="profile-step-index">STEP 3</p>
          <div className="profile-field">
            <span className="profile-field-label">성별</span>
            <div className="profile-gender-pills" role="radiogroup" aria-label="성별 선택">
              {GENDER_OPTIONS.map((opt) => {
                const selected = gender === opt.value;
                return (
                  <button
                    key={opt.label}
                    type="button"
                    role="radio"
                    aria-checked={selected}
                    className={`profile-gender-pill${selected ? " is-selected" : ""}`}
                    onClick={() => setGender(opt.value)}
                  >
                    {opt.label}
                  </button>
                );
              })}
            </div>
          </div>
        </section>

        <div className="profile-cta-wrap">
          <GlassCTA type="submit">저장 후 다음</GlassCTA>
        </div>
      </form>
      <p style={{ marginTop: "1.5rem" }}>
        <Link href="/">← 랜딩</Link>
      </p>
    </StepPageShell>
  );
}
