package world.yeon.backend.member_fields.write.controller;

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

import world.yeon.backend.member_fields.read.mapper.MemberFieldReadMapper;
import world.yeon.backend.member_fields.write.dto.CreateMemberFieldRequest;
import world.yeon.backend.member_fields.write.dto.MemberFieldMutationResponse;
import world.yeon.backend.member_fields.write.dto.UpdateMemberFieldRequest;
import world.yeon.backend.member_fields.write.service.MemberFieldWriteService;
import world.yeon.backend.member_fields.write.service.MemberFieldWriteServiceException;
import world.yeon.backend.common.error.ApiErrorResponse;
import world.yeon.backend.common.error.ApiErrorResponses;

@Validated
@RestController
@RequestMapping("/spaces/{spaceId}")
public class MemberFieldWriteController {

	private final MemberFieldWriteService service;
	private final MemberFieldReadMapper mapper;

	public MemberFieldWriteController(MemberFieldWriteService service, MemberFieldReadMapper mapper) {
		this.service = service;
		this.mapper = mapper;
	}

	@PostMapping("/member-tabs/{tabId}/fields")
	public ResponseEntity<MemberFieldMutationResponse> create(
		@PathVariable String spaceId,
		@PathVariable String tabId,
		@RequestHeader("X-Yeon-User-Id") UUID userId,
		@RequestBody CreateMemberFieldRequest request
	) {
		var field = service.create(spaceId, tabId, userId, request);
		return ResponseEntity.status(HttpStatus.CREATED)
			.body(new MemberFieldMutationResponse(mapper.toItem(field)));
	}

	@PatchMapping("/member-fields/{fieldId}")
	public MemberFieldMutationResponse update(
		@PathVariable String spaceId,
		@PathVariable String fieldId,
		@RequestHeader("X-Yeon-User-Id") UUID userId,
		@RequestBody UpdateMemberFieldRequest request
	) {
		var field = service.update(fieldId, spaceId, userId, request);
		return new MemberFieldMutationResponse(mapper.toItem(field));
	}

	@DeleteMapping("/member-fields/{fieldId}")
	public ResponseEntity<Void> delete(
		@PathVariable String spaceId,
		@PathVariable String fieldId,
		@RequestHeader("X-Yeon-User-Id") UUID userId
	) {
		service.delete(fieldId, spaceId, userId);
		return ResponseEntity.noContent().build();
	}

	@ExceptionHandler(MemberFieldWriteServiceException.class)
	public ResponseEntity<ApiErrorResponse> handle(MemberFieldWriteServiceException error) {
		return ResponseEntity.status(error.getStatus())
			.body(ApiErrorResponses.ofCurrentRequest(error.getCode(), error.getMessage()));
	}
}
