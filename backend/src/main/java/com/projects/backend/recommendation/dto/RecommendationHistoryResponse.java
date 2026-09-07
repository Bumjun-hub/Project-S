package com.projects.backend.recommendation.dto;

import java.math.BigDecimal;
import java.time.LocalDateTime;

import com.projects.backend.recommendation.entity.RecommendationHistory;

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
	LocalDateTime createdAt
) {
	public static RecommendationHistoryResponse from(RecommendationHistory history) {
		return new RecommendationHistoryResponse(
			history.getId(),
			history.getProduct().getId(),
			history.getProduct().getCode(),
			history.getProduct().getName(),
			history.getProduct().getBrand(),
			history.getRecommendedSize(),
			history.getMatchScore(),
			history.getSizeScore(),
			history.getReason(),
			history.getCreatedAt()
		);
	}
}
