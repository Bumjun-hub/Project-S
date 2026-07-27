package com.projects.backend.recommendation.calculator;

import java.math.BigDecimal;
import java.util.List;

public record RecommendationResult(
	String recommendedSize,
	BigDecimal sizeScore,
	int matchScore,
	String reason,
	List<MeasurementComparisonResult> comparisons
) {

	public RecommendationResult {
		comparisons = List.copyOf(comparisons);
	}
}
