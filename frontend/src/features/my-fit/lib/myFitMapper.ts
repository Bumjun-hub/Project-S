import type {
  FitCategory,
  FitFeeling,
  FitMeasurement,
  MyFitApiCategory,
  MyFitApiFeeling,
  MyFitCreateRequest,
  MyFitEntryRequest,
  MyFitMeasurementArea,
  MyFitResponse,
  MyFitState,
  MyFitUpdateRequest,
} from "@/features/my-fit/types";

const SUPPORTED_CATEGORIES = ["top", "bottom"] as const;

const CATEGORY_TO_API: Record<(typeof SUPPORTED_CATEGORIES)[number], MyFitApiCategory> = {
  top: "TOP",
  bottom: "BOTTOM",
};

const CATEGORY_TO_LOCAL: Record<MyFitApiCategory, (typeof SUPPORTED_CATEGORIES)[number]> = {
  TOP: "top",
  BOTTOM: "bottom",
};

const FEELING_TO_API: Record<FitFeeling, MyFitApiFeeling> = {
  small: "SMALL",
  exact: "EXACT",
  large: "LARGE",
};

const FEELING_TO_LOCAL: Record<MyFitApiFeeling, FitFeeling> = {
  SMALL: "small",
  EXACT: "exact",
  LARGE: "large",
};

const AREA_TO_API: Record<string, MyFitMeasurementArea> = {
  "총장": "TOTAL_LENGTH",
  "어깨너비": "SHOULDER_WIDTH",
  "가슴단면": "CHEST_WIDTH",
  "소매길이": "SLEEVE_LENGTH",
  "허리단면": "WAIST_WIDTH",
  "엉덩이 단면": "HIP_WIDTH",
  "허벅지 단면": "THIGH_WIDTH",
  "밑위": "RISE",
  "밑단단면": "HEM_WIDTH",
};

const AREA_TO_LOCAL: Record<MyFitMeasurementArea, string> = {
  TOTAL_LENGTH: "총장",
  SHOULDER_WIDTH: "어깨너비",
  CHEST_WIDTH: "가슴단면",
  SLEEVE_LENGTH: "소매길이",
  WAIST_WIDTH: "허리단면",
  HIP_WIDTH: "엉덩이 단면",
  THIGH_WIDTH: "허벅지 단면",
  RISE: "밑위",
  HEM_WIDTH: "밑단단면",
};

function emptyEntry() {
  return {
    garmentLabel: "",
    measurements: [],
  };
}

function toEntryRequest(
  category: (typeof SUPPORTED_CATEGORIES)[number],
  myFit: MyFitState,
): MyFitEntryRequest | null {
  const entry = myFit.entries[category];
  const garmentLabel = entry.garmentLabel.trim();
  if (garmentLabel === "") return null;

  const measurements = entry.measurements
    .filter((measurement): measurement is FitMeasurement & {
      sizeCm: number;
      feeling: FitFeeling;
    } => (
      measurement.sizeCm != null &&
      !Number.isNaN(measurement.sizeCm) &&
      measurement.feeling != null &&
      AREA_TO_API[measurement.area] != null
    ))
    .map((measurement) => ({
      area: AREA_TO_API[measurement.area],
      sizeCm: measurement.sizeCm,
      feeling: FEELING_TO_API[measurement.feeling],
    }));

  if (measurements.length === 0) return null;

  return {
    category: CATEGORY_TO_API[category],
    garmentLabel,
    measurements,
  };
}

export function toMyFitCreateRequest(myFit: MyFitState): MyFitCreateRequest | null {
  const entries = SUPPORTED_CATEGORIES
    .map((category) => toEntryRequest(category, myFit))
    .filter((entry): entry is MyFitEntryRequest => entry != null);

  return entries.length > 0 ? { entries } : null;
}

export function toMyFitUpdateRequest(myFit: MyFitState): MyFitUpdateRequest | null {
  const createRequest = toMyFitCreateRequest(myFit);
  return createRequest ? { entries: createRequest.entries } : null;
}

export function toLocalMyFit(response: MyFitResponse): MyFitState {
  const entries: MyFitState["entries"] = {
    top: emptyEntry(),
    bottom: emptyEntry(),
    etc: emptyEntry(),
  };

  for (const entry of response.entries) {
    const localCategory = CATEGORY_TO_LOCAL[entry.category];
    entries[localCategory] = {
      garmentLabel: entry.garmentLabel,
      measurements: entry.measurements.map((measurement) => ({
        area: AREA_TO_LOCAL[measurement.area],
        sizeCm: measurement.sizeCm,
        feeling: FEELING_TO_LOCAL[measurement.feeling],
      })),
    };
  }

  const selectedCategory: FitCategory =
    entries.top.measurements.length > 0
      ? "top"
      : entries.bottom.measurements.length > 0
        ? "bottom"
        : "top";

  return {
    selectedCategory,
    entries,
  };
}
