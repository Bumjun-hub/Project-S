import styles from "./Footer.module.css";

export function Footer() {
  return <footer className={styles.footer}><div className={styles.inner}><strong>Project S</strong><div className={styles.links}><a href="https://github.com" target="_blank" rel="noreferrer">GitHub</a><a href="/#about">Portfolio</a></div><small>© {new Date().getFullYear()} Project S</small></div></footer>;
}
