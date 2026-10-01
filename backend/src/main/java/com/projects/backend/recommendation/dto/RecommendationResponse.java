package com.projects.backend.recommendation.dto;

import java.math.BigDecimal;
import java.util.List;
import java.time.LocalDateTime;
import com.projects.backend.recommendation.entity.RecommendationHistory;


public record RecommendationResponse(
    Long historyId,
    LocalDateTime createdAt,
	String productCode,
	String productName,
	String brand,
	String recommendedSize,
	int matchScore,
	BigDecimal sizeScore,
	String reason,
	List<MeasurementComparisonResponse> comparisons
) {

	public static RecommendationResponse from(RecommendationHistory history) {
		return new RecommendationResponse(
            history.getId(), history.getCreatedAt(),
            history.getProductCodeSnapshot(), history.getProductNameSnapshot(), history.getBrandSnapshot(),
            history.getRecommendedSize(), history.getMatchScore(), history.getSizeScore(), history.getReason(),
            history.getComparisons()
		);
	}
}
