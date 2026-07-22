import { SignupForm } from "@/components/auth/SignupForm";
import styles from "./page.module.css";

export default function SignupPage() {
  return <main className={styles.container}><section className={`glass-panel-dark ${styles.card}`}><div className={styles.content}><h1 className={styles.title}>회원가입</h1><p className={styles.description}>Project S와 함께 나에게 맞는 스타일을 찾아보세요.</p><SignupForm /></div></section></main>;
}
