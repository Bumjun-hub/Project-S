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
        border: "1px solid var(--border)",
        background: "#fff",
        color: "var(--fg)",
        outline: "none",
        backdropFilter: "blur(12px) saturate(1.1)",
        WebkitBackdropFilter: "blur(12px) saturate(1.1)",
        boxShadow: "0 1px 2px rgba(15, 23, 42, 0.03)",
        ...style,
      }}
    />
  );
}
