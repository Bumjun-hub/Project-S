package com.projects.backend.bodyprofile.entity;

public enum BodyFeature {
	DEVELOPED_UPPER_BODY("상체가 발달한 편"),
	DEVELOPED_LOWER_BODY("하체가 발달한 편"),
	BROAD_SHOULDERS("어깨가 넓은 편"),
	NEEDS_THIGH_ROOM("허벅지 여유가 필요한 편"),
	CONCERNED_ABOUT_ABDOMEN("복부가 신경 쓰이는 편"),
	LONG_ARMS("팔이 긴 편"),
	LONG_LEGS("다리가 긴 편"),
	PREFERS_RELAXED_FIT("여유핏을 선호함");

	private final String label;

	BodyFeature(String label) {
		this.label = label;
	}

	public String getLabel() {
		return label;
	}

	public static BodyFeature fromLabel(String label) {
		for (BodyFeature bodyFeature : values()) {
			if (bodyFeature.label.equals(label)) {
				return bodyFeature;
			}
		}

		try {
			return BodyFeature.valueOf(label);
		} catch (IllegalArgumentException exception) {
			throw new IllegalArgumentException("Unknown body feature label: " + label, exception);
		}
	}
}
