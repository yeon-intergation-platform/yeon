package world.yeon.backend.member_fields.reorder.controller;

import java.util.NoSuchElementException;
import java.util.UUID;

import org.springframework.context.annotation.Profile;
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
import world.yeon.backend.member_fields.reorder.dto.OkResponse;
import world.yeon.backend.member_fields.reorder.dto.ReorderMemberFieldsRequest;
import world.yeon.backend.member_fields.reorder.service.MemberFieldReorderService;

@Validated
@RestController
@Profile("jdbc")
@RequestMapping("/spaces/{spaceId}/member-tabs/{tabId}/fields/reorder")
public class MemberFieldReorderController {

	private final MemberFieldReorderService service;

	public MemberFieldReorderController(MemberFieldReorderService service) {
		this.service = service;
	}

	@PatchMapping
	public OkResponse reorderFields(
		@PathVariable String spaceId,
		@PathVariable String tabId,
		@RequestHeader("X-Yeon-User-Id") UUID userId,
		@Valid @RequestBody ReorderMemberFieldsRequest request
	) {
		return service.reorderFields(spaceId, request.order());
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

	public record ErrorResponse(String code, String message) {}
}
