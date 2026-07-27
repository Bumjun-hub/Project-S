package com.projects.backend.product.dto;

import java.util.Comparator;
import java.util.List;

import com.projects.backend.product.entity.ProductMeasurement;
import com.projects.backend.product.entity.ProductSize;

public record ProductSizeResponse(
	Long id,
	String label,
	int displayOrder,
	List<ProductMeasurementResponse> measurements
) {

	public static ProductSizeResponse from(ProductSize size) {
		return new ProductSizeResponse(
			size.getId(),
			size.getLabel(),
			size.getDisplayOrder(),
			size.getMeasurements().stream()
				.sorted(Comparator.comparing(ProductMeasurement::getArea))
				.map(ProductMeasurementResponse::from)
				.toList()
		);
	}
}
