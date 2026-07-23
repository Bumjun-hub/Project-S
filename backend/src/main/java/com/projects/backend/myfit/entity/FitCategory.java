package com.projects.backend.myfit.entity;

public enum FitCategory {
	TOP("\uC0C1\uC758"),
	BOTTOM("\uD558\uC758");

	private final String label;

	FitCategory(String label) {
		this.label = label;
	}

	public String getLabel() {
		return label;
	}

	public static FitCategory fromLabel(String label) {
		for (FitCategory category : values()) {
			if (category.label.equals(label)) {
				return category;
			}
		}

		try {
			return FitCategory.valueOf(label);
		} catch (IllegalArgumentException exception) {
			throw new IllegalArgumentException("Unknown fit category label: " + label, exception);
		}
	}
}
