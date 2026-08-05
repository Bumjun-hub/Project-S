"use client";

import { motion, useInView, useMotionValueEvent, useScroll } from "framer-motion";
import { ArrowRight, Check, GitCompareArrows, Ruler, ShieldCheck, Shirt, Sparkles, X } from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { type ReactNode, useEffect, useRef, useState } from "react";
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
  const howRef = useRef<HTMLElement>(null);
  const isHowInView = useInView(howRef, { amount: 0.45 });
  const [isHowVisible, setIsHowVisible] = useState(false);
  const [isReasonOpen, setIsReasonOpen] = useState(false);
  const scrollDirection = useRef<"up" | "down">("down");
  const { scrollY } = useScroll();

  useMotionValueEvent(scrollY, "change", (current) => {
    const previous = scrollY.getPrevious();
    if (previous !== undefined && current !== previous) scrollDirection.current = current > previous ? "down" : "up";
  });

  useEffect(() => {
    if (isHowInView) {
      setIsHowVisible(true);
    } else if (scrollDirection.current === "up") {
      setIsHowVisible(false);
    }
  }, [isHowInView]);

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
          <div className={styles.garment}>
            <Image src="/images/cloth1.jpg" alt="레귤러 옥스포드 셔츠" fill sizes="390px" priority />
            <span className={styles.productTag}>레귤러 옥스포드 셔츠</span>
            <b className={styles.sizeTag}>M 추천</b>
          </div>
          <div className={styles.fitFlow} aria-label="추천 과정">
            <span><Ruler size={13} /> 내 체형</span><i /><span><Shirt size={13} /> 상품 실측</span><i /><span><Sparkles size={13} /> M 추천</span>
          </div>
          <div className={styles.result}>
            <div className={styles.resultTop}>
              <span>추천 결과 미리보기</span>
              <b>예시 · 89% 일치</b>
            </div>
            <div className={styles.sizeRow}>
              <div><span>추천 사이즈</span><strong>M</strong></div>
              <p>편안한 정사이즈 핏</p>
            </div>
            <div className={styles.confidence} aria-label="예시 추천 일치도 89%"><i /></div>
            <ul className={styles.reasons}>
              <li><Check size={14} /> 어깨와 가슴 기준으로 잘 맞아요</li>
              <li><Check size={14} /> 체형 정보와 상품 실측을 비교했어요</li>
            </ul>
            <p className={styles.reasonSummary}><Check size={14} /> 내 체형과 상품 실측을 비교했어요</p>
            <button type="button" className={styles.reasonButton} onClick={() => setIsReasonOpen(true)}>
              추천 근거 보기 <ArrowRight size={14} />
            </button>
          </div>
        </motion.div>
      </section>
      {isReasonOpen ? (
        <div className={styles.reasonDialogBackdrop} role="presentation" onMouseDown={() => setIsReasonOpen(false)}>
          <section className={styles.reasonDialog} role="dialog" aria-modal="true" aria-labelledby="reason-dialog-title" onMouseDown={(event) => event.stopPropagation()}>
            <div className={styles.dialogHeader}>
              <div><p>FIT CONFIDENCE</p><h2 id="reason-dialog-title">M 사이즈를 추천한 이유</h2></div>
              <button type="button" aria-label="닫기" onClick={() => setIsReasonOpen(false)}><X size={18} /></button>
            </div>
            <div className={styles.measureList}>
              <div><span>어깨</span><b>잘 맞음</b><p>기준 옷과 가장 가까운 여유예요.</p></div>
              <div><span>가슴</span><b>적당한 여유</b><p>활동하기 편안한 핏을 기대할 수 있어요.</p></div>
              <div><span>총장</span><b>정사이즈</b><p>평소 입는 기장과 유사한 길이예요.</p></div>
            </div>
            <p className={styles.dialogNote}>예시 화면이며, 실제 결과에서는 입력한 체형과 상품 실측값을 바탕으로 표시됩니다.</p>
          </section>
        </div>
      ) : null}
      {afterHero}
      <motion.section
        ref={howRef}
        id="about"
        className={styles.how}
        initial={{ opacity: 0, y: 28 }}
        animate={isHowVisible ? { opacity: 1, y: 0 } : { opacity: 0, y: 28 }}
        transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
      >
        <div className={styles.sectionHeading}><p>HOW IT WORKS</p><h2>사이즈 선택, 더 이상 고민하지 마세요.</h2></div>
        <div className={styles.steps}>{steps.map((step, index) => { const Icon = step.icon; return <motion.article whileHover={{ y: -4 }} transition={{ duration: 0.25 }} key={step.title} className={styles.step}><span>0{index + 1}</span><Icon size={25} /><h3>{step.title}</h3><p>{step.text}</p></motion.article>; })}</div>
        <div className={styles.trustStrip} aria-label="Project S 추천 기준">
          <div><Ruler size={19} /><span><b>체형과 기준 옷 비교</b><small>내게 맞는 핏을 기준으로 분석</small></span></div>
          <div><GitCompareArrows size={19} /><span><b>브랜드별 실측 기준</b><small>표기 사이즈가 아닌 실제 치수 비교</small></span></div>
          <div><ShieldCheck size={19} /><span><b>추천 근거 제공</b><small>결과를 믿고 선택할 수 있게 안내</small></span></div>
        </div>
      </motion.section>
    </>
  );
}
