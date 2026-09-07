package com.projects.backend.recommendation.controller;

import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.projects.backend.common.response.ApiResponse;
import com.projects.backend.recommendation.dto.RecommendationCreateRequest;
import com.projects.backend.recommendation.dto.RecommendationHistoryResponse;
import com.projects.backend.recommendation.dto.RecommendationResponse;
import com.projects.backend.recommendation.service.RecommendationService;

import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/v1/recommendations")
public class RecommendationController {

	private static final String RECOMMENDATION_SUCCESS_MESSAGE =
		"\uC0AC\uC774\uC988 \uCD94\uCC9C \uACB0\uACFC\uB97C \uC0DD\uC131\uD588\uC2B5\uB2C8\uB2E4.";
	private static final String HISTORY_SUCCESS_MESSAGE =
		"\uC0AC\uC774\uC988 \uCD94\uCC9C \uC774\uB825\uC744 \uC870\uD68C\uD588\uC2B5\uB2C8\uB2E4.";

	private final RecommendationService recommendationService;

	public RecommendationController(RecommendationService recommendationService) {
		this.recommendationService = recommendationService;
	}

	@PostMapping
	public ResponseEntity<ApiResponse<RecommendationResponse>> recommend(
		Authentication authentication,
		@Valid @RequestBody RecommendationCreateRequest request
	) {
		String email = authentication.getName();
		RecommendationResponse response = recommendationService.recommend(email, request);

		return ResponseEntity.ok(ApiResponse.success(RECOMMENDATION_SUCCESS_MESSAGE, response));
	}

	@GetMapping("/history")
	public ResponseEntity<ApiResponse<List<RecommendationHistoryResponse>>> getHistory(Authentication authentication) {
		List<RecommendationHistoryResponse> response = recommendationService.getHistory(authentication.getName());
		return ResponseEntity.ok(ApiResponse.success(HISTORY_SUCCESS_MESSAGE, response));
	}
}
