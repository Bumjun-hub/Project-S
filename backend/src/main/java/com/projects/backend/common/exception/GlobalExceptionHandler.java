package com.projects.backend.common.exception;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.http.converter.HttpMessageNotReadableException;
import org.springframework.web.method.annotation.MethodArgumentTypeMismatchException;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

/**
 * 애플리케이션 전체에서 발생하는 예외를 공통으로 처리한다.
 *
 * 각 Controller에서 직접 try-catch를 작성하지 않고,
 * 예외 종류에 따라 일관된 HTTP 상태와 ErrorResponse를 반환한다.
 */

@RestControllerAdvice
public class GlobalExceptionHandler {
    private static final Logger log = LoggerFactory.getLogger(GlobalExceptionHandler.class);

    @ExceptionHandler({HttpMessageNotReadableException.class, MethodArgumentTypeMismatchException.class})
    public ResponseEntity<ErrorResponse> handleMalformedInput(Exception exception) {
        return ResponseEntity.badRequest().body(ErrorResponse.from(ErrorCode.INVALID_INPUT));
    }

	/**
	 * 개발자가 의도적으로 발생시킨 BusinessException을 처리한다.
	 *
	 * 예외가 가진 ErrorCode를 통해
	 * HTTP 상태 코드와 오류 응답을 결정한다.
	 */

	@ExceptionHandler(BusinessException.class)
	public ResponseEntity<ErrorResponse> handleBusinessException(BusinessException exception) {
		ErrorCode errorCode = exception.getErrorCode();

		return ResponseEntity
				.status(errorCode.getHttpStatus())
				.body(ErrorResponse.from(errorCode));
	}

	/**
	 * @Valid를 이용한 요청 DTO 검증에 실패했을 때 처리한다.
	 *
	 *         예:
	 *         - 필수값 누락
	 *         - 이메일 형식 오류
	 *         - 문자열 길이 조건 위반
	 */

	@ExceptionHandler(MethodArgumentNotValidException.class)
	public ResponseEntity<ErrorResponse> handleMethodArgumentNotValidException(
			MethodArgumentNotValidException exception) {
		ErrorCode errorCode = ErrorCode.INVALID_INPUT;

		return ResponseEntity
				.status(errorCode.getHttpStatus())
				.body(ErrorResponse.from(errorCode));
	}

	/**
	 * 앞의 예외 처리 메서드에서 잡히지 않은
	 * 예상하지 못한 일반 예외를 처리한다.
	 *
	 * 내부 예외 내용을 클라이언트에 직접 노출하지 않고,
	 * 공통 서버 오류 응답을 반환한다.
	 */

	@ExceptionHandler(Exception.class)
	public ResponseEntity<ErrorResponse> handleException(Exception exception) {
        log.error("Unhandled server error ({})", exception.getClass().getSimpleName());
		ErrorCode errorCode = ErrorCode.INTERNAL_SERVER_ERROR;

		return ResponseEntity
				.status(errorCode.getHttpStatus())
				.body(ErrorResponse.from(errorCode));
	}
}
