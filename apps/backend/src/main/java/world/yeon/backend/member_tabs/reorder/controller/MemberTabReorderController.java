package world.yeon.backend.member_tabs.reorder.controller;

import java.util.NoSuchElementException;
import java.util.UUID;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import jakarta.validation.Valid;
import world.yeon.backend.member_tabs.reorder.dto.OkResponse;
import world.yeon.backend.member_tabs.reorder.dto.ReorderMemberTabsRequest;
import world.yeon.backend.member_tabs.reorder.service.MemberTabReorderService;

@Validated
@RestController
@RequestMapping("/spaces/{spaceId}/member-tabs/reorder")
public class MemberTabReorderController {

	private final MemberTabReorderService service;

	public MemberTabReorderController(MemberTabReorderService service) {
		this.service = service;
	}

	@PatchMapping
	public OkResponse reorderTabs(
		@PathVariable String spaceId,
		@RequestHeader("X-Yeon-User-Id") UUID userId,
		@Valid @RequestBody ReorderMemberTabsRequest request
	) {
		return service.reorderTabs(spaceId, request.order());
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
