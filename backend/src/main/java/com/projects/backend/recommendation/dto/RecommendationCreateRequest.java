package com.projects.backend.recommendation.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record RecommendationCreateRequest(
	@NotBlank
	@Size(max = 50)
	String productCode
) {
}
