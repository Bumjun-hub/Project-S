// 이 파일은 플로우 화면(프로필·기준 옷·결과 등) 하단 이동 링크 묶음을 정의합니다.
import Link from "next/link";
import styles from "./FlowFooterNav.module.css";

export type FlowFooterLink = {
  href: string;
  label: string;
  /** 강조 CTA 스타일(예: 다시 분석) */
  variant?: "default" | "primary";
};

type FlowFooterNavProps = {
  items: FlowFooterLink[];
  "aria-label"?: string;
  /** `nav` 루트에 합쳐지는 추가 클래스(예: 빈 상태 안 여백 조정) */
  className?: string;
};

export function FlowFooterNav({
  items,
  "aria-label": ariaLabel = "페이지 이동",
  className,
}: FlowFooterNavProps) {
  return (
    <nav className={[styles.nav, className].filter(Boolean).join(" ")} aria-label={ariaLabel}>
      <ul className={styles.list}>
        {items.map((item) => (
          <li key={`${item.href}-${item.label}`} className={styles.item}>
            <Link
              href={item.href}
              className={item.variant === "primary" ? styles.linkPrimary : styles.link}
            >
              {item.label}
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
}
