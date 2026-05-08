// 이 파일은 사용자의 기준 핏 입력 화면을 정의합니다.
"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { GlassCTA } from "@/components/common/GlassCTA";
import { Input } from "@/components/common/Input";
import { Select } from "@/components/common/Select";
import { StepPageShell } from "@/components/layout/StepPageShell";
import { useFitReferenceStore } from "@/features/my-fit/store";
import type { FitCategory, FitFeeling, FitMeasurement } from "@/features/my-fit/types";

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
      alert("입력한 실측마다 cm 값과 컸는지/작았는지 체크를 함께 완료해 주세요.");
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
      description="Measurement Builder에서 부위별 수치를 입력하고 착용감을 함께 저장하세요."
      maxWidth={680}
      panelClassName="myfit-panel"
    >
      <form className="myfit-builder-form" onSubmit={submit}>
        <div className="myfit-builder-top">
          <label style={{ display: "grid", gap: 6 }}>
            <span className="myfit-field-label">카테고리</span>
            <Select value={category} onChange={(e) => syncCategory(e.target.value as FitCategory)}>
              {CATEGORY_OPTIONS.map((opt) => (
                <option value={opt.value} key={opt.value}>
                  {opt.label}
                </option>
              ))}
            </Select>
          </label>
          <label style={{ display: "grid", gap: 6 }}>
            <span className="myfit-field-label">기준 옷 이름</span>
            <Input
              value={garmentLabel}
              onChange={(e) => setGarmentLabel(e.target.value)}
              placeholder="예: 평소 입는 옥스포드 M"
              required
            />
          </label>
        </div>

        <section className="myfit-builder-table">
          <div className="myfit-builder-head">
            <span>부위</span>
            <span>실측 (cm)</span>
            <span>착용감</span>
          </div>
          {CATEGORY_MEASUREMENTS[category].map((area) => (
            <div key={area} className="myfit-builder-row">
              <span className="myfit-row-area">{area}</span>
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
                <option value="large">컸음</option>
              </Select>
            </div>
          ))}
        </section>

        <div className="myfit-cta-wrap">
          <GlassCTA type="submit">저장 후 상품 목록으로</GlassCTA>
        </div>
      </form>
      <p style={{ marginTop: "1.5rem" }}>
        <Link href="/profile">← 프로필</Link>
      </p>
    </StepPageShell>
  );
}
