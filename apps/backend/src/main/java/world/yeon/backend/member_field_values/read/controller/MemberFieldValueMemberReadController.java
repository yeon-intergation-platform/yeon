package world.yeon.backend.member_field_values.read.controller;

import java.util.List;
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
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import world.yeon.backend.member_field_values.read.dto.MemberFieldValueDetailedListResponse;
import world.yeon.backend.member_field_values.read.service.MemberFieldValueReadService;

@Validated
@RestController
@RequestMapping("/spaces/{spaceId}/members/{memberId}/field-values")
public class MemberFieldValueMemberReadController {

	private final MemberFieldValueReadService service;

	public MemberFieldValueMemberReadController(MemberFieldValueReadService service) {
		this.service = service;
	}

	@GetMapping
	public MemberFieldValueDetailedListResponse listValues(
		@PathVariable String spaceId,
		@PathVariable String memberId,
		@RequestParam(name = "fieldDefinitionId", required = false) List<String> fieldDefinitionIds,
		@RequestHeader("X-Yeon-User-Id") UUID userId
	) {
		return service.listMemberValues(spaceId, memberId, fieldDefinitionIds == null ? List.of() : fieldDefinitionIds);
	}

	@ExceptionHandler(NoSuchElementException.class)
	public ResponseEntity<ErrorResponse> handleNotFound(NoSuchElementException error) {
		String code = switch (error.getMessage()) {
			case "스페이스를 찾지 못했습니다." -> "SPACE_NOT_FOUND";
			case "수강생을 찾지 못했습니다." -> "MEMBER_NOT_FOUND";
			default -> "NOT_FOUND";
		};
		return ResponseEntity.status(HttpStatus.NOT_FOUND)
			.body(new ErrorResponse(code, error.getMessage()));
	}

	@ExceptionHandler(IllegalArgumentException.class)
	public ResponseEntity<ErrorResponse> handleBadRequest(IllegalArgumentException error) {
		return ResponseEntity.status(HttpStatus.BAD_REQUEST)
			.body(new ErrorResponse("INVALID_REQUEST", error.getMessage()));
	}

	public record ErrorResponse(String code, String message) {
	}
}
