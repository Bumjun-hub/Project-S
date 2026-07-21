package com.projects.backend.common.exception;

/**
 * API 요청이 실패했을 때 반환하는 공통 응답 형식이다.
 *
 * @param success 요청 성공 여부. 실패 응답이므로 항상 false이다.
 * @param code    프론트엔드가 오류 종류를 구분하기 위한 코드
 * @param message 사용자에게 전달할 오류 메시지
 */

public record ErrorResponse(
		boolean success,
		String code,
		String message) {

	/**
	 * ErrorCode를 이용해 실패 응답 객체를 생성한다.
	 *
	 * errorCode.name()은 INVALID_INPUT과 같은
	 * enum 상수 이름을 문자열로 반환한다.
	 */
	public static ErrorResponse from(ErrorCode errorCode) {
		return new ErrorResponse(false, errorCode.name(), errorCode.getMessage());
	}
}
