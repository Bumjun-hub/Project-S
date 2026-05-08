// 이 파일은 서비스 진입 랜딩 화면을 정의합니다.
import { AceternityHero } from "@/features/landing/components/AceternityHero";
import { LandingTimelineDetails } from "@/features/landing/components/LandingTimelineDetails";

/** backdrop-filter 미사용: 움직이는 Grid 아래에서는 블러 재합성 비용이 매우 큼 */
const unifiedFlatBandStyle = {
  width: "100%",
  background: "rgba(12, 12, 18, 0.42)",
};

/** Sticky 헤더( pill + 상단 여백) 만큼 밴드를 위로 끌어올려, 맨 위·헤더 뒤 영역까지 동일 배경이 보이게 함 */
const landingIntroBandBleedAboveHeader = {
  marginTop: "calc(-1 * (clamp(4.1rem, 10vw, 5.4rem)))",
  paddingTop: "calc(env(safe-area-inset-top, 0px) + clamp(4.1rem, 10vw, 5.4rem) + 0.75rem)",
};

export default function LandingScreen() {
  return (
    <main style={{ position: "relative" }}>
      <div style={{ ...unifiedFlatBandStyle, ...landingIntroBandBleedAboveHeader }}>
        <AceternityHero />
      </div>

      <div style={unifiedFlatBandStyle}>
        <LandingTimelineDetails />
      </div>
    </main>
  );
}
