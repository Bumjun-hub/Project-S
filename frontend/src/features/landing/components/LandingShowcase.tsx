"use client";

import { AnimatePresence, motion, useInView, useReducedMotion } from "framer-motion";
import { ArrowRight, BrainCircuit, GitCompareArrows, ShieldCheck, Sparkles, Timer } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { type FormEvent, type ReactNode, useMemo, useRef, useState } from "react";
import { Button } from "@/components/common/Button";
import { useAnalysisHistoryStore } from "@/features/history/store";
import { useProductsQuery } from "@/features/product/api/use-products-query";
import { getProductImageSrc } from "@/features/product/lib/product-image";
import styles from "./LandingShowcase.module.css";
import { useSessionIdentity } from "@/lib/auth-session";

const revealVariants = {
  hidden: { opacity: 0, y: 28 },
  visible: { opacity: 1, y: 0 },
};

type ScrollRevealSectionProps = {
  children: ReactNode;
  className?: string;
  id?: string;
  "aria-labelledby"?: string;
};

function ScrollRevealSection({ children, ...props }: ScrollRevealSectionProps) {
  const ref = useRef<HTMLElement>(null);
  // Long mobile sections may never occupy 45% of the viewport at once.
  const isInView = useInView(ref, { amount: 0.1, once: true });
  const reduceMotion = useReducedMotion();

  return (
    <motion.section
      ref={ref}
      {...props}
      initial={reduceMotion ? false : "hidden"}
      animate={reduceMotion || isInView ? "visible" : "hidden"}
      variants={revealVariants}
      transition={{ duration: reduceMotion ? 0 : 0.8, ease: [0.22, 1, 0.36, 1] }}
    >
      {children}
    </motion.section>
  );
}

const features = [
  { icon: BrainCircuit, title: "실측 기반 추천", text: "기준 옷의 부위별 실측과 착용감을 상품 사이즈표와 비교합니다." },
  { icon: GitCompareArrows, title: "부위별 차이 확인", text: "추천 사이즈와 내 목표 실측의 차이를 cm 단위로 확인합니다." },
  { icon: Timer, title: "빠른 추천", text: "복잡한 탐색 없이 몇 단계만으로 결과를 확인합니다." },
  { icon: ShieldCheck, title: "구매 실패 감소", text: "사이즈 선택의 불확실성을 줄여 더 나은 구매를 돕습니다." },
];

export function LandingShowcase() {
  const router = useRouter();
  const identity = useSessionIdentity();
  const { data, isPending, isError, refetch } = useProductsQuery();
  const products = data?.content ?? [];
  const storedResult = useAnalysisHistoryStore((state) => state.lastResult);
  const lastResult = identity ? storedResult : null;
  const [loading, setLoading] = useState(false);
  const [selectedProductId, setSelectedProductId] = useState("");

  const selectedProduct = useMemo(
    () => products.find((product) => product.id === selectedProductId),
    [products, selectedProductId],
  );

  const recommend = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!selectedProductId) return;

    setLoading(true);
    router.push(`/recommend/${selectedProductId}`);
  };

  return (
    <div className={styles.showcase}>
      <ScrollRevealSection className={styles.section} aria-labelledby="demo-title">
        <div className={styles.heading}>
          <p>RECOMMENDATION</p>
          <h2 id="demo-title">내 사이즈를 바로 확인해보세요.</h2>
          <span>기준 옷의 실측과 착용감을 상품 사이즈표와 비교합니다. 처음이라면 로그인 후 등록을 안내해 드려요.</span>
        </div>
        <div className={styles.demoCard}>
          <form className={styles.form} onSubmit={recommend}>
            <div className={styles.fieldGrid}>
              <label>
                <span>상품</span>
                <select
                  required
                  disabled={isPending || isError}
                  value={selectedProductId}
                  onChange={(event) => setSelectedProductId(event.target.value)}
                >
                  <option value="" disabled>
                    상품 선택
                  </option>
                  {products.map((product) => (
                    <option value={product.id} key={product.id}>
                      {product.brand} · {product.name}
                    </option>
                  ))}
                </select>
              </label>
            </div>
            {isPending ? <p role="status">상품을 불러오는 중이에요.</p> : null}
            {isError ? <p role="alert">상품을 불러오지 못했어요. <button type="button" onClick={() => void refetch()}>다시 시도</button></p> : null}
            {!isPending && !isError && products.length === 0 ? <p role="status">아직 등록된 상품이 없어요.</p> : null}
            <Button type="submit" className={styles.recommendButton} disabled={loading || isError || !selectedProductId}>
              {loading ? (
                <>
                  <span className={styles.spinner} /> 분석 중...
                </>
              ) : (
                <>
                  {selectedProduct ? `${selectedProduct.name} 분석하기` : "추천받기"} <Sparkles size={17} />
                </>
              )}
            </Button>
          </form>
          <div className={styles.demoResult} aria-live="polite">
            <AnimatePresence mode="wait">
              {loading ? (
                <motion.div
                  key="loading"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className={styles.resultEmpty}
                >
                  <span className={styles.resultPulse} />
                  <p>분석 페이지로 이동하고 있어요.</p>
                </motion.div>
              ) : null}
              {!loading && !lastResult ? (
                <motion.div key="empty" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className={styles.resultEmpty}>
                  <BrainCircuit size={30} />
                  <p>
                    아직 추천 기록이 없습니다.
                    <br />
                    첫 분석을 완료하면 여기에 최근 결과가 표시됩니다.
                  </p>
                </motion.div>
              ) : null}
              {!loading && lastResult ? (
                <motion.div
                  key="result"
                  initial={{ opacity: 0, scale: 0.96 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className={styles.resultContent}
                >
                  <span>LAST RECOMMENDED SIZE</span>
                  <strong>{lastResult.recommendedSize}</strong>
                  <div className={styles.confidence}>
                    <div>
                      <i style={{ width: `${lastResult.matchScore ?? 0}%` }} />
                    </div>
                    <b>{lastResult.matchScore ?? "-"}%</b>
                  </div>
                  <p>{`${lastResult.brand} · ${lastResult.productName}`}</p>
                </motion.div>
              ) : null}
            </AnimatePresence>
          </div>
        </div>
      </ScrollRevealSection>

      <ScrollRevealSection className={styles.section} aria-labelledby="popular-title">
        <div className={styles.headingRow}>
          <div className={styles.heading}>
            <p>EXPLORE PRODUCTS</p>
            <h2 id="popular-title">분석 가능한 상품</h2>
          </div>
          <Link href="/products" className={styles.viewAll}>
            전체 상품 보기 <ArrowRight size={17} />
          </Link>
        </div>
        <div className={styles.productGrid}>
          {products.slice(0, 4).map((product) => (
            <motion.article
              whileHover={{ y: -5 }}
              transition={{ duration: 0.25 }}
              className={styles.productCard}
              key={product.id}
            >
              <Link href={`/products/${product.id}`} className={styles.productImage}>
                <Image
                  src={getProductImageSrc(product.id)}
                  alt=""
                  fill
                  sizes="(max-width: 640px) 100vw, (max-width: 960px) 50vw, 25vw"
                />
              </Link>
              <div className={styles.productBody}>
                <p>{product.brand} · {product.category}</p>
                <h3>
                  <Link href={`/products/${product.id}`}>{product.name}</Link>
                </h3>
                <strong>{product.priceKrw.toLocaleString("ko-KR")}원</strong>
              </div>
            </motion.article>
          ))}
        </div>
      </ScrollRevealSection>

      <ScrollRevealSection id="about" className={styles.section} aria-labelledby="why-title">
        <div className={styles.heading}>
          <p>WHY PROJECT S</p>
          <h2 id="why-title">더 확신 있는 사이즈 선택</h2>
          <span>Project S는 구매 전 가장 어려운 결정을 실측 데이터로 더 단순하게 만듭니다.</span>
        </div>
        <div className={styles.featureGrid}>
          {features.map((feature) => {
            const Icon = feature.icon;
            return (
              <motion.article
                whileHover={{ y: -4 }}
                transition={{ duration: 0.25 }}
                className={styles.featureCard}
                key={feature.title}
              >
                <div><Icon size={23} /></div>
                <h3>{feature.title}</h3>
                <p>{feature.text}</p>
              </motion.article>
            );
          })}
        </div>
      </ScrollRevealSection>
    </div>
  );
}
