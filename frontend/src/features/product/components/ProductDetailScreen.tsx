// 이 파일은 상품 상세 화면과 추천 시작 동선을 정의합니다.
import Link from "next/link";
import { notFound } from "next/navigation";
import { FlowStepCaption } from "@/components/common/FlowStepCaption";
import { PageContainer } from "@/components/layout/PageContainer";
import { getMockProduct } from "@/mocks/products.mock";
import styles from "./ProductDetailScreen.module.css";

export default function ProductDetailScreen({ productId }: { productId: string }) {
  const product = getMockProduct(productId);
  if (!product) notFound();

  const isChest = product.chartAxis === "chest";
  const axisTitle = isChest ? "가슴 기준" : "허리 기준";
  const axisDescription = isChest
    ? "이 표는 가슴 둘레(cm)를 축으로 한 사이즈 구간입니다."
    : "이 표는 허리 둘레(cm)를 축으로 한 사이즈 구간입니다.";

  return (
    <PageContainer maxWidth={960}>
      <FlowStepCaption step={5} label="상품 상세" />
      <div className={styles.page}>
        <section className={styles.hero} aria-label="상품 요약">
          <div className={styles.heroVisual}>
            <div className={styles.imagePlaceholder} aria-hidden>
              <span className={styles.imageTag}>Product</span>
            </div>
          </div>
          <div className={styles.heroContent}>
            <div className={styles.badgeRow}>
              <span className={styles.badge}>{product.brand}</span>
              <span className={styles.badge}>{product.category}</span>
            </div>
            <h1 className={styles.title}>{product.name}</h1>
            <p className={styles.price}>{product.priceKrw.toLocaleString("ko-KR")}원</p>
            <p className={styles.description}>{product.description}</p>
            <Link href={`/recommend/${product.id}`} className={styles.ctaPrimary}>
              내 체형으로 분석하기
            </Link>
          </div>
        </section>

        <section className={styles.section} aria-labelledby="size-chart-heading">
          <p className={styles.sectionTitle}>SIZE CHART</p>
          <h2 id="size-chart-heading" className={styles.sectionHeading}>
            사이즈표 (mock)
          </h2>
          <p className={styles.axisNote}>
            <strong>{axisTitle}</strong> — {axisDescription}
          </p>
          <div className={styles.tableWrap}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th scope="col">라벨</th>
                  <th scope="col">최소 (cm)</th>
                  <th scope="col">최대 (cm)</th>
                </tr>
              </thead>
              <tbody>
                {product.sizeChart.map((row) => (
                  <tr key={row.label}>
                    <td>{row.label}</td>
                    <td>{row.min}</td>
                    <td>{row.max}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        <section className={styles.aiSection} aria-labelledby="ai-points-heading">
          <h2 id="ai-points-heading" className={styles.aiTitle}>
            AI 분석 포인트
          </h2>
          <ul className={styles.aiList}>
            <li>이 상품은 입력한 프로필과 기준 옷 실측을 기반으로 분석됩니다.</li>
            <li>브랜드 사이즈표와 기준 옷 착용감을 비교합니다.</li>
            <li>분석 결과는 mock AI 리포트로 저장됩니다.</li>
          </ul>
        </section>

        <p className={styles.footer}>
          <Link href="/products" className={styles.backLink}>
            ← 상품 목록으로 돌아가기
          </Link>
        </p>
      </div>
    </PageContainer>
  );
}
