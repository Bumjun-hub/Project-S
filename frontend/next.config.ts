// Next.js 빌드·번들 설정: App Router 프로젝트의 공통 빌드 옵션을 정의한다.
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Keep the demo test build separate from the real API preview on port 3000.
  distDir: process.env.PROJECT_S_E2E === "1" ? ".next-e2e" : ".next",
  typescript: {
    tsconfigPath: process.env.PROJECT_S_E2E === "1" ? "tsconfig.e2e.json" : "tsconfig.json",
  },
};

export default nextConfig;
