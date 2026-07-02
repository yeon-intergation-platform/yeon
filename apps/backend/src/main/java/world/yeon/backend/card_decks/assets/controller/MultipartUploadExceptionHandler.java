package world.yeon.backend.card_decks.assets.controller;

import jakarta.servlet.http.HttpServletRequest;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.multipart.MaxUploadSizeExceededException;
import world.yeon.backend.common.error.ApiErrorResponse;
import world.yeon.backend.common.error.ApiErrorResponses;

/**
 * 멀티파트 업로드 크기 초과를 일관된 400 응답으로 변환한다.
 *
 * <p>서블릿 멀티파트 한도(application.yml의 spring.servlet.multipart.max-file-size)를 넘으면
 * 요청 파싱 단계에서 예외가 발생해 컨트롤러 핸들러에 도달하지 못한다. 컨트롤러 지역
 * {@code @ExceptionHandler}로는 잡히지 않으므로 전역 advice로 처리해 사용자에게 친절한
 * 한글 메시지를 전달한다. 처리하지 않으면 500으로 떨어져 "이미지 등록 실패" 원인 파악이 어렵다.
 */
@RestControllerAdvice
public class MultipartUploadExceptionHandler {

	@ExceptionHandler(MaxUploadSizeExceededException.class)
	public ResponseEntity<ApiErrorResponse> handleMaxUploadSize(
		MaxUploadSizeExceededException error,
		HttpServletRequest request
	) {
		return ResponseEntity.status(HttpStatus.BAD_REQUEST)
			.body(ApiErrorResponses.of(
				request,
				"CARD_ASSET_TOO_LARGE",
				"이미지는 5MB 이하만 업로드할 수 있습니다."
			));
	}
}
