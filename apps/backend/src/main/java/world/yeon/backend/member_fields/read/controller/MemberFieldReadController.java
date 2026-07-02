package world.yeon.backend.member_fields.read.controller;

import java.util.NoSuchElementException;
import java.util.UUID;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import world.yeon.backend.member_fields.read.dto.MemberFieldListResponse;
import world.yeon.backend.member_fields.read.service.MemberFieldReadService;
import world.yeon.backend.common.error.ApiErrorResponse;
import world.yeon.backend.common.error.ApiErrorResponses;

@Validated
@RestController
@RequestMapping("/spaces/{spaceId}/member-tabs/{tabId}/fields")
public class MemberFieldReadController {

	private final MemberFieldReadService service;

	public MemberFieldReadController(MemberFieldReadService service) {
		this.service = service;
	}

	@GetMapping
	public MemberFieldListResponse listFields(
		@PathVariable String spaceId,
		@PathVariable String tabId,
		@RequestHeader("X-Yeon-User-Id") UUID userId
	) {
		return service.listFields(spaceId, tabId);
	}

	@ExceptionHandler(NoSuchElementException.class)
	public ResponseEntity<ApiErrorResponse> handleNotFound(NoSuchElementException error) {
		String code = "스페이스를 찾지 못했습니다.".equals(error.getMessage())
			? "SPACE_NOT_FOUND"
			: "TAB_NOT_FOUND";
		return ResponseEntity.status(HttpStatus.NOT_FOUND)
			.body(ApiErrorResponses.ofCurrentRequest(code, error.getMessage()));
	}

	@ExceptionHandler(IllegalArgumentException.class)
	public ResponseEntity<ApiErrorResponse> handleBadRequest(IllegalArgumentException error) {
		String code = "탭이 스페이스에 속하지 않습니다.".equals(error.getMessage())
			? "TAB_SPACE_MISMATCH"
			: "INVALID_REQUEST";
		return ResponseEntity.status(HttpStatus.BAD_REQUEST)
			.body(ApiErrorResponses.ofCurrentRequest(code, error.getMessage()));
	}

}
