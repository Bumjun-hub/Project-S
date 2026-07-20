// 이 파일은 반복 콘텐츠를 감싸는 기본 카드 컴포넌트를 정의합니다.
import type { CSSProperties, ReactNode } from "react";

type CardProps = {
  children: ReactNode;
  style?: CSSProperties;
};

export function Card({ children, style }: CardProps) {
  return (
    <div
      style={{
        border: "1px solid var(--border)",
        borderRadius: 8,
        padding: "1rem",
        ...style,
      }}
    >
      {children}
    </div>
  );
}
