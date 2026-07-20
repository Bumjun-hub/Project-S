// 이 파일은 사용자의 기준 핏 입력 화면을 정의합니다.
"use client";

import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { FlowFooterNav } from "@/components/common/FlowFooterNav";
import { GlassCTA } from "@/components/common/GlassCTA";
import { Input } from "@/components/common/Input";
import { Select } from "@/components/common/Select";
import { StepPageShell } from "@/components/layout/StepPageShell";
import { useFitReferenceStore } from "@/features/my-fit/store";
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

export default function MyFitScreen() {
  const router = useRouter();
  const myFit = useFitReferenceStore((s) => s.myFit);
  const setMyFit = useFitReferenceStore((s) => s.setMyFit);

  const [category, setCategory] = useState<FitCategory>(myFit.selectedCategory);
  const activeEntry = myFit.entries[category];
  const activeMap = toMap(activeEntry?.measurements ?? []);

  const [garmentLabel, setGarmentLabel] = useState(activeEntry?.garmentLabel ?? "");
  const [sizeByArea, setSizeByArea] = useState<Record<string, string>>(() => {
    const base: Record<string, string> = {};
    for (const area of CATEGORY_MEASUREMENTS[category]) {
      base[area] = activeMap[area]?.sizeCm?.toString() ?? "";
    }
    return base;
  });
  const [feelingByArea, setFeelingByArea] = useState<Record<string, FitFeeling | "">>(() => {
    const base: Record<string, FitFeeling | ""> = {};
    for (const area of CATEGORY_MEASUREMENTS[category]) {
      base[area] = activeMap[area]?.feeling ?? "";
    }
    return base;
  });

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

  function syncCategory(next: FitCategory) {
    setCategory(next);
    const entry = myFit.entries[next];
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

  function submit(e: React.FormEvent) {
    e.preventDefault();
    if (garmentLabel.trim() === "") {
      alert("기준 옷을 구분할 이름(예: 잘 맞는 셔츠)을 입력해 주세요.");
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
      alert("실측 사이즈를 1개 이상 입력해 주세요.");
      return;
    }

    const invalid = measurements.find((m) => m.sizeCm == null || Number.isNaN(m.sizeCm) || m.feeling == null);
    if (invalid) {
      alert("입력한 실측마다 cm 값과 착용감(작았음/딱맞음/컸음) 선택을 함께 완료해 주세요.");
      return;
    }

    setMyFit({
      selectedCategory: category,
      entries: {
        ...myFit.entries,
        [category]: {
          garmentLabel: garmentLabel.trim(),
          measurements,
        },
      },
    });
    router.push("/products");
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
          <GlassCTA type="submit">저장 후 상품 목록으로</GlassCTA>
        </div>
      </form>

      <FlowFooterNav
        items={[
          { href: "/profile", label: "프로필" },
          { href: "/", label: "홈" },
        ]}
      />
    </StepPageShell>
  );
}
