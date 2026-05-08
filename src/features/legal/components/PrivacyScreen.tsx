// 이 파일은 개인정보 처리방침 화면 컴포넌트를 정의합니다.
import Link from "next/link";
import { PageContainer } from "@/components/layout/PageContainer";

export default function PrivacyScreen() {
  return (
    <PageContainer maxWidth={720}>
      <h1 style={{ marginTop: 0 }}>개인정보 처리방침</h1>
      <p style={{ color: "var(--muted)" }}>추후 정책 문구를 채웁니다.</p>
      <p>
        <Link href="/">홈으로</Link>
      </p>
    </PageContainer>
  );
}
