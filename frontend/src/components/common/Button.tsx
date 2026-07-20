// 이 파일은 앱 전반에서 사용하는 기본 버튼 컴포넌트를 정의합니다.
import type { ButtonHTMLAttributes } from "react";

export type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement>;

export function Button({ style, type = "button", ...rest }: ButtonProps) {
  return (
    <button
      type={type}
      {...rest}
      style={{
        padding: "0.65rem 1rem",
        cursor: rest.disabled ? "not-allowed" : "pointer",
        ...style,
      }}
    />
  );
}
