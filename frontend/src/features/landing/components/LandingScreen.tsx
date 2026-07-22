import { AceternityHero } from "@/features/landing/components/AceternityHero";
import { LandingShowcase } from "@/features/landing/components/LandingShowcase";

export default function LandingScreen() {
  return <main><AceternityHero afterHero={<LandingShowcase />} /></main>;
}
