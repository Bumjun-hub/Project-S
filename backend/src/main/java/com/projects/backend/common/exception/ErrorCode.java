package com.projects.backend.common.exception;

import org.springframework.http.HttpStatus;

/**
 * 애플리케이션에서 사용하는 공통 오류 정보를 관리한다.
 *
 * 각 오류 코드는 다음 정보를 가진다.
 * - HTTP 상태 코드
 * - 사용자에게 전달할 기본 메시지
 *
 * 오류 정보를 한곳에서 관리해 중복과 오타를 줄인다.
 */

public enum ErrorCode {

	// 요청값이 비어 있거나 형식이 올바르지 않을 때 사용하는 오류
	INVALID_INPUT(HttpStatus.BAD_REQUEST,
			"\uC785\uB825\uAC12\uC774 \uC62C\uBC14\uB974\uC9C0 \uC54A\uC2B5\uB2C8\uB2E4."),
	// 예상하지 못한 서버 내부 오류가 발생했을 때 사용하는 오류

	INTERNAL_SERVER_ERROR(HttpStatus.INTERNAL_SERVER_ERROR,
			"\uC11C\uBC84\uC5D0\uC11C \uC624\uB958\uAC00 \uBC1C\uC0DD\uD588\uC2B5\uB2C8\uB2E4.");

	private final HttpStatus httpStatus;
	private final String message;

	ErrorCode(HttpStatus httpStatus, String message) {
		this.httpStatus = httpStatus;
		this.message = message;
	}

	// 오류에 대응하는 HTTP 상태 코드를 반환한다.

	public HttpStatus getHttpStatus() {
		return httpStatus;
	}

	// 오류의 기본 메시지를 반환한다
	public String getMessage() {
		return message;
	}
}
