"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import styles from "./Header.module.css";

const navItems = [
  { href: "/products", label: "Products" },
  { href: "/result", label: "Recommendation" },
  { href: "/#about", label: "About" },
];

export function Header() {
  const pathname = usePathname();
  const isActive = (href: string) => href !== "/#about" && (pathname === href || pathname.startsWith(`${href}/`));

  return (
    <header className={styles.header}>
      <div className={styles.inner}>
        <Link href="/" className={styles.logo} aria-label="Project S 홈">Project S</Link>
        <nav className={styles.nav} aria-label="주요 메뉴">
          {navItems.map((item) => <Link key={item.href} href={item.href} className={isActive(item.href) ? styles.active : undefined}>{item.label}</Link>)}
        </nav>
        <div className={styles.actions}>
          <Link href="/login" className={styles.login}>Login</Link>
          <Link href="/signup" className={styles.signup}>Sign up</Link>
        </div>
      </div>
    </header>
  );
}
