import styles from "./page.module.css";

export default function LoginPage() {
  return <main className={styles.container}><section className={`glass-panel-dark ${styles.card}`}><div className={styles.content}><h1 className={styles.title}>로그인</h1><p className={styles.description}>로그인 기능은 현재 준비하고 있습니다.</p><p className={styles.notice}>회원가입은 지금 이용하실 수 있습니다.</p></div></section></main>;
}
