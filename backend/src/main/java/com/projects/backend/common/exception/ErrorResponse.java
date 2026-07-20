package com.projects.backend.common.exception;

public record ErrorResponse(
	boolean success,
	String code,
	String message
) {

	public static ErrorResponse from(ErrorCode errorCode) {
		return new ErrorResponse(false, errorCode.name(), errorCode.getMessage());
	}
}
