package com.projects.backend.recommendation.dto;

import com.projects.backend.recommendation.entity.FitFeedback;

import jakarta.validation.constraints.NotNull;

public record RecommendationFeedbackRequest(
	@NotNull FitFeedback feedback
) {
}
