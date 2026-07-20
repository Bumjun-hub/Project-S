package com.projects.backend.health.dto;

import java.time.LocalDateTime;

public record HealthResponse(
	String status,
	LocalDateTime timestamp
) {
}
