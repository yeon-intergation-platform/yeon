package world.yeon.backend.members.controller;

import java.util.NoSuchElementException;
import java.util.UUID;

import org.springframework.context.annotation.Profile;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import world.yeon.backend.members.dto.*;
import world.yeon.backend.members.service.MemberCrudService;
import world.yeon.backend.members.service.MemberCrudServiceException;

@Validated
@RestController
@Profile("jdbc")
public class MemberCrudController {

	private final MemberCrudService service;

	public MemberCrudController(MemberCrudService service) { this.service = service; }

	@GetMapping("/spaces/{spaceId}/members")
	public GetMembersResponse getMembers(@PathVariable String spaceId, @RequestHeader("X-Yeon-User-Id") UUID userId) {
		return service.getMembers(spaceId, userId);
	}

	@PostMapping("/spaces/{spaceId}/members")
	public ResponseEntity<CreateMemberResponse> createMember(@PathVariable String spaceId, @RequestHeader("X-Yeon-User-Id") UUID userId, @RequestBody CreateMemberRequest request) {
		return ResponseEntity.status(HttpStatus.CREATED).body(service.createMember(spaceId, userId, request));
	}

	@GetMapping("/spaces/{spaceId}/members/{memberId}")
	public GetMemberResponse getMemberInSpace(@PathVariable String spaceId, @PathVariable String memberId, @RequestHeader("X-Yeon-User-Id") UUID userId) {
		return service.getOwnedMemberInSpace(spaceId, memberId, userId);
	}

	@PatchMapping("/spaces/{spaceId}/members/{memberId}")
	public UpdateMemberResponse updateMember(@PathVariable String spaceId, @PathVariable String memberId, @RequestHeader("X-Yeon-User-Id") UUID userId, @RequestBody UpdateMemberRequest request) {
		return service.updateMember(spaceId, memberId, userId, request);
	}

	@DeleteMapping("/spaces/{spaceId}/members/{memberId}")
	public DeleteMemberResponse deleteMember(@PathVariable String spaceId, @PathVariable String memberId, @RequestHeader("X-Yeon-User-Id") UUID userId) {
		return service.deleteMember(spaceId, memberId, userId);
	}

	@PostMapping("/spaces/{spaceId}/members/bulk-delete")
	public BulkDeleteMembersResponse bulkDeleteMembers(@PathVariable String spaceId, @RequestHeader("X-Yeon-User-Id") UUID userId, @RequestBody BulkDeleteMembersRequest request) {
		return service.bulkDeleteMembers(spaceId, userId, request);
	}

	@GetMapping("/members/{memberId}")
	public GetMemberResponse getOwnedMember(@PathVariable String memberId, @RequestHeader("X-Yeon-User-Id") UUID userId) {
		return service.getOwnedMember(memberId, userId);
	}

	@ExceptionHandler(NoSuchElementException.class)
	public ResponseEntity<ErrorResponse> handleNotFound(NoSuchElementException error) {
		return ResponseEntity.status(HttpStatus.NOT_FOUND).body(new ErrorResponse("SPACE_NOT_FOUND", error.getMessage()));
	}
	@ExceptionHandler(IllegalArgumentException.class)
	public ResponseEntity<ErrorResponse> handleBadRequest(IllegalArgumentException error) {
		return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(new ErrorResponse("INVALID_REQUEST", error.getMessage()));
	}
	@ExceptionHandler(MemberCrudServiceException.class)
	public ResponseEntity<ErrorResponse> handleServiceError(MemberCrudServiceException error) {
		return ResponseEntity.status(error.status()).body(new ErrorResponse(error.code(), error.getMessage()));
	}
	public record ErrorResponse(String code, String message) {}
}
