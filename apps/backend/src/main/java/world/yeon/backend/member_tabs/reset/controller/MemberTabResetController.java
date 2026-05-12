package world.yeon.backend.member_tabs.reset.controller;

import java.util.NoSuchElementException;
import java.util.UUID;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import world.yeon.backend.member_tabs.reset.dto.OkResponse;
import world.yeon.backend.member_tabs.reset.service.MemberTabResetService;

@Validated
@RestController
@RequestMapping("/spaces/{spaceId}/member-tabs/reset")
public class MemberTabResetController {

	private final MemberTabResetService service;

	public MemberTabResetController(MemberTabResetService service) {
		this.service = service;
	}

	@PostMapping
	public OkResponse resetTabs(
		@PathVariable String spaceId,
		@RequestHeader("X-Yeon-User-Id") UUID userId
	) {
		return service.resetTabs(spaceId);
	}

	@ExceptionHandler(NoSuchElementException.class)
	public ResponseEntity<ErrorResponse> handleNotFound(NoSuchElementException error) {
		return ResponseEntity.status(HttpStatus.NOT_FOUND)
			.body(new ErrorResponse("SPACE_NOT_FOUND", error.getMessage()));
	}

	@ExceptionHandler(IllegalArgumentException.class)
	public ResponseEntity<ErrorResponse> handleBadRequest(IllegalArgumentException error) {
		return ResponseEntity.status(HttpStatus.BAD_REQUEST)
			.body(new ErrorResponse("INVALID_REQUEST", error.getMessage()));
	}

	public record ErrorResponse(String code, String message) {
	}
}
