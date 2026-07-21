package com.projects.backend.common.exception;

/**
 * 애플리케이션의 비즈니스 규칙 위반을 표현하는 공통 예외이다.
 *
 * 예상 가능한 오류를 일반 시스템 오류와 구분하기 위해 사용한다.
 *
 * 예:
 * - 존재하지 않는 회원 조회
 * - 중복 이메일 회원가입
 * - 존재하지 않는 상품 조회
 */

public class BusinessException extends RuntimeException {


	 // 발생한 비즈니스 오류의 종류와 응답 정보를 가진다.
	private final ErrorCode errorCode;

	    /**
     * 전달받은 ErrorCode를 기반으로 비즈니스 예외를 생성한다.
     *
     * 부모 클래스인 RuntimeException에도 오류 메시지를 전달해
     * 로그와 디버깅 과정에서 메시지를 확인할 수 있도록 한다.
     */

	public BusinessException(ErrorCode errorCode) {
		super(errorCode.getMessage());
		this.errorCode = errorCode;
	}

  /**
     * 이 예외가 가진 ErrorCode를 반환한다.
     */

	public ErrorCode getErrorCode() {
		return errorCode;
	}
}
