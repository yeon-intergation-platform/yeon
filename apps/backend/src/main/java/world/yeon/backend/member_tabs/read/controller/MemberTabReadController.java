package world.yeon.backend.member_tabs.read.controller;

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

import world.yeon.backend.member_tabs.read.dto.MemberTabListResponse;
import world.yeon.backend.member_tabs.read.service.MemberTabReadService;
import world.yeon.backend.common.error.ApiErrorResponse;
import world.yeon.backend.common.error.ApiErrorResponses;

@Validated
@RestController
@RequestMapping("/spaces/{spaceId}/member-tabs")
public class MemberTabReadController {

	private final MemberTabReadService service;

	public MemberTabReadController(MemberTabReadService service) {
		this.service = service;
	}

	@GetMapping
	public MemberTabListResponse listTabs(
		@PathVariable String spaceId,
		@RequestHeader("X-Yeon-User-Id") UUID userId
	) {
		return service.listTabs(spaceId);
	}

	@ExceptionHandler(NoSuchElementException.class)
	public ResponseEntity<ApiErrorResponse> handleNotFound(NoSuchElementException error) {
		return ResponseEntity.status(HttpStatus.NOT_FOUND)
			.body(ApiErrorResponses.ofCurrentRequest("SPACE_NOT_FOUND", error.getMessage()));
	}

	@ExceptionHandler({ IllegalArgumentException.class })
	public ResponseEntity<ApiErrorResponse> handleBadRequest(RuntimeException error) {
		return ResponseEntity.status(HttpStatus.BAD_REQUEST)
			.body(ApiErrorResponses.ofCurrentRequest("INVALID_REQUEST", error.getMessage()));
	}

}
