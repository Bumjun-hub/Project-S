package com.projects.backend.bodyprofile.controller;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.projects.backend.bodyprofile.dto.BodyProfileCreateRequest;
import com.projects.backend.bodyprofile.dto.BodyProfileResponse;
import com.projects.backend.bodyprofile.dto.BodyProfileUpdateRequest;
import com.projects.backend.bodyprofile.service.BodyProfileService;
import com.projects.backend.common.response.ApiResponse;

import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/v1/body-profiles")
public class BodyProfileController {

	private static final String CREATE_SUCCESS_MESSAGE = "\uC2E0\uCCB4 \uD504\uB85C\uD544\uC774 \uB4F1\uB85D\uB418\uC5C8\uC2B5\uB2C8\uB2E4.";
	private static final String GET_MY_PROFILE_SUCCESS_MESSAGE = "\uC2E0\uCCB4 \uD504\uB85C\uD544\uC744 \uC870\uD68C\uD588\uC2B5\uB2C8\uB2E4.";
	private static final String UPDATE_SUCCESS_MESSAGE = "\uC2E0\uCCB4 \uD504\uB85C\uD544\uC774 \uC218\uC815\uB418\uC5C8\uC2B5\uB2C8\uB2E4.";

	private final BodyProfileService bodyProfileService;

	public BodyProfileController(BodyProfileService bodyProfileService) {
		this.bodyProfileService = bodyProfileService;
	}

	@PostMapping
	public ResponseEntity<ApiResponse<BodyProfileResponse>> create(
		Authentication authentication,
		@Valid @RequestBody BodyProfileCreateRequest request
	) {
		String email = authentication.getName();
		BodyProfileResponse response = bodyProfileService.create(email, request);

		return ResponseEntity
			.status(HttpStatus.CREATED)
			.body(ApiResponse.success(CREATE_SUCCESS_MESSAGE, response));
	}

	@GetMapping("/me")
	public ResponseEntity<ApiResponse<BodyProfileResponse>> getMyProfile(Authentication authentication) {
		String email = authentication.getName();
		BodyProfileResponse response = bodyProfileService.getMyProfile(email);

		return ResponseEntity.ok(ApiResponse.success(GET_MY_PROFILE_SUCCESS_MESSAGE, response));
	}

	@PatchMapping("/me")
	public ResponseEntity<ApiResponse<BodyProfileResponse>> update(
		Authentication authentication,
		@Valid @RequestBody BodyProfileUpdateRequest request
	) {
		String email = authentication.getName();
		BodyProfileResponse response = bodyProfileService.update(email, request);

		return ResponseEntity.ok(ApiResponse.success(UPDATE_SUCCESS_MESSAGE, response));
	}
}
