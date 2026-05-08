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
        border: "0.5px solid rgba(189, 210, 255, 0.44)",
        background: "linear-gradient(135deg, rgba(78, 116, 245, 0.95), rgba(118, 94, 238, 0.9))",
        color: "#f7fbff",
        fontWeight: 700,
        boxShadow:
          "0 14px 34px rgba(46, 67, 198, 0.44), 0 0 42px rgba(108, 131, 255, 0.28), inset 0 1px 0 rgba(255,255,255,0.2)",
        ...style,
      }}
    />
  );
}
