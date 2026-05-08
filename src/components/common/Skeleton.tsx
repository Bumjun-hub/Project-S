// 이 파일은 데이터 로딩 중 표시할 스켈레톤 컴포넌트를 정의합니다.
type SkeletonProps = {
  height?: number | string;
  width?: number | string;
};

export function Skeleton({ height = 12, width = "100%" }: SkeletonProps) {
  return (
    <div
      aria-hidden
      style={{
        height,
        width,
        borderRadius: 6,
        background: "linear-gradient(90deg, #eee 25%, #e4e4e4 50%, #eee 75%)",
        backgroundSize: "200% 100%",
        animation: "skeleton-shimmer 1.2s ease-in-out infinite",
      }}
    />
  );
}
