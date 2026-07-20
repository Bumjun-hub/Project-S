package com.projects.backend.health.service;

import java.time.LocalDateTime;

import org.springframework.stereotype.Service;

import com.projects.backend.health.dto.HealthResponse;

@Service
public class HealthService {

	private static final String UP_STATUS = "UP";

	public HealthResponse getHealth() {
		return new HealthResponse(UP_STATUS, LocalDateTime.now());
	}
}
