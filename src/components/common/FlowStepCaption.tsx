// 이 파일은 추천 플로우의 단계 안내 캡션 컴포넌트를 정의합니다.
type FlowStepCaptionProps = { step: number; label: string; align?: "center" | "start" };

export function FlowStepCaption({ step, label, align = "center" }: FlowStepCaptionProps) {
  const centered = align === "center";

  return (
    <div style={{ marginTop: 0, marginBottom: centered ? "1rem" : "1.35rem", textAlign: centered ? "center" : "left" }}>
      <p
        style={{
          marginTop: 0,
          marginBottom: "0.55rem",
          fontSize: "0.85rem",
          color: "var(--muted)",
        }}
      >
        단계 {step}/7 · {label}
      </p>
      <div
        aria-hidden
        style={{
          margin: centered ? "0 auto" : 0,
          maxWidth: 340,
          display: "grid",
          gridTemplateColumns: "repeat(7, minmax(0, 1fr))",
          gap: 6,
        }}
      >
        {Array.from({ length: 7 }, (_, idx) => {
          const s = idx + 1;
          const done = s < step;
          const current = s === step;
          return (
            <span
              key={s}
              style={{
                height: 7,
                borderRadius: 999,
                border: "1px solid rgba(255,255,255,0.16)",
                background: current
                  ? "linear-gradient(90deg, rgba(126, 152, 194, 0.72), rgba(108, 129, 171, 0.72))"
                  : done
                    ? "rgba(108, 129, 171, 0.5)"
                    : "rgba(255,255,255,0.08)",
                boxShadow: current ? "0 0 0 1px rgba(126, 152, 194, 0.25)" : "none",
              }}
            />
          );
        })}
      </div>
    </div>
  );
}
