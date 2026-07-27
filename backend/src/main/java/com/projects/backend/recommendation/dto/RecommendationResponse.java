package com.projects.backend.recommendation.dto;

import java.math.BigDecimal;
import java.util.List;

import com.projects.backend.product.entity.Product;
import com.projects.backend.recommendation.calculator.RecommendationResult;

public record RecommendationResponse(
	String productCode,
	String productName,
	String brand,
	String recommendedSize,
	int matchScore,
	BigDecimal sizeScore,
	String reason,
	List<MeasurementComparisonResponse> comparisons
) {

	public static RecommendationResponse of(Product product, RecommendationResult result) {
		return new RecommendationResponse(
			product.getCode(),
			product.getName(),
			product.getBrand(),
			result.recommendedSize(),
			result.matchScore(),
			result.sizeScore(),
			result.reason(),
			result.comparisons().stream()
				.map(MeasurementComparisonResponse::from)
				.toList()
		);
	}
}
