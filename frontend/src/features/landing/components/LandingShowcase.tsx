"use client";

import { AnimatePresence, motion } from "framer-motion";
import { ArrowRight, BrainCircuit, GitCompareArrows, ShieldCheck, Sparkles, Timer } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { type FormEvent, useState } from "react";
import { Button } from "@/components/common/Button";
import { Input } from "@/components/common/Input";
import { MOCK_PRODUCTS } from "@/mocks/products.mock";
import styles from "./LandingShowcase.module.css";

const reveal = { initial: { opacity: 0, y: 22 }, whileInView: { opacity: 1, y: 0 }, viewport: { once: true, amount: 0.18 }, transition: { duration: 0.45 } };
const features = [
  { icon: BrainCircuit, title: "AI 추천", text: "입력한 체형과 상품 실측을 함께 분석합니다." },
  { icon: GitCompareArrows, title: "브랜드별 사이즈 비교", text: "서로 다른 브랜드의 사이즈 기준을 한눈에 비교합니다." },
  { icon: Timer, title: "빠른 추천", text: "복잡한 탐색 없이 몇 단계만으로 결과를 확인합니다." },
  { icon: ShieldCheck, title: "구매 실패 감소", text: "사이즈 선택의 불확실성을 줄여 더 나은 구매를 돕습니다." },
];

export function LandingShowcase() {
  const [loading, setLoading] = useState(false);
  const [showResult, setShowResult] = useState(false);

  const recommend = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setLoading(true);
    setShowResult(false);
    window.setTimeout(() => { setLoading(false); setShowResult(true); }, 900);
  };

  return (
    <div className={styles.showcase}>
      <motion.section {...reveal} className={styles.section} aria-labelledby="demo-title">
        <div className={styles.heading}><p>RECOMMENDATION DEMO</p><h2 id="demo-title">내 사이즈를 미리 확인해보세요.</h2><span>간단한 정보를 입력하면 추천 결과를 체험할 수 있습니다.</span></div>
        <div className={styles.demoCard}>
          <form className={styles.form} onSubmit={recommend}>
            <div className={styles.fieldGrid}>
              <label><span>키</span><Input type="number" min={120} max={220} placeholder="172 cm" required /></label>
              <label><span>몸무게</span><Input type="number" min={30} max={200} placeholder="63 kg" required /></label>
              <label><span>체형</span><select required defaultValue=""><option value="" disabled>체형 선택</option><option>슬림</option><option>보통</option><option>탄탄</option></select></label>
              <label><span>상품</span><select required defaultValue=""><option value="" disabled>상품 선택</option>{MOCK_PRODUCTS.map((product) => <option value={product.id} key={product.id}>{product.brand} · {product.name}</option>)}</select></label>
            </div>
            <Button type="submit" className={styles.recommendButton} disabled={loading}>{loading ? <><span className={styles.spinner} /> 분석 중...</> : <>추천받기 <Sparkles size={17} /></>}</Button>
          </form>
          <div className={styles.demoResult} aria-live="polite">
            <AnimatePresence mode="wait">
              {loading && <motion.div key="loading" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className={styles.resultEmpty}><span className={styles.resultPulse} /><p>체형과 상품 실측을 비교하고 있어요.</p></motion.div>}
              {!loading && !showResult && <motion.div key="empty" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className={styles.resultEmpty}><BrainCircuit size={30} /><p>정보를 입력하고<br />AI 추천을 받아보세요.</p></motion.div>}
              {showResult && <motion.div key="result" initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }} className={styles.resultContent}><span>RECOMMENDED SIZE</span><strong>M</strong><div className={styles.confidence}><div><i /></div><b>89%</b></div><p>AI confidence</p></motion.div>}
            </AnimatePresence>
          </div>
        </div>
      </motion.section>

      <motion.section {...reveal} className={styles.section} aria-labelledby="popular-title">
        <div className={styles.headingRow}><div className={styles.heading}><p>POPULAR PRODUCTS</p><h2 id="popular-title">많이 찾는 상품</h2></div><Link href="/products" className={styles.viewAll}>전체 상품 보기 <ArrowRight size={17} /></Link></div>
        <div className={styles.productGrid}>{MOCK_PRODUCTS.slice(0, 4).map((product, index) => <motion.article whileHover={{ y: -5 }} transition={{ duration: 0.25 }} className={styles.productCard} key={product.id}><Link href={`/products/${product.id}`} className={styles.productImage}><Image src={`/images/cloth${index + 1}.jpg`} alt="" fill sizes="(max-width: 640px) 100vw, (max-width: 960px) 50vw, 25vw" /></Link><div className={styles.productBody}><p>{product.brand} · {product.category}</p><h3><Link href={`/products/${product.id}`}>{product.name}</Link></h3><strong>{product.priceKrw.toLocaleString("ko-KR")}원</strong></div></motion.article>)}</div>
      </motion.section>

      <motion.section {...reveal} className={styles.section} aria-labelledby="why-title">
        <div className={styles.heading}><p>WHY PROJECT S</p><h2 id="why-title">더 확신 있는 사이즈 선택</h2><span>Project S는 구매 전 가장 어려운 결정을 더 단순하게 만듭니다.</span></div>
        <div className={styles.featureGrid}>{features.map((feature) => { const Icon = feature.icon; return <motion.article whileHover={{ y: -4 }} transition={{ duration: 0.25 }} className={styles.featureCard} key={feature.title}><div><Icon size={23} /></div><h3>{feature.title}</h3><p>{feature.text}</p></motion.article>; })}</div>
      </motion.section>
    </div>
  );
}
