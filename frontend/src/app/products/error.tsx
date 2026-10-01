"use client";

import Link from "next/link";
export default function ProductError({ reset }: { reset: () => void }) {
  return <main style={{ maxWidth: 720, margin: "40px auto", padding: 24 }}>
    <h1>상품 정보를 불러오지 못했어요</h1>
    <p role="alert">연결 상태를 확인하고 다시 시도해 주세요.</p>
    <button type="button" onClick={reset}>다시 시도</button>{" "}<Link href="/products">상품 목록</Link>
  </main>;
}
