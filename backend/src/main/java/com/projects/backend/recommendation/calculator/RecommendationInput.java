package com.projects.backend.recommendation.calculator;

import java.math.BigDecimal;
import java.util.List;

import com.projects.backend.myfit.entity.FitFeeling;
import com.projects.backend.myfit.entity.MeasurementArea;

public record RecommendationInput(
	List<MyFitMeasurementInput> myFitMeasurements,
	List<ProductSizeInput> productSizes
) {

	public RecommendationInput {
		myFitMeasurements = List.copyOf(myFitMeasurements);
		productSizes = List.copyOf(productSizes);
	}

	public record MyFitMeasurementInput(
		MeasurementArea area,
		BigDecimal sizeCm,
		FitFeeling feeling
	) {
	}

	public record ProductSizeInput(
		String label,
		int displayOrder,
		List<ProductMeasurementInput> measurements
	) {

		public ProductSizeInput {
			measurements = List.copyOf(measurements);
		}
	}

	public record ProductMeasurementInput(
		MeasurementArea area,
		BigDecimal sizeCm
	) {
	}
}
