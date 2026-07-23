package com.projects.backend.myfit.controller;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.projects.backend.common.response.ApiResponse;
import com.projects.backend.myfit.dto.MyFitCreateRequest;
import com.projects.backend.myfit.dto.MyFitResponse;
import com.projects.backend.myfit.dto.MyFitUpdateRequest;
import com.projects.backend.myfit.service.MyFitService;

import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/v1/my-fits")
public class MyFitController {

	private static final String CREATE_SUCCESS_MESSAGE =
		"\uAE30\uC900 \uD54F \uC815\uBCF4\uAC00 \uB4F1\uB85D\uB418\uC5C8\uC2B5\uB2C8\uB2E4.";
	private static final String GET_MY_FIT_SUCCESS_MESSAGE =
		"\uAE30\uC900 \uD54F \uC815\uBCF4\uB97C \uC870\uD68C\uD588\uC2B5\uB2C8\uB2E4.";
	private static final String UPDATE_SUCCESS_MESSAGE =
		"\uAE30\uC900 \uD54F \uC815\uBCF4\uAC00 \uC218\uC815\uB418\uC5C8\uC2B5\uB2C8\uB2E4.";

	private final MyFitService myFitService;

	public MyFitController(MyFitService myFitService) {
		this.myFitService = myFitService;
	}

	@PostMapping
	public ResponseEntity<ApiResponse<MyFitResponse>> create(
		Authentication authentication,
		@Valid @RequestBody MyFitCreateRequest request
	) {
		String email = authentication.getName();
		MyFitResponse response = myFitService.create(email, request);

		return ResponseEntity
			.status(HttpStatus.CREATED)
			.body(ApiResponse.success(CREATE_SUCCESS_MESSAGE, response));
	}

	@GetMapping("/me")
	public ResponseEntity<ApiResponse<MyFitResponse>> getMyFit(Authentication authentication) {
		String email = authentication.getName();
		MyFitResponse response = myFitService.getMyFit(email);

		return ResponseEntity.ok(ApiResponse.success(GET_MY_FIT_SUCCESS_MESSAGE, response));
	}

	@PatchMapping("/me")
	public ResponseEntity<ApiResponse<MyFitResponse>> update(
		Authentication authentication,
		@Valid @RequestBody MyFitUpdateRequest request
	) {
		String email = authentication.getName();
		MyFitResponse response = myFitService.update(email, request);

		return ResponseEntity.ok(ApiResponse.success(UPDATE_SUCCESS_MESSAGE, response));
	}
}
