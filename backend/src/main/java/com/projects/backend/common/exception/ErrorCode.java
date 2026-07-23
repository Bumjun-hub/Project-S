package com.projects.backend.common.exception;

import org.springframework.http.HttpStatus;

public enum ErrorCode {

	INVALID_INPUT(HttpStatus.BAD_REQUEST,
			"\uC785\uB825\uAC12\uC774 \uC62C\uBC14\uB974\uC9C0 \uC54A\uC2B5\uB2C8\uB2E4."),
	INVALID_LOGIN(HttpStatus.UNAUTHORIZED,
			"\uC774\uBA54\uC77C \uB610\uB294 \uBE44\uBC00\uBC88\uD638\uAC00 \uC62C\uBC14\uB974\uC9C0 \uC54A\uC2B5\uB2C8\uB2E4."),
	UNAUTHORIZED(HttpStatus.UNAUTHORIZED,
			"\uC778\uC99D\uC774 \uD544\uC694\uD569\uB2C8\uB2E4."),
	DUPLICATE_EMAIL(HttpStatus.CONFLICT,
			"\uC774\uBBF8 \uC0AC\uC6A9 \uC911\uC778 \uC774\uBA54\uC77C\uC785\uB2C8\uB2E4."),
	BODY_PROFILE_ALREADY_EXISTS(HttpStatus.CONFLICT,
			"\uC774\uBBF8 \uC2E0\uCCB4 \uD504\uB85C\uD544\uC774 \uB4F1\uB85D\uB418\uC5B4 \uC788\uC2B5\uB2C8\uB2E4."),
	BODY_PROFILE_NOT_FOUND(HttpStatus.NOT_FOUND,
			"\uC2E0\uCCB4 \uD504\uB85C\uD544\uC744 \uCC3E\uC744 \uC218 \uC5C6\uC2B5\uB2C8\uB2E4."),
	BODY_PROFILE_UPDATE_EMPTY(HttpStatus.BAD_REQUEST,
			"\uC218\uC815\uD560 \uC2E0\uCCB4 \uD504\uB85C\uD544 \uC815\uBCF4\uAC00 \uC5C6\uC2B5\uB2C8\uB2E4."),
	MY_FIT_ALREADY_EXISTS(HttpStatus.CONFLICT,
			"\uC774\uBBF8 \uAE30\uC900 \uD54F \uC815\uBCF4\uAC00 \uB4F1\uB85D\uB418\uC5B4 \uC788\uC2B5\uB2C8\uB2E4."),
	MY_FIT_NOT_FOUND(HttpStatus.NOT_FOUND,
			"\uAE30\uC900 \uD54F \uC815\uBCF4\uB97C \uCC3E\uC744 \uC218 \uC5C6\uC2B5\uB2C8\uB2E4."),
	MY_FIT_UPDATE_EMPTY(HttpStatus.BAD_REQUEST,
			"\uC218\uC815\uD560 \uAE30\uC900 \uD54F \uC815\uBCF4\uAC00 \uC5C6\uC2B5\uB2C8\uB2E4."),
	INTERNAL_SERVER_ERROR(HttpStatus.INTERNAL_SERVER_ERROR,
			"\uC11C\uBC84\uC5D0\uC11C \uC624\uB958\uAC00 \uBC1C\uC0DD\uD588\uC2B5\uB2C8\uB2E4.");

	private final HttpStatus httpStatus;
	private final String message;

	ErrorCode(HttpStatus httpStatus, String message) {
		this.httpStatus = httpStatus;
		this.message = message;
	}

	public HttpStatus getHttpStatus() {
		return httpStatus;
	}

	public String getMessage() {
		return message;
	}
}
