package com.projects.backend.health.controller;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

import com.projects.backend.common.response.ApiResponse;
import com.projects.backend.health.dto.HealthResponse;
import com.projects.backend.health.service.HealthService;

@RestController
public class HealthController {

	private static final String HEALTH_SUCCESS_MESSAGE = "서버가 정상적으로 실행 중입니다.";

	private final HealthService healthService;

	public HealthController(HealthService healthService) {
		this.healthService = healthService;
	}

	@GetMapping("/api/v1/health")
	public ApiResponse<HealthResponse> health() {
		return ApiResponse.success(HEALTH_SUCCESS_MESSAGE, healthService.getHealth());
	}
}
