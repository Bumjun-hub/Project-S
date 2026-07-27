package com.projects.backend.product.entity;

public enum ProductCategory {
	TOP("\uC0C1\uC758"),
	BOTTOM("\uD558\uC758"),
	OUTER("\uC544\uC6B0\uD130");

	private final String label;

	ProductCategory(String label) {
		this.label = label;
	}

	public String getLabel() {
		return label;
	}

	public static ProductCategory fromLabel(String label) {
		for (ProductCategory category : values()) {
			if (category.label.equals(label)) {
				return category;
			}
		}

		try {
			return ProductCategory.valueOf(label);
		} catch (IllegalArgumentException exception) {
			throw new IllegalArgumentException("Unknown product category label: " + label, exception);
		}
	}
}
