import { useFitReferenceStore } from "@/stores/fitReferenceStore";
import { useFlowBootstrapStore } from "@/stores/flowBootstrapStore";
import { useUserProfileStore } from "@/stores/userProfileStore";

/** Makes the complete product and recommendation flow available after demo login. */
export function initializeDemoFlow() {
  useFlowBootstrapStore.getState().acknowledgeIntro();
  useUserProfileStore.getState().setProfile({
    heightCm: 172,
    weightKg: 63,
    gender: "male",
    bodyShapeTags: ["PREFERS_RELAXED_FIT"],
  });
  useFitReferenceStore.getState().setMyFit({
    selectedCategory: "top",
    entries: {
      top: {
        garmentLabel: "데모 기준 셔츠",
        measurements: [
          { area: "총장", sizeCm: 72, feeling: "exact" },
          { area: "어깨너비", sizeCm: 49, feeling: "exact" },
          { area: "가슴단면", sizeCm: 57, feeling: "exact" },
          { area: "소매길이", sizeCm: 61, feeling: "exact" },
        ],
      },
      bottom: { garmentLabel: "", measurements: [] },
      etc: { garmentLabel: "", measurements: [] },
    },
  });
}
