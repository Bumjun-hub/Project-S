// 이 파일은 앱 전반에서 사용하는 기본 입력 컴포넌트를 정의합니다.
import type { InputHTMLAttributes } from "react";

export type InputProps = InputHTMLAttributes<HTMLInputElement>;

export function Input({ style, className, ...rest }: InputProps) {
  return (
    <input
      {...rest}
      className={["app-input", className].filter(Boolean).join(" ")}
      style={{
        padding: "0.56rem 0.78rem",
        width: "100%",
        borderRadius: 12,
        border: "0.5px solid rgba(175, 199, 255, 0.26)",
        background: "linear-gradient(140deg, rgba(17, 24, 44, 0.34), rgba(9, 12, 24, 0.22))",
        color: "var(--fg)",
        outline: "none",
        backdropFilter: "blur(12px) saturate(1.1)",
        WebkitBackdropFilter: "blur(12px) saturate(1.1)",
        boxShadow: "inset 0 0 0 0.5px rgba(210, 225, 255, 0.06), 0 4px 12px rgba(16, 24, 46, 0.14)",
        ...style,
      }}
    />
  );
}
