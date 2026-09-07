"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { isDemoMode } from "@/lib/demo-mode";
import styles from "./Header.module.css";

const navItems = [
  { href: "/products", label: "Products" },
  { href: "/result", label: "Recommendation" },
  { href: "/#about", label: "About" },
  { href: "/history", label: "Analysis History", requiresLogin: true },
];

const ACCESS_TOKEN_STORAGE_KEY = "project-s-access-token";
const MEMBER_EMAIL_STORAGE_KEY = "project-s-member-email";
const MEMBER_NICKNAME_STORAGE_KEY = "project-s-member-nickname";
const AUTH_CHANGED_EVENT = "project-s-auth-changed";

type LoginState = {
  isLoggedIn: boolean;
  displayName: string;
};

function readLoginState(): LoginState {
  if (typeof window === "undefined") return { isLoggedIn: false, displayName: "" };

  const accessToken = window.localStorage.getItem(ACCESS_TOKEN_STORAGE_KEY);
  const nickname = window.localStorage.getItem(MEMBER_NICKNAME_STORAGE_KEY);
  const email = window.localStorage.getItem(MEMBER_EMAIL_STORAGE_KEY);

  return {
    isLoggedIn: Boolean(accessToken),
    displayName: nickname || email || "",
  };
}

export function Header() {
  const pathname = usePathname();
  const [loginState, setLoginState] = useState<LoginState>({ isLoggedIn: false, displayName: "" });
  const isActive = (href: string) => href !== "/#about" && (pathname === href || pathname.startsWith(`${href}/`));

  useEffect(() => {
    const syncLoginState = () => setLoginState(readLoginState());

    syncLoginState();
    window.addEventListener("storage", syncLoginState);
    window.addEventListener(AUTH_CHANGED_EVENT, syncLoginState);

    return () => {
      window.removeEventListener("storage", syncLoginState);
      window.removeEventListener(AUTH_CHANGED_EVENT, syncLoginState);
    };
  }, [pathname]);

  const handleLogout = () => {
    window.localStorage.removeItem(ACCESS_TOKEN_STORAGE_KEY);
    window.localStorage.removeItem(MEMBER_EMAIL_STORAGE_KEY);
    window.localStorage.removeItem(MEMBER_NICKNAME_STORAGE_KEY);
    window.dispatchEvent(new Event(AUTH_CHANGED_EVENT));
  };

  return (
    <header className={styles.header}>
      <div className={styles.inner}>
        <Link href="/" className={styles.logo} aria-label="Project S 홈">Project S</Link>
        <nav className={styles.nav} aria-label="주요 메뉴">
          {navItems
            .filter((item) => !item.requiresLogin || loginState.isLoggedIn)
            .map((item) => (
              <Link key={item.href} href={item.href} className={isActive(item.href) ? styles.active : undefined}>
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
              <Link href="/login" className={styles.login}>Login</Link>
              <Link href="/signup" className={styles.signup}>Sign up</Link>
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
