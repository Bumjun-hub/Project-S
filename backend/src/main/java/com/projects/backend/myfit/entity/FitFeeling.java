package com.projects.backend.myfit.entity;

public enum FitFeeling {
	SMALL("\uC791\uC558\uC74C"),
	EXACT("\uB531\uB9DE\uC74C"),
	LARGE("\uCEE4\uC74C");

	private final String label;

	FitFeeling(String label) {
		this.label = label;
	}

	public String getLabel() {
		return label;
	}

	public static FitFeeling fromLabel(String label) {
		for (FitFeeling feeling : values()) {
			if (feeling.label.equals(label)) {
				return feeling;
			}
		}

		try {
			return FitFeeling.valueOf(label);
		} catch (IllegalArgumentException exception) {
			throw new IllegalArgumentException("Unknown fit feeling label: " + label, exception);
		}
	}
}
