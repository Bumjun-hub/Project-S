// 이 파일은 표시할 데이터가 없을 때 쓰는 빈 상태 컴포넌트를 정의합니다.
import type { ReactNode } from "react";

type EmptyStateProps = {
  title: string;
  description?: string;
  children?: ReactNode;
};

export function EmptyState({ title, description, children }: EmptyStateProps) {
  return (
    <div style={{ textAlign: "center", padding: "2rem 1rem" }}>
      <h2 style={{ margin: "0 0 0.5rem", fontSize: "1.1rem" }}>{title}</h2>
      {description ? (
        <p style={{ margin: "0 0 1rem", color: "var(--muted)" }}>{description}</p>
      ) : null}
      {children}
    </div>
  );
}
