"use client";

import { useRouter } from "next/navigation";
import { Button } from "@/components/common/Button";
import { useFlowBootstrapStore } from "@/stores/flowBootstrapStore";

const defaultButtonStyle = {
  width: "100%",
  maxWidth: 300,
  marginInline: "auto",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  fontWeight: 700,
  borderRadius: 14,
  padding: "0.8rem 1.1rem",
  fontSize: "0.95rem",
  border: "1px solid rgba(173, 190, 244, 0.44)",
  background: "linear-gradient(135deg, rgba(77, 118, 235, 0.96) 0%, rgba(108, 95, 227, 0.95) 100%)",
  color: "#f5f8ff",
  boxShadow: "0 10px 30px rgba(61, 88, 189, 0.42), inset 0 1px 0 rgba(255,255,255,0.16)",
  transition: "transform 0.2s ease, box-shadow 0.2s ease",
} as const;

/** 쇼케이스 CTA는 `LandingTimelineDetails.module.css`의 `.ctaBlock :global(button)`이 스타일 담당 */
const showcaseLayoutStyle = {
  width: "100%",
  maxWidth: 300,
  marginInline: "auto",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  cursor: "pointer",
} as const;

type LandingStartSectionProps = {
  stylePreset?: "default" | "showcase";
};

export function LandingStartSection({ stylePreset = "default" }: LandingStartSectionProps) {
  const router = useRouter();
  const acknowledgeIntro = useFlowBootstrapStore((s) => s.acknowledgeIntro);

  function startProfileStep() {
    acknowledgeIntro();
    router.push("/profile");
  }

  const btnStyle = stylePreset === "showcase" ? showcaseLayoutStyle : defaultButtonStyle;

  return (
    <p style={{ marginTop: 0, marginBottom: 0, width: "100%", textAlign: "center" }}>
      <Button type="button" onClick={startProfileStep} style={btnStyle}>
        내 사이즈 분석 시작하기
      </Button>
    </p>
  );
}
