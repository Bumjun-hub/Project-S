package com.projects.backend.health.service;

import java.time.LocalDateTime;

import org.springframework.stereotype.Service;

import com.projects.backend.health.dto.HealthResponse;

/**
 * 서버 상태 확인에 필요한 로직을 담당하는 Service.
 *
 * Service는 Controller와 데이터 계층 사이에서
 * 실제 애플리케이션 로직을 처리한다.
 */

@Service
public class HealthService {

	/**
	 * 현재 서버 상태와 확인 시각을 생성해 반환한다.
	 */

	private static final String UP_STATUS = "UP";

	public HealthResponse getHealth() {
		return new HealthResponse(UP_STATUS, LocalDateTime.now());
	}
}
