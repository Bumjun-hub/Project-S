"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { Menu, X } from "lucide-react";
import { AUTH_STORAGE_KEYS, endSession, useSessionIdentity } from "@/lib/auth-session";
import { isDemoMode } from "@/lib/demo-mode";
import styles from "./Header.module.css";

const navItems = [
  { href: "/", label: "Home" },
  { href: "/#how-it-works", label: "How It Works" },
  { href: "/products", label: "Products" },
  { href: "/#about", label: "About" },
  { href: "/history", label: "Analysis History", requiresLogin: true },
];

export function Header() {
  const pathname = usePathname();
  const router = useRouter();
  const identity = useSessionIdentity();
  const loginState = { isLoggedIn: Boolean(identity), displayName: identity ? localStorage.getItem(AUTH_STORAGE_KEYS.nickname) || identity : "" };
  const [menuOpen, setMenuOpen] = useState(false);
  const menuButton = useRef<HTMLButtonElement>(null);
  const isEditorial = true;
  const isActive = (href: string) => !href.includes("#") && (pathname === href || (href !== "/" && pathname.startsWith(`${href}/`)));

  useEffect(() => {
    setMenuOpen(false);
  }, [pathname, identity]);
  useEffect(() => {
    if (!menuOpen) return;
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") { setMenuOpen(false); menuButton.current?.focus(); }
    };
    window.addEventListener("keydown", closeOnEscape);
    return () => {
      window.removeEventListener("keydown", closeOnEscape);
    };
  }, [menuOpen]);

  const handleLogout = () => {
    endSession();
    router.replace("/");
  };

  return (
    <header className={`${styles.header} ${isEditorial ? styles.landingHeader : ""}`}>
      <div className={styles.inner}>
        <Link href="/" className={styles.logo} aria-label="Project S 홈">Project S</Link>
        <button ref={menuButton} type="button" className={styles.menuToggle} aria-label={menuOpen ? "메뉴 닫기" : "메뉴 열기"}
          aria-expanded={menuOpen} aria-controls="main-navigation" onClick={() => setMenuOpen((open) => !open)}>
          {menuOpen ? <X size={22} aria-hidden="true" /> : <Menu size={22} aria-hidden="true" />}
        </button>
        <nav id="main-navigation" className={`${styles.nav} ${menuOpen ? styles.menuOpen : ""}`} aria-label="주요 메뉴">
          {navItems
            .filter((item) => !item.requiresLogin || loginState.isLoggedIn)
            .map((item) => (
              <Link key={item.href} href={item.href} aria-current={isActive(item.href) ? "page" : undefined}
                className={isActive(item.href) ? styles.active : undefined} onClick={() => setMenuOpen(false)}>
                {item.label}
              </Link>
            ))}
        </nav>
        <div className={styles.actions}>
          {loginState.isLoggedIn ? (
            <>
              <span className={styles.welcome}>{loginState.displayName}님 환영합니다</span>
              <button className={styles.logout} type="button" onClick={handleLogout}>Logout</button>
            </>
          ) : (
            <>
              <Link href="/login" className={styles.login}>{isEditorial ? "Log in" : "Login"}</Link>
              <Link href="/signup" className={styles.signup}>{isEditorial ? "Find my fit" : "Sign up"}</Link>
            </>
          )}
        </div>
      </div>
      {isDemoMode && loginState.isLoggedIn ? (
        <p className={styles.demoNotice} role="status">
          데모 모드 · 현재 표시되는 상품과 추천 결과는 예시 데이터입니다.
        </p>
      ) : null}
    </header>
  );
}
