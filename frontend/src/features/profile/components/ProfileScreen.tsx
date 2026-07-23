// 이 파일은 사용자 프로필 입력 화면과 저장 동작을 정의합니다.
"use client";

import { useRouter } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";
import { FlowFooterNav } from "@/components/common/FlowFooterNav";
import { GlassCTA } from "@/components/common/GlassCTA";
import { Input } from "@/components/common/Input";
import { StepPageShell } from "@/components/layout/StepPageShell";
import {
  toBodyProfileCreateRequest,
  toLocalUserProfile,
} from "@/features/profile/lib/bodyProfileMapper";
import {
  useBodyProfileQuery,
  useCreateBodyProfileMutation,
  useUpdateBodyProfileMutation,
} from "@/features/profile/hooks/useBodyProfile";
import type { UserProfileState } from "@/features/profile/types";
import { useUserProfileStore } from "@/features/profile/store";
import { ApiError } from "@/lib/apiClient";
import tagStyles from "./ProfileBodyShapeTags.module.css";
import styles from "./ProfileScreen.module.css";

const BODY_SHAPE_TAG_OPTIONS: string[] = [
  "상체가 발달한 편",
  "하체가 발달한 편",
  "어깨가 넓은 편",
  "허벅지 여유가 필요한 편",
  "복부가 신경 쓰이는 편",
  "팔이 긴 편",
  "다리가 긴 편",
  "여유핏을 선호함",
];

const GENDER_OPTIONS: Array<{ value: UserProfileState["gender"]; label: string }> = [
  { value: "", label: "선택 안 함" },
  { value: "male", label: "남성" },
  { value: "female", label: "여성" },
  { value: "other", label: "기타" },
];

function genderLabel(value: UserProfileState["gender"]) {
  return GENDER_OPTIONS.find((o) => o.value === value)?.label ?? "선택 안 함";
}

function formatHeightPreview(raw: string): string {
  const t = raw.trim();
  if (t === "") return "";
  const n = Number(t);
  if (Number.isNaN(n)) return t;
  return `${n} cm`;
}

function formatWeightPreview(raw: string): string {
  const t = raw.trim();
  if (t === "") return "";
  const n = Number(t);
  if (Number.isNaN(n)) return t;
  return `${n} kg`;
}

function isBodyProfileNotFound(error: unknown): boolean {
  return (
    error instanceof ApiError &&
    error.status === 404 &&
    error.code === "BODY_PROFILE_NOT_FOUND"
  );
}

function getErrorMessage(error: unknown): string {
  if (error instanceof ApiError) return error.responseMessage;
  if (error instanceof Error) return error.message;
  return "신체 프로필 저장 중 오류가 발생했습니다.";
}

export default function ProfileScreen() {
  const router = useRouter();
  const profile = useUserProfileStore((s) => s.profile);
  const setProfile = useUserProfileStore((s) => s.setProfile);
  const bodyProfileQuery = useBodyProfileQuery();
  const createMutation = useCreateBodyProfileMutation();
  const updateMutation = useUpdateBodyProfileMutation();
  const initializedFromServerRef = useRef(false);

  const [height, setHeight] = useState(profile.heightCm?.toString() ?? "");
  const [weight, setWeight] = useState(profile.weightKg?.toString() ?? "");
  const [gender, setGender] = useState<UserProfileState["gender"]>(profile.gender);
  const [bodyShapeTags, setBodyShapeTags] = useState<string[]>(profile.bodyShapeTags ?? []);
  const [formError, setFormError] = useState<string | null>(null);

  const summaryGender = useMemo(() => genderLabel(gender), [gender]);
  const isCreateMode = bodyProfileQuery.isError && isBodyProfileNotFound(bodyProfileQuery.error);
  const isEditMode = bodyProfileQuery.isSuccess && bodyProfileQuery.data != null;
  const hasQueryError = bodyProfileQuery.isError && !isCreateMode;
  const queryErrorMessage = hasQueryError
    ? getErrorMessage(bodyProfileQuery.error) || "신체 프로필을 불러오지 못했습니다."
    : null;
  const isSaving = createMutation.isPending || updateMutation.isPending;

  useEffect(() => {
    if (!bodyProfileQuery.data || initializedFromServerRef.current) return;

    const localProfile = toLocalUserProfile(bodyProfileQuery.data);
    setHeight(localProfile.heightCm?.toString() ?? "");
    setWeight(localProfile.weightKg?.toString() ?? "");
    setGender(localProfile.gender);
    setBodyShapeTags(localProfile.bodyShapeTags);
    initializedFromServerRef.current = true;
  }, [bodyProfileQuery.data]);

  function toggleBodyShapeTag(label: string) {
    setBodyShapeTags((prev) =>
      prev.includes(label) ? prev.filter((t) => t !== label) : [...prev, label],
    );
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (isSaving || hasQueryError) return;

    setFormError(null);
    const h = height.trim() === "" ? null : Number(height);
    const w = weight.trim() === "" ? null : Number(weight);
    if (h == null || Number.isNaN(h) || w == null || Number.isNaN(w)) {
      setFormError("키와 몸무게를 숫자로 입력해 주세요.");
      return;
    }

    const localProfile: UserProfileState = {
      heightCm: h,
      weightKg: w,
      gender,
      bodyShapeTags,
    };
    const createRequest = toBodyProfileCreateRequest(localProfile);

    if (!createRequest) {
      setFormError(
        gender === "" || gender === "other"
          ? "현재는 남성 또는 여성만 선택할 수 있습니다."
          : "입력값을 확인해 주세요.",
      );
      return;
    }

    try {
      const response = isEditMode
        ? await updateMutation.mutateAsync({
            height: createRequest.height,
            weight: createRequest.weight,
            gender: createRequest.gender,
            bodyFeatures: createRequest.bodyFeatures,
          })
        : await createMutation.mutateAsync(createRequest);
      const syncedProfile = toLocalUserProfile(response);
      setProfile(syncedProfile);
      router.push("/my-fit");
    } catch (error: unknown) {
      setFormError(getErrorMessage(error));
    }
  }

  const heightPreview = formatHeightPreview(height);
  const weightPreview = formatWeightPreview(weight);

  return (
    <StepPageShell
      step={2}
      label="사용자 프로필"
      title="체형 정보 입력"
      description="1분 안에 끝나는 onboarding입니다. 왼쪽에서 입력하면 오른쪽 요약이 함께 갱신됩니다."
      maxWidth={960}
      panelClassName="profile-panel"
    >
      {bodyProfileQuery.isPending ? (
        <p style={{ margin: 0, color: "var(--muted)" }}>신체 프로필을 불러오는 중입니다.</p>
      ) : hasQueryError ? (
        <div style={{ display: "grid", gap: 12 }}>
          <p style={{ margin: 0, color: "#dc2626" }}>
            {queryErrorMessage || "신체 프로필을 불러오지 못했습니다."}
          </p>
          <GlassCTA type="button" onClick={() => void bodyProfileQuery.refetch()}>
            다시 시도
          </GlassCTA>
        </div>
      ) : (
      <div className={styles.layout}>
        <div className={styles.formColumn}>
          <form className={styles.form} onSubmit={submit}>
            <section className={styles.stepBlock}>
              <p className={styles.stepIndex}>STEP 1</p>
              <label className={styles.field}>
                <span className={styles.fieldLabel}>키</span>
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

            <section className={styles.stepBlock}>
              <p className={styles.stepIndex}>STEP 2</p>
              <label className={styles.field}>
                <span className={styles.fieldLabel}>몸무게</span>
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

            <section className={styles.stepBlock}>
              <p className={styles.stepIndex}>STEP 3</p>
              <div className={styles.field}>
                <span className={styles.fieldLabel}>성별</span>
                <div className={styles.genderPills} role="radiogroup" aria-label="성별 선택">
                  {GENDER_OPTIONS.map((opt) => {
                    const selected = gender === opt.value;
                    return (
                      <button
                        key={opt.label}
                        type="button"
                        role="radio"
                        aria-checked={selected}
                        className={`${styles.genderPill}${selected ? ` ${styles.genderPillActive}` : ""}`}
                        onClick={() => setGender(opt.value)}
                      >
                        {opt.label}
                      </button>
                    );
                  })}
                </div>
              </div>
            </section>

            <section className={styles.stepBlock}>
              <p className={styles.stepIndex}>STEP 4</p>
              <div className={styles.field}>
                <span className={styles.fieldLabel}>체형 특징</span>
                <p className={tagStyles.hint}>해당되는 항목을 눌러 선택할 수 있습니다. (복수 선택)</p>
                <div className={tagStyles.tagWrap} role="group" aria-label="체형 특징 태그">
                  {BODY_SHAPE_TAG_OPTIONS.map((label) => {
                    const selected = bodyShapeTags.includes(label);
                    return (
                      <button
                        key={label}
                        type="button"
                        aria-pressed={selected}
                        className={`${tagStyles.tag}${selected ? ` ${tagStyles.tagActive}` : ""}`}
                        onClick={() => toggleBodyShapeTag(label)}
                      >
                        {label}
                      </button>
                    );
                  })}
                </div>
              </div>
            </section>

            <div className={styles.ctaWrap}>
              {formError ? (
                <p style={{ margin: "0 0 12px", color: "#dc2626", fontWeight: 600 }}>
                  {formError}
                </p>
              ) : null}
              <GlassCTA type="submit" disabled={isSaving || hasQueryError}>
                {isSaving ? "저장 중..." : isEditMode ? "수정 후 다음" : "저장 후 다음"}
              </GlassCTA>
            </div>
          </form>
        </div>

        <aside className={styles.summaryColumn} aria-label="프로필 요약">
          <div className={styles.summaryCard}>
            <p className={styles.summaryTitle}>PROFILE PREVIEW</p>
            <p className={styles.summaryProduct}>입력 요약</p>
            <ul className={styles.summaryList}>
              <li className={styles.summaryItem}>
                <span className={styles.summaryKey}>키</span>
                {heightPreview ? (
                  <span className={styles.summaryValue}>{heightPreview}</span>
                ) : (
                  <span className={styles.summaryEmpty}>아직 입력되지 않았습니다.</span>
                )}
              </li>
              <li className={styles.summaryItem}>
                <span className={styles.summaryKey}>몸무게</span>
                {weightPreview ? (
                  <span className={styles.summaryValue}>{weightPreview}</span>
                ) : (
                  <span className={styles.summaryEmpty}>아직 입력되지 않았습니다.</span>
                )}
              </li>
              <li className={styles.summaryItem}>
                <span className={styles.summaryKey}>성별</span>
                <span className={styles.summaryValue}>{summaryGender}</span>
              </li>
              <li className={styles.summaryItem}>
                <span className={styles.summaryKey}>체형 특징</span>
                {bodyShapeTags.length > 0 ? (
                  <div className={styles.tagSummaryWrap}>
                    {bodyShapeTags.map((t) => (
                      <span key={t} className={styles.tagSummaryPill}>
                        {t}
                      </span>
                    ))}
                  </div>
                ) : (
                  <span className={styles.summaryEmpty}>선택한 특징이 없습니다. 해당되면 태그를 눌러 주세요.</span>
                )}
              </li>
            </ul>
          </div>
        </aside>
      </div>
      )}

      <FlowFooterNav items={[{ href: "/", label: "홈" }]} />
    </StepPageShell>
  );
}
