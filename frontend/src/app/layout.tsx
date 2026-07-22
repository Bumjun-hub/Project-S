// 이 파일은 전체 앱의 공통 HTML 구조, 전역 스타일, Provider, Header를 설정합니다.
import type { Metadata } from "next";
import { GlobalBackgroundFx } from "@/components/layout/GlobalBackgroundFx";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import "@/styles/globals.css";
import { AppProviders } from "./providers";

export const metadata: Metadata = {
  title: "Project S",
  description: "AI 의류 사이즈 추천",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko">
      <body>
        <AppProviders>
          <GlobalBackgroundFx />
          <div style={{ position: "relative", zIndex: 1 }}>
            <Header />
            {children}
            <Footer />
          </div>
        </AppProviders>
      </body>
    </html>
  );
}
