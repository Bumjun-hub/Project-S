package com.projects.backend.auth.dto;

public record AuthMeResponse(
	String email,
	String role
) {
}
