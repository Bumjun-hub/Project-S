package com.projects.backend.recommendation.dto;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

import com.projects.backend.recommendation.entity.RecommendationHistory;
import com.projects.backend.recommendation.entity.FitFeedback;

public record RecommendationHistoryResponse(
	Long id,
	Long productId,
	String productCode,
	String productName,
	String brand,
	String recommendedSize,
	int matchScore,
	BigDecimal sizeScore,
	String reason,
	FitFeedback feedback,
	LocalDateTime createdAt,
    String calculatorVersion,
    List<MeasurementComparisonResponse> comparisons
) {
	public static RecommendationHistoryResponse from(RecommendationHistory history) {
		return new RecommendationHistoryResponse(
			history.getId(),
			history.getProduct().getId(),
			history.getProductCodeSnapshot(),
			history.getProductNameSnapshot(),
			history.getBrandSnapshot(),
			history.getRecommendedSize(),
			history.getMatchScore(),
			history.getSizeScore(),
			history.getReason(),
			history.getFeedback(),
			history.getCreatedAt(), history.getCalculatorVersion(), history.getComparisons()
		);
	}
}
