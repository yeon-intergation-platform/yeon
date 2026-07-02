package world.yeon.backend.member_tabs.write.controller;

import java.util.NoSuchElementException;
import java.util.UUID;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import jakarta.validation.Valid;
import world.yeon.backend.member_tabs.write.dto.CreateMemberTabRequest;
import world.yeon.backend.member_tabs.write.dto.MemberTabMutationResponse;
import world.yeon.backend.member_tabs.write.dto.UpdateMemberTabRequest;
import world.yeon.backend.member_tabs.write.service.MemberTabWriteService;
import world.yeon.backend.common.error.ApiErrorResponse;
import world.yeon.backend.common.error.ApiErrorResponses;

@Validated
@RestController
@RequestMapping("/spaces/{spaceId}/member-tabs")
public class MemberTabWriteController {

	private final MemberTabWriteService service;

	public MemberTabWriteController(MemberTabWriteService service) {
		this.service = service;
	}

	@PostMapping
	public ResponseEntity<MemberTabMutationResponse> createTab(
		@PathVariable String spaceId,
		@RequestHeader("X-Yeon-User-Id") UUID userId,
		@Valid @RequestBody CreateMemberTabRequest request
	) {
		return ResponseEntity.status(HttpStatus.CREATED)
			.body(service.createCustomTab(spaceId, userId, request));
	}

	@PatchMapping("/{tabId}")
	public MemberTabMutationResponse updateTab(
		@PathVariable String spaceId,
		@PathVariable String tabId,
		@RequestHeader("X-Yeon-User-Id") UUID userId,
		@Valid @RequestBody UpdateMemberTabRequest request
	) {
		return service.updateTab(tabId, spaceId, request);
	}

	@DeleteMapping("/{tabId}")
	public ResponseEntity<Void> deleteTab(
		@PathVariable String spaceId,
		@PathVariable String tabId,
		@RequestHeader("X-Yeon-User-Id") UUID userId
	) {
		service.deleteCustomTab(tabId, spaceId);
		return ResponseEntity.noContent().build();
	}

	@ExceptionHandler(NoSuchElementException.class)
	public ResponseEntity<ApiErrorResponse> handleNotFound(NoSuchElementException error) {
		String code = "탭을 찾지 못했습니다.".equals(error.getMessage())
			? "MEMBER_TAB_NOT_FOUND"
			: "SPACE_NOT_FOUND";
		return ResponseEntity.status(HttpStatus.NOT_FOUND)
			.body(ApiErrorResponses.ofCurrentRequest(code, error.getMessage()));
	}

	@ExceptionHandler(IllegalStateException.class)
	public ResponseEntity<ApiErrorResponse> handleForbidden(IllegalStateException error) {
		String code = switch (error.getMessage()) {
			case "기본 탭은 수정할 수 없습니다.", "기본 탭은 삭제할 수 없습니다." -> "PROTECTED_SYSTEM_TAB";
			case "시스템 탭은 삭제할 수 없습니다." -> "SYSTEM_TAB_DELETE_FORBIDDEN";
			default -> "MEMBER_TAB_FORBIDDEN";
		};
		return ResponseEntity.status(HttpStatus.FORBIDDEN)
			.body(ApiErrorResponses.ofCurrentRequest(code, error.getMessage()));
	}

	@ExceptionHandler(IllegalArgumentException.class)
	public ResponseEntity<ApiErrorResponse> handleBadRequest(IllegalArgumentException error) {
		return ResponseEntity.status(HttpStatus.BAD_REQUEST)
			.body(ApiErrorResponses.ofCurrentRequest("INVALID_REQUEST", error.getMessage()));
	}

}
