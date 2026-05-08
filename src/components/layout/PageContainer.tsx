// 이 파일은 화면 콘텐츠의 공통 폭과 여백을 잡는 레이아웃 컴포넌트를 정의합니다.
import type { ReactNode } from "react";

type PageContainerProps = {
  children: ReactNode;
  /** 최대 너비(px) */
  maxWidth?: number;
};

export function PageContainer({ children, maxWidth = 720 }: PageContainerProps) {
  return (
    <div style={{ padding: "2rem", maxWidth, margin: "0 auto" }}>
      {children}
    </div>
  );
}
