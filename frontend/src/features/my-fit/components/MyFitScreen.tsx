// 이 파일은 사용자의 기준 핏 입력 화면을 정의합니다.
"use client";

import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { FlowFooterNav } from "@/components/common/FlowFooterNav";
import { GlassCTA } from "@/components/common/GlassCTA";
import { Input } from "@/components/common/Input";
import { Select } from "@/components/common/Select";
import { StepPageShell } from "@/components/layout/StepPageShell";
import { createMyFit, getMyFit, updateMyFit } from "@/features/my-fit/api";
import {
  toLocalMyFit,
  toMyFitCreateRequest,
  toMyFitUpdateRequest,
} from "@/features/my-fit/lib/myFitMapper";
import { useFitReferenceStore } from "@/features/my-fit/store";
import { ApiError } from "@/lib/apiClient";
import { readSessionIdentity, safeReturnTo, useSessionIdentity } from "@/lib/auth-session";
import type { FitCategory, FitFeeling, FitMeasurement } from "@/features/my-fit/types";
import styles from "./MyFitScreen.module.css";

const CATEGORY_OPTIONS: Array<{ value: FitCategory; label: string }> = [
  { value: "top", label: "상의" },
  { value: "bottom", label: "하의" },
  { value: "etc", label: "기타" },
];

const CATEGORY_MEASUREMENTS: Record<FitCategory, string[]> = {
  top: ["총장", "어깨너비", "가슴단면", "소매길이"],
  bottom: ["총장", "허리단면", "엉덩이 단면", "허벅지 단면", "밑위", "밑단단면"],
  etc: ["총장", "소매", "밑단"],
};

function toMap(measurements: FitMeasurement[]) {
  return measurements.reduce<Record<string, FitMeasurement>>((acc, m) => {
    acc[m.area] = m;
    return acc;
  }, {});
}

function feelingLabel(f: FitFeeling | ""): string {
  if (f === "small") return "작았음";
  if (f === "exact") return "딱맞음";
  if (f === "large") return "컸음";
  return "";
}

function isMyFitNotFound(error: unknown): boolean {
  return (
    error instanceof ApiError &&
    error.status === 404 &&
    error.code === "MY_FIT_NOT_FOUND"
  );
}

function getErrorMessage(error: unknown): string {
  if (error instanceof ApiError) return error.responseMessage;
  if (error instanceof Error) return error.message;
  return "기준 핏 저장 중 오류가 발생했습니다.";
}

export default function MyFitScreen() {
  const router = useRouter();
  const identity = useSessionIdentity();
  const myFit = useFitReferenceStore((s) => s.myFit);
  const setMyFit = useFitReferenceStore((s) => s.setMyFit);

  const [category, setCategory] = useState<FitCategory>(myFit.selectedCategory);
  const initialEntry = myFit.entries[category];
  const initialMap = toMap(initialEntry?.measurements ?? []);

  const [garmentLabel, setGarmentLabel] = useState(initialEntry?.garmentLabel ?? "");
  const [sizeByArea, setSizeByArea] = useState<Record<string, string>>(() => {
    const base: Record<string, string> = {};
    for (const area of CATEGORY_MEASUREMENTS[category]) {
      base[area] = initialMap[area]?.sizeCm?.toString() ?? "";
    }
    return base;
  });
  const [feelingByArea, setFeelingByArea] = useState<Record<string, FitFeeling | "">>(() => {
    const base: Record<string, FitFeeling | ""> = {};
    for (const area of CATEGORY_MEASUREMENTS[category]) {
      base[area] = initialMap[area]?.feeling ?? "";
    }
    return base;
  });
  const [serverMyFitExists, setServerMyFitExists] = useState(false);
  const [isLoadingMyFit, setIsLoadingMyFit] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const areas = CATEGORY_MEASUREMENTS[category];

  const { completedCount, feelingLines } = useMemo(() => {
    let n = 0;
    const lines: string[] = [];
    for (const area of areas) {
      const raw = (sizeByArea[area] ?? "").trim();
      const sizeCm = raw === "" ? null : Number(raw);
      const feeling = feelingByArea[area] ?? "";
      if (sizeCm != null && !Number.isNaN(sizeCm) && feeling !== "") {
        n += 1;
        lines.push(`${area}: ${feelingLabel(feeling)}`);
      }
    }
    return { completedCount: n, feelingLines: lines };
  }, [areas, sizeByArea, feelingByArea]);

  const categoryLabel = CATEGORY_OPTIONS.find((o) => o.value === category)?.label ?? category;

  function syncEntryForm(next: FitCategory, sourceMyFit = myFit) {
    const entry = sourceMyFit.entries[next];
    const map = toMap(entry?.measurements ?? []);
    setGarmentLabel(entry?.garmentLabel ?? "");
    const nextSize: Record<string, string> = {};
    const nextFeeling: Record<string, FitFeeling | ""> = {};
    for (const area of CATEGORY_MEASUREMENTS[next]) {
      nextSize[area] = map[area]?.sizeCm?.toString() ?? "";
      nextFeeling[area] = map[area]?.feeling ?? "";
    }
    setSizeByArea(nextSize);
    setFeelingByArea(nextFeeling);
  }

  function syncCategory(next: FitCategory) {
    setCategory(next);
    syncEntryForm(next);
  }

  useEffect(() => {
    let cancelled = false;

    async function loadMyFit() {
      setIsLoadingMyFit(true);
      setFormError(null);

      try {
        const response = await getMyFit();
        if (cancelled) return;

        const localMyFit = toLocalMyFit(response);
        setMyFit(localMyFit);
        setServerMyFitExists(true);
        setCategory(localMyFit.selectedCategory);
        syncEntryForm(localMyFit.selectedCategory, localMyFit);
      } catch (error: unknown) {
        if (cancelled) return;

        if (isMyFitNotFound(error)) {
          setServerMyFitExists(false);
          return;
        }

        setFormError(getErrorMessage(error));
      } finally {
        if (!cancelled) {
          setIsLoadingMyFit(false);
        }
      }
    }

    void loadMyFit();

    return () => {
      cancelled = true;
    };
  }, [setMyFit]);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (isSaving || isLoadingMyFit) return;

    setFormError(null);
    if (category === "etc") {
      setFormError("기타 카테고리는 아직 서버 저장을 지원하지 않습니다. 상의 또는 하의를 선택해 주세요.");
      return;
    }

    if (garmentLabel.trim() === "") {
      setFormError("기준 옷을 구분할 이름(예: 잘 맞는 셔츠)을 입력해 주세요.");
      return;
    }

    const measurements: FitMeasurement[] = CATEGORY_MEASUREMENTS[category]
      .map((area) => {
        const raw = (sizeByArea[area] ?? "").trim();
        const sizeCm = raw === "" ? null : Number(raw);
        const feeling = feelingByArea[area] === "" ? null : (feelingByArea[area] as FitFeeling);
        return { area, sizeCm, feeling };
      })
      .filter((m) => m.sizeCm != null || m.feeling != null);

    if (measurements.length === 0) {
      setFormError("실측 사이즈를 1개 이상 입력해 주세요.");
      return;
    }

    const invalid = measurements.find((m) => m.sizeCm == null || !Number.isFinite(m.sizeCm) || m.sizeCm <= 0 || m.sizeCm > 300 || m.feeling == null);
    if (invalid) {
      setFormError("실측은 0 초과 300cm 이하로 입력하고, 각 부위의 착용감도 선택해 주세요.");
      return;
    }

    const nextMyFit = {
      selectedCategory: category,
      entries: {
        ...myFit.entries,
        [category]: {
          garmentLabel: garmentLabel.trim(),
          measurements,
        },
      },
    };

    setIsSaving(true);
    try {
      const response = serverMyFitExists
        ? await updateExistingMyFit(nextMyFit)
        : await createNewMyFit(nextMyFit);
      const syncedMyFit = toLocalMyFit(response);
      if (readSessionIdentity() !== identity) return;
      setMyFit(syncedMyFit);
      setServerMyFitExists(true);
      router.push(safeReturnTo(new URLSearchParams(window.location.search).get("returnTo")));
    } catch (error: unknown) {
      setFormError(getErrorMessage(error));
    } finally {
      setIsSaving(false);
    }
  }

  async function createNewMyFit(nextMyFit: typeof myFit) {
    const request = toMyFitCreateRequest(nextMyFit);
    if (!request) {
      throw new Error("서버에 저장할 상의 또는 하의 기준 핏 정보를 입력해 주세요.");
    }

    return createMyFit(request);
  }

  async function updateExistingMyFit(nextMyFit: typeof myFit) {
    const request = toMyFitUpdateRequest(nextMyFit);
    if (!request) {
      throw new Error("서버에 저장할 상의 또는 하의 기준 핏 정보를 입력해 주세요.");
    }

    return updateMyFit(request);
  }

  return (
    <StepPageShell
      step={3}
      label="기준 옷 실측"
      title="기준 옷 실측 입력"
      description="부위별 실측과 착용감을 함께 저장하면 추천이 더 정확해집니다."
      maxWidth={720}
      panelClassName="myfit-panel"
    >
      {isLoadingMyFit ? (
        <p style={{ margin: 0, color: "var(--muted)" }}>기준 핏 정보를 불러오는 중입니다.</p>
      ) : (
      <form className={styles.form} onSubmit={submit}>
        <section className={styles.summaryCard} aria-label="내 기준 옷 요약">
          <p className={styles.summaryKicker}>REFERENCE GARMENT</p>
          <h2 className={styles.summaryTitle}>내 기준 옷 요약</h2>
          <div className={styles.summaryGrid}>
            <div className={styles.summaryCell}>
              <span className={styles.summaryLabel}>카테고리</span>
              <span className={styles.summaryValue}>{categoryLabel}</span>
            </div>
            <div className={styles.summaryCell}>
              <span className={styles.summaryLabel}>실측 입력</span>
              <span className={styles.summaryValue}>
                {completedCount} / {areas.length}개
              </span>
            </div>
            <div className={styles.summaryCellWide}>
              <span className={styles.summaryLabel}>기준 옷 이름</span>
              {garmentLabel.trim() !== "" ? (
                <span className={styles.summaryValue}>{garmentLabel.trim()}</span>
              ) : (
                <span className={styles.summaryMuted}>이름을 입력하면 여기에 표시됩니다.</span>
              )}
            </div>
            <div className={styles.summaryCellWide}>
              <span className={styles.summaryLabel}>착용감 요약</span>
              {feelingLines.length > 0 ? (
                <ul className={styles.summaryList}>
                  {feelingLines.map((line, i) => (
                    <li key={`${i}-${line}`}>{line}</li>
                  ))}
                </ul>
              ) : (
                <span className={styles.summaryMuted}>
                  cm와 착용감이 모두 채워진 행만 요약에 나타납니다.
                </span>
              )}
            </div>
          </div>
        </section>

        <div className={styles.builderTop}>
          <label className={styles.fieldStack}>
            <span className={styles.fieldLabel}>카테고리</span>
            <Select value={category} onChange={(e) => syncCategory(e.target.value as FitCategory)}>
              {CATEGORY_OPTIONS.map((opt) => (
                <option value={opt.value} key={opt.value}>
                  {opt.label}
                </option>
              ))}
            </Select>
          </label>
          <label className={styles.fieldStack}>
            <span className={styles.fieldLabel}>기준 옷 이름</span>
            <Input
              value={garmentLabel}
              onChange={(e) => setGarmentLabel(e.target.value)}
              placeholder="예: 평소 입는 옥스포드 M"
              required
            />
          </label>
        </div>

        <section className={styles.table} aria-label="부위별 실측">
          <div className={styles.tableHead}>
            <span>부위</span>
            <span>실측 (cm)</span>
            <span>착용감</span>
          </div>
          <div className={styles.tableBody}>
            {areas.map((area) => (
              <div key={area} className={styles.tableRow}>
                <span className={styles.rowArea}>{area}</span>
                <Input
                  aria-label={`${area} 실측 (cm)`}
                  inputMode="decimal"
                  value={sizeByArea[area] ?? ""}
                  onChange={(e) =>
                    setSizeByArea((prev) => ({
                      ...prev,
                      [area]: e.target.value,
                    }))
                  }
                  placeholder="cm"
                />
                <Select
                  aria-label={`${area} 착용감`}
                  value={feelingByArea[area] ?? ""}
                  onChange={(e) =>
                    setFeelingByArea((prev) => ({
                      ...prev,
                      [area]: e.target.value as FitFeeling | "",
                    }))
                  }
                >
                  <option value="">선택</option>
                  <option value="small">작았음</option>
                  <option value="exact">딱맞음</option>
                  <option value="large">컸음</option>
                </Select>
              </div>
            ))}
          </div>
        </section>

        <p className={styles.footerNote}>
          이 기준 옷은 상품 실측과 비교되어 추천에 사용됩니다.
        </p>

        <div className={styles.ctaWrap}>
          {formError ? (
            <p style={{ margin: "0 0 12px", color: "#dc2626", fontWeight: 600 }}>
              {formError}
            </p>
          ) : null}
          <GlassCTA type="submit" disabled={isSaving}>
            {isSaving ? "저장 중..." : serverMyFitExists ? "수정 후 계속하기" : "저장 후 계속하기"}
          </GlassCTA>
        </div>
      </form>
      )}

      <FlowFooterNav
        items={[
          { href: "/profile", label: "프로필" },
          { href: "/", label: "홈" },
        ]}
      />
    </StepPageShell>
  );
}
