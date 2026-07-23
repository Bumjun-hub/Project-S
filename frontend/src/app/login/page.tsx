import { LoginForm } from "@/components/auth/LoginForm";
import styles from "./page.module.css";

export default function LoginPage() {
  return (
    <main className={styles.container}>
      <section className={`glass-panel-dark ${styles.card}`}>
        <div className={styles.content}>
          <h1 className={styles.title}>로그인</h1>
          <p className={styles.description}>Project S 계정으로 로그인하세요.</p>
          <LoginForm />
        </div>
      </section>
    </main>
  );
}
