// 이 파일은 상품 상세 화면과 추천 시작 동선을 정의합니다.
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { FlowStepCaption } from "@/components/common/FlowStepCaption";
import { PageContainer } from "@/components/layout/PageContainer";
import { fetchProductById } from "@/features/product/api/products-api";
import { getProductImageSrc } from "@/features/product/lib/product-image";
import type { ProductMeasurementArea } from "@/features/product/types";
import styles from "./ProductDetailScreen.module.css";

const AREA_ORDER: ProductMeasurementArea[] = [
  "TOTAL_LENGTH",
  "SHOULDER_WIDTH",
  "CHEST_WIDTH",
  "SLEEVE_LENGTH",
  "WAIST_WIDTH",
  "HIP_WIDTH",
  "THIGH_WIDTH",
  "RISE",
  "HEM_WIDTH",
];

export default async function ProductDetailScreen({ productId }: { productId: string }) {
  const product = await fetchProductById(productId);
  if (!product) notFound();

  const areas = AREA_ORDER
    .map((area) => product.sizes.flatMap((size) => size.measurements).find((m) => m.area === area))
    .filter((measurement): measurement is NonNullable<typeof measurement> => Boolean(measurement));

  return (
    <PageContainer maxWidth={960}>
      <FlowStepCaption step={5} label="상품 상세" />
      <div className={styles.page}>
        <section className={styles.hero} aria-label="상품 요약">
          <div className={styles.heroVisual}>
            <Image
              src={getProductImageSrc(product.id)}
              alt={product.name}
              fill
              className={styles.productImage}
              sizes="(max-width: 768px) 100vw, 300px"
              priority
            />
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
            실측 사이즈표
          </h2>
          <p className={styles.axisNote}>
            <strong>cm 기준</strong> — 기준 옷 실측과 같은 부위 단위로 비교할 수 있습니다.
          </p>
          <div className={styles.tableWrap}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th scope="col">라벨</th>
                  {areas.map((measurement) => (
                    <th scope="col" key={measurement.area}>
                      {measurement.areaLabel}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {product.sizes.map((size) => (
                  <tr key={size.id}>
                    <td>{size.label}</td>
                    {areas.map((area) => {
                      const measurement = size.measurements.find((m) => m.area === area.area);
                      return <td key={area.area}>{measurement ? measurement.sizeCm : "-"}</td>;
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        <section className={styles.aiSection} aria-labelledby="ai-points-heading">
          <h2 id="ai-points-heading" className={styles.aiTitle}>
            실측 비교 포인트
          </h2>
          <ul className={styles.aiList}>
            <li>이 상품은 입력한 프로필과 기준 옷 실측을 기반으로 분석됩니다.</li>
            <li>브랜드 실측 사이즈표와 기준 옷 착용감을 비교합니다.</li>
            <li>분석 결과는 실측 비교 리포트로 저장됩니다.</li>
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
