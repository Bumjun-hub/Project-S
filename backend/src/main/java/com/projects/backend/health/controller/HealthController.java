package com.projects.backend.health.controller;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

import com.projects.backend.common.response.ApiResponse;
import com.projects.backend.health.dto.HealthResponse;
import com.projects.backend.health.service.HealthService;

/**
 * 서버 상태 확인 요청을 처리하는 Controller.
 *
 * Controller는 HTTP 요청을 받고 Service에 작업을 요청한 뒤,
 * 결과를 API 응답 형태로 반환하는 역할을 한다.
 */

@RestController
public class HealthController {

	// Health APi가 성공했을때 반환할 공통 메세지
	private static final String HEALTH_SUCCESS_MESSAGE = "서버가 정상적으로 실행 중입니다.";

	private final HealthService healthService;

	/**
	 * 생성자 주입 방식으로 HealthService를 전달받는다.
	 *
	 * Spring이 HealthService 객체를 찾아
	 * HealthController를 생성할 때 자동으로 넣어준다.
	 */

	public HealthController(HealthService healthService) {
		this.healthService = healthService;
	}

	/**
	 * GET /api/v1/health 요청을 처리한다.
	 *
	 * HealthService에서 서버 상태 데이터를 받아
	 * ApiResponse 성공 응답으로 감싸 반환한다.
	 */

	@GetMapping("/api/v1/health")
	public ApiResponse<HealthResponse> health() {
		return ApiResponse.success(HEALTH_SUCCESS_MESSAGE, healthService.getHealth());
	}
}
