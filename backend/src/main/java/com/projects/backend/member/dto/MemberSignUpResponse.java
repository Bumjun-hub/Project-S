package com.projects.backend.member.dto;

public record MemberSignUpResponse(
	Long memberId,
	String email,
	String nickname
) {
}
