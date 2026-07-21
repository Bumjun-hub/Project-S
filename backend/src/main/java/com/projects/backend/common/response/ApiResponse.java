 
package com.projects.backend.common.response;

/**
 * 모든 성공 API 응답의 공통 형식을 정의한다.
 *
 * @param success 요청 성공 여부
 * @param message 응답 메시지
 * @param data 실제 응답 데이터
 */


public record ApiResponse<T>(
	boolean success,
	String message,
	T data
) {

	/**
     * 성공 응답 객체를 생성한다.
     *
     * T는 HealthResponse, MemberResponse 등
     * API마다 다른 응답 타입을 받을 수 있다.
     */
	
	public static <T> ApiResponse<T> success(String message, T data) {
		return new ApiResponse<>(true, message, data);
	}
}
