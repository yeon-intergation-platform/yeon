package world.yeon.backend.member_fields.bootstrap_overview.controller;

import java.util.NoSuchElementException;
import java.util.UUID;

import org.springframework.context.annotation.Profile;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import world.yeon.backend.member_fields.bootstrap_overview.dto.OkResponse;
import world.yeon.backend.member_fields.bootstrap_overview.service.MemberFieldOverviewBootstrapService;

@Validated
@RestController
@Profile("jdbc")
@RequestMapping("/spaces/{spaceId}/member-tabs/{tabId}/bootstrap-overview-fields")
public class MemberFieldOverviewBootstrapController {

	private final MemberFieldOverviewBootstrapService service;

	public MemberFieldOverviewBootstrapController(MemberFieldOverviewBootstrapService service) {
		this.service = service;
	}

	@PostMapping
	public OkResponse bootstrap(
		@PathVariable String spaceId,
		@PathVariable String tabId,
		@RequestHeader("X-Yeon-User-Id") UUID userId
	) {
		return service.bootstrap(spaceId, tabId, userId);
	}

	@ExceptionHandler(NoSuchElementException.class)
	public ResponseEntity<ErrorResponse> handleNotFound(NoSuchElementException error) {
		String code = switch (error.getMessage()) {
			case "스페이스를 찾지 못했습니다." -> "SPACE_NOT_FOUND";
			case "탭을 찾지 못했습니다." -> "TAB_NOT_FOUND";
			default -> "NOT_FOUND";
		};
		return ResponseEntity.status(HttpStatus.NOT_FOUND)
			.body(new ErrorResponse(code, error.getMessage()));
	}

	@ExceptionHandler(IllegalArgumentException.class)
	public ResponseEntity<ErrorResponse> handleBadRequest(IllegalArgumentException error) {
		String code = switch (error.getMessage()) {
			case "탭이 스페이스에 속하지 않습니다." -> "TAB_SPACE_MISMATCH";
			case "개요 탭에서만 기본 필드 초기화를 수행할 수 있습니다." -> "OVERVIEW_TAB_ONLY";
			default -> "INVALID_REQUEST";
		};
		return ResponseEntity.status(HttpStatus.BAD_REQUEST)
			.body(new ErrorResponse(code, error.getMessage()));
	}

	public record ErrorResponse(String code, String message) {
	}
}
