package com.projects.backend.auth.dto;

public record LoginResponse(
	String accessToken,
	String tokenType,
	Long memberId,
	String email,
	String nickname
) {
}
