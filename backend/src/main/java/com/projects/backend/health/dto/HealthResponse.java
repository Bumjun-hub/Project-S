package com.projects.backend.health.dto;

import java.time.LocalDateTime;

/**
 * 서버 상태 확인 API의 응답 데이터를 담는 DTO.
 *
 * Controller와 프론트엔드 사이에서
 * 서버 상태와 확인 시각을 전달한다.
 */

public record HealthResponse(
	String status,
	LocalDateTime timestamp
) {
}
