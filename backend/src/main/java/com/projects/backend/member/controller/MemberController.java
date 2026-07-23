package com.projects.backend.member.controller;

import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RestController;

import com.projects.backend.common.response.ApiResponse;
import com.projects.backend.member.dto.MemberSignUpRequest;
import com.projects.backend.member.dto.MemberSignUpResponse;
import com.projects.backend.member.service.MemberService;

import jakarta.validation.Valid;

@RestController
public class MemberController {

	private static final String SIGN_UP_SUCCESS_MESSAGE = "\uD68C\uC6D0\uAC00\uC785\uC774 \uC644\uB8CC\uB418\uC5C8\uC2B5\uB2C8\uB2E4.";

	private final MemberService memberService;

	public MemberController(MemberService memberService) {
		this.memberService = memberService;
	}

	@PostMapping("/api/v1/members")
	public ApiResponse<MemberSignUpResponse> signUp(@Valid @RequestBody MemberSignUpRequest request) {
		return ApiResponse.success(SIGN_UP_SUCCESS_MESSAGE, memberService.signUp(request));
	}
}
