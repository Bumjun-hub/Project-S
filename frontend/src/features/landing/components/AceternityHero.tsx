"use client";

import { motion } from "framer-motion";
import { ArrowRight, Check, Ruler, Shirt, Sparkles } from "lucide-react";
import { useRouter } from "next/navigation";
import type { ReactNode } from "react";
import { useFlowBootstrapStore } from "@/stores/flowBootstrapStore";
import styles from "./AceternityHero.module.css";

const steps = [
  { icon: Ruler, title: "체형 입력", text: "나의 실측 정보를 입력합니다." },
  { icon: Shirt, title: "상품 선택", text: "마음에 드는 옷을 고릅니다." },
  { icon: Sparkles, title: "실측 추천", text: "가장 알맞은 사이즈를 확인합니다." },
];

type AceternityHeroProps = { afterHero?: ReactNode };

export function AceternityHero({ afterHero }: AceternityHeroProps) {
  const router = useRouter();
  const acknowledgeIntro = useFlowBootstrapStore((state) => state.acknowledgeIntro);

  const startProfileStep = () => {
    acknowledgeIntro();
    router.push("/profile");
  };

  return (
    <>
      <section className={styles.hero}>
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.45 }} className={styles.copy}>
          <p className={styles.eyebrow}>FIT RECOMMENDER</p>
          <h1>Find Your<br /><span>Perfect Fit.</span></h1>
          <p className={styles.lede}>체형과 기준 옷을 입력하면 상품별 실측을 비교해<br />가장 적합한 의류 사이즈를 추천합니다.</p>
          <button className={styles.cta} onClick={startProfileStep}>지금 시작하기 <ArrowRight size={18} /></button>
          <p className={styles.note}><Check size={15} /> 내 체형에 맞춘 개인화 추천</p>
        </motion.div>
        <motion.div initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.5, delay: 0.1 }} className={styles.preview} aria-label="추천 사이즈 미리보기">
          <div className={styles.previewHeader}><span>Project S</span><span>Fit result</span></div>
          <div className={styles.garment}><Shirt size={100} strokeWidth={1.25} /></div>
          <div className={styles.result}><span>Recommended size</span><strong>M</strong><div><i /><i /><i /><i /></div><small>89% match score</small></div>
        </motion.div>
      </section>
      {afterHero}
      <section id="about" className={styles.how}>
        <div className={styles.sectionHeading}><p>HOW IT WORKS</p><h2>사이즈 선택, 더 이상 고민하지 마세요.</h2></div>
        <div className={styles.steps}>{steps.map((step, index) => { const Icon = step.icon; return <motion.article whileHover={{ y: -4 }} transition={{ duration: 0.25 }} key={step.title} className={styles.step}><span>0{index + 1}</span><Icon size={25} /><h3>{step.title}</h3><p>{step.text}</p></motion.article>; })}</div>
      </section>
    </>
  );
}
