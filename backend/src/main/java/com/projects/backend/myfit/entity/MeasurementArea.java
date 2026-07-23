package com.projects.backend.myfit.entity;

public enum MeasurementArea {
	TOTAL_LENGTH("\uCD1D\uC7A5"),
	SHOULDER_WIDTH("\uC5B4\uAE68\uB108\uBE44"),
	CHEST_WIDTH("\uAC00\uC2B4\uB2E8\uBA74"),
	SLEEVE_LENGTH("\uC18C\uB9E4\uAE38\uC774"),
	WAIST_WIDTH("\uD5C8\uB9AC\uB2E8\uBA74"),
	HIP_WIDTH("\uC5C9\uB369\uC774 \uB2E8\uBA74"),
	THIGH_WIDTH("\uD5C8\uBC85\uC9C0 \uB2E8\uBA74"),
	RISE("\uBC11\uC704"),
	HEM_WIDTH("\uBC11\uB2E8\uB2E8\uBA74");

	private final String label;

	MeasurementArea(String label) {
		this.label = label;
	}

	public String getLabel() {
		return label;
	}

	public static MeasurementArea fromLabel(String label) {
		for (MeasurementArea area : values()) {
			if (area.label.equals(label)) {
				return area;
			}
		}

		try {
			return MeasurementArea.valueOf(label);
		} catch (IllegalArgumentException exception) {
			throw new IllegalArgumentException("Unknown measurement area label: " + label, exception);
		}
	}
}
