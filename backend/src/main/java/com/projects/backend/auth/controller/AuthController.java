package com.projects.backend.auth.controller;

import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RestController;

import com.projects.backend.auth.dto.AuthMeResponse;
import com.projects.backend.auth.dto.LoginRequest;
import com.projects.backend.auth.dto.LoginResponse;
import com.projects.backend.auth.service.AuthService;
import com.projects.backend.common.response.ApiResponse;

import jakarta.validation.Valid;

@RestController
public class AuthController {

	private static final String LOGIN_SUCCESS_MESSAGE = "\uB85C\uADF8\uC778\uC774 \uC644\uB8CC\uB418\uC5C8\uC2B5\uB2C8\uB2E4.";
	private static final String ME_SUCCESS_MESSAGE = "\uD604\uC7AC \uB85C\uADF8\uC778\uD55C \uC0AC\uC6A9\uC790 \uC815\uBCF4\uC785\uB2C8\uB2E4.";

	private final AuthService authService;

	public AuthController(AuthService authService) {
		this.authService = authService;
	}

	@PostMapping("/api/v1/auth/login")
	public ApiResponse<LoginResponse> login(@Valid @RequestBody LoginRequest request) {
		return ApiResponse.success(LOGIN_SUCCESS_MESSAGE, authService.login(request));
	}

	@GetMapping("/api/v1/auth/me")
	public ApiResponse<AuthMeResponse> me(Authentication authentication) {
		return ApiResponse.success(ME_SUCCESS_MESSAGE, authService.getCurrentMember(authentication));
	}
}
