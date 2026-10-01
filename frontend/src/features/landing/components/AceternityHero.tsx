"use client";

import { motion, useReducedMotion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useFlowBootstrapStore } from "@/stores/flowBootstrapStore";
import styles from "./AceternityHero.module.css";

const steps = [
  {
    title: "기준 옷 등록",
    text: "로그인 후 프로필을 저장하고, 평소 입는 옷의 실측과 착용감을 알려주세요.",
  },
  {
    title: "상품 선택",
    text: "상품의 표기 사이즈가 아닌 실제 치수를 비교합니다.",
  },
  {
    title: "추천 결과 확인",
    text: "추천 사이즈와 일치도, 선택 근거를 확인하세요.",
  },
];

export function AceternityHero() {
  const router = useRouter();
  const acknowledgeIntro = useFlowBootstrapStore((state) => state.acknowledgeIntro);
  const prefersReducedMotion = useReducedMotion();

  const startProfileStep = () => {
    acknowledgeIntro();
    router.push("/profile");
  };

  return (
    <div className={styles.landingIntro}>
      <section className={styles.hero} aria-labelledby="landing-title">
        <motion.div
          className={styles.copy}
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: prefersReducedMotion ? 0 : 0.7, ease: [0.22, 1, 0.36, 1] }}
        >
          <p className={styles.eyebrow}>REAL MEASUREMENTS. A BETTER FIT.</p>
          <h1 id="landing-title">
            라벨이 아닌,
            <br />
            나에게 맞는 사이즈.
          </h1>
          <p className={styles.lede}>
            기준 옷의 실측과 착용감을 상품 치수와 비교해
            <br />
            가장 잘 맞는 의류 사이즈를 추천합니다.
          </p>
          <div className={styles.heroActions}>
            <button className={styles.primaryCta} type="button" onClick={startProfileStep}>
              내 사이즈 찾기 <ArrowRight size={18} aria-hidden />
            </button>
            <a className={styles.secondaryCta} href="#how-it-works">
              추천 방식 보기
            </a>
          </div>
          <p className={styles.valueLine}>
            <span aria-hidden /> 기준 옷 실측. 상품 치수. 더 확신 있는 선택.
          </p>
        </motion.div>

        <motion.div
          className={styles.visual}
          initial={{ opacity: 0, scale: 0.96, x: 28 }}
          animate={{ opacity: 1, scale: 1, x: 0 }}
          transition={{
            duration: prefersReducedMotion ? 0 : 0.85,
            delay: prefersReducedMotion ? 0 : 0.08,
            ease: [0.22, 1, 0.36, 1],
          }}
        >
          <div className={styles.productStage}>
            <Image
              src="/images/cloth7.jpg"
              alt="BLOOK 블랙 티셔츠"
              fill
              sizes="(max-width: 820px) 100vw, 58vw"
              priority
            />
          </div>
          <p className={styles.editorialNote}>
            Same shirt.
            <br />A better fit.
          </p>
          <motion.aside
            className={styles.resultCard}
            aria-label="추천 결과 예시"
            initial={{ opacity: 0, y: 22 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{
              duration: prefersReducedMotion ? 0 : 0.6,
              delay: prefersReducedMotion ? 0 : 0.5,
            }}
          >
            <div className={styles.resultValues}>
              <div>
                <span>추천 사이즈</span>
                <strong>M</strong>
              </div>
              <div>
                <span>일치도</span>
                <b>92%</b>
              </div>
            </div>
            <div className={styles.scoreTrack} aria-label="예시 추천 일치도 92%">
              <motion.i
                initial={{ width: 0 }}
                whileInView={{ width: "92%" }}
                viewport={{ once: true }}
                transition={{
                  duration: prefersReducedMotion ? 0 : 0.9,
                  delay: prefersReducedMotion ? 0 : 0.65,
                  ease: [0.22, 1, 0.36, 1],
                }}
              />
            </div>
            <p>화면 구성 예시입니다. 실제 결과는 등록한 기준 옷과 상품 실측을 비교해 계산합니다.</p>
          </motion.aside>
        </motion.div>
      </section>

      <motion.section
        id="how-it-works"
        className={styles.how}
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.22 }}
        transition={{ duration: prefersReducedMotion ? 0 : 0.75, ease: [0.22, 1, 0.36, 1] }}
      >
        <div className={styles.howHeading}>
          <p>HOW IT WORKS</p>
          <h2>
            세 단계로 완성되는
            <br />
            나만의 핏.
          </h2>
        </div>
        <ol className={styles.steps}>
          {steps.map((step, index) => (
            <motion.li
              key={step.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.5 }}
              transition={{
                duration: prefersReducedMotion ? 0 : 0.55,
                delay: prefersReducedMotion ? 0 : index * 0.1,
              }}
            >
              <div className={styles.stepIndex}>
                <span>0{index + 1}</span>
                <i aria-hidden />
              </div>
              <h3>{step.title}</h3>
              <p>{step.text}</p>
            </motion.li>
          ))}
        </ol>
      </motion.section>
    </div>
  );
}
