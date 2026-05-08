// 이 파일은 404 안내 화면 컴포넌트를 정의합니다.
import Link from "next/link";
import { PageContainer } from "@/components/layout/PageContainer";

export default function NotFoundScreen() {
  return (
    <PageContainer maxWidth={560}>
      <h1 style={{ marginTop: 0 }}>페이지를 찾을 수 없습니다</h1>
      <p style={{ color: "var(--muted)" }}>주소가 바뀌었거나 잘못 입력되었을 수 있습니다.</p>
      <p>
        <Link href="/">홈으로</Link>
        {" · "}
        <Link href="/products">상품 목록</Link>
      </p>
    </PageContainer>
  );
}
