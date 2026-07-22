import type { ButtonHTMLAttributes } from "react";
import { Button } from "@/components/common/Button";

type GlassCTAProps = ButtonHTMLAttributes<HTMLButtonElement>;

export function GlassCTA({ style, ...rest }: GlassCTAProps) {
  return (
    <Button
      {...rest}
      style={{
        padding: "0.72rem 1.1rem",
        borderRadius: 12,
        border: "1px solid var(--primary)",
        background: "var(--primary)",
        color: "#fff",
        fontWeight: 700,
        boxShadow: "0 8px 16px rgba(37, 99, 235, 0.18)",
        transition: "transform .2s ease, background .2s ease, box-shadow .2s ease",
        ...style,
      }}
    />
  );
}
