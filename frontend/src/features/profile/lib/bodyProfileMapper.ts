import type {
  BodyFeature,
  BodyProfileCreateRequest,
  BodyProfileGender,
  BodyProfileResponse,
  UserProfileState,
} from "@/features/profile/types";

export const BODY_FEATURE_LABELS: Record<BodyFeature, string> = {
  DEVELOPED_UPPER_BODY: "상체가 발달한 편",
  DEVELOPED_LOWER_BODY: "하체가 발달한 편",
  BROAD_SHOULDERS: "어깨가 넓은 편",
  NEEDS_THIGH_ROOM: "허벅지 여유가 필요한 편",
  CONCERNED_ABOUT_ABDOMEN: "복부가 신경 쓰이는 편",
  LONG_ARMS: "팔이 긴 편",
  LONG_LEGS: "다리가 긴 편",
  PREFERS_RELAXED_FIT: "여유핏을 선호함",
} as const;

const BODY_FEATURES_BY_LABEL = new Map<string, BodyFeature>(
  Object.entries(BODY_FEATURE_LABELS).map(([feature, label]) => [
    label,
    feature as BodyFeature,
  ]),
);

export function bodyShapeTagsToBodyFeatures(tags: string[]): BodyFeature[] {
  const seen = new Set<BodyFeature>();
  const features: BodyFeature[] = [];

  for (const tag of tags) {
    const feature = BODY_FEATURES_BY_LABEL.get(tag);
    if (!feature || seen.has(feature)) continue;

    seen.add(feature);
    features.push(feature);
  }

  return features;
}

export function bodyFeaturesToBodyShapeTags(features: BodyFeature[]): string[] {
  const seen = new Set<BodyFeature>();
  const tags: string[] = [];

  for (const feature of features) {
    if (seen.has(feature)) continue;

    seen.add(feature);
    tags.push(BODY_FEATURE_LABELS[feature]);
  }

  return tags;
}

export function toBodyProfileGender(
  gender: UserProfileState["gender"],
): BodyProfileGender | null {
  if (gender === "male") return "MALE";
  if (gender === "female") return "FEMALE";
  return null;
}

export function toLocalGender(
  gender: BodyProfileGender,
): UserProfileState["gender"] {
  if (gender === "MALE") return "male";
  return "female";
}

export function toBodyProfileCreateRequest(
  profile: UserProfileState,
): BodyProfileCreateRequest | null {
  const gender = toBodyProfileGender(profile.gender);

  if (profile.heightCm == null || profile.weightKg == null || gender == null) {
    return null;
  }

  return {
    height: profile.heightCm,
    weight: profile.weightKg,
    gender,
    bodyFeatures: bodyShapeTagsToBodyFeatures(profile.bodyShapeTags),
  };
}

export function toLocalUserProfile(
  response: BodyProfileResponse,
): UserProfileState {
  return {
    heightCm: response.height,
    weightKg: response.weight,
    gender: toLocalGender(response.gender),
    bodyShapeTags: bodyFeaturesToBodyShapeTags(response.bodyFeatures),
  };
}
