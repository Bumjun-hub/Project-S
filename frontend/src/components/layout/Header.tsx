// 이 파일은 앱 상단 네비게이션 헤더 컴포넌트를 정의합니다.
"use client";

import type { CSSProperties } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

const linkStyle: CSSProperties = {
  fontSize: "0.88rem",
  textDecoration: "none",
  borderRadius: 999,
  padding: "0.4rem 0.78rem",
  border: "1px solid transparent",
  color: "var(--muted)",
  transition: "all 180ms ease",
  whiteSpace: "nowrap",
};

const navItems = [
  { href: "/profile", label: "프로필" },
  { href: "/my-fit", label: "기준 옷" },
  { href: "/products", label: "상품" },
  { href: "/result", label: "결과" },
  { href: "/history", label: "기록" },
];

export function Header() {
  const pathname = usePathname();

  const isActive = (href: string) => pathname === href || pathname.startsWith(`${href}/`);

  return (
    <header
      style={{
        position: "sticky",
        top: 10,
        zIndex: 30,
        display: "flex",
        justifyContent: "center",
        padding: "0 1rem",
        pointerEvents: "none",
      }}
    >
      <div
        style={{
          pointerEvents: "auto",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: "0.6rem 0.95rem",
          flexWrap: "wrap",
          borderRadius: 999,
          padding: "0.52rem 0.95rem",
          border: "1px solid rgba(255,255,255,0.16)",
          background: "rgba(22,22,22,0.78)",
          boxShadow: "0 8px 30px rgba(0,0,0,0.35)",
          WebkitBackdropFilter: "blur(8px)",
          backdropFilter: "blur(8px)",
        }}
      >
        <strong style={{ paddingInline: "0.26rem" }}>
          <Link href="/" style={{ textDecoration: "none", color: "var(--fg)", fontSize: "0.98rem" }}>
            Project S
          </Link>
        </strong>
        <nav style={{ display: "flex", flexWrap: "wrap", gap: "0.42rem 0.52rem", justifyContent: "center" }}>
          {navItems.map((item) => {
            const active = isActive(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                aria-current={active ? "page" : undefined}
                style={{
                  ...linkStyle,
                  color: active ? "#eef3ff" : "var(--muted)",
                  borderColor: active ? "rgba(152, 168, 194, 0.42)" : "transparent",
                  background: active
                    ? "linear-gradient(90deg, rgba(74, 86, 108, 0.5), rgba(91, 106, 135, 0.34))"
                    : "transparent",
                  boxShadow: active ? "0 4px 12px rgba(33, 40, 57, 0.32)" : "none",
                }}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>
      </div>
    </header>
  );
}
