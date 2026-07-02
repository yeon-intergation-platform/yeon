package world.yeon.backend.space_templates.write.controller;

import java.util.NoSuchElementException;
import java.util.UUID;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.method.annotation.HandlerMethodValidationException;

import jakarta.validation.Valid;
import world.yeon.backend.space_templates.write.dto.CreateSpaceTemplateRequest;
import world.yeon.backend.space_templates.write.dto.SpaceTemplateMutationResponse;
import world.yeon.backend.space_templates.write.dto.UpdateSpaceTemplateRequest;
import world.yeon.backend.space_templates.write.service.SpaceTemplateWriteService;
import world.yeon.backend.common.error.ApiErrorResponse;
import world.yeon.backend.common.error.ApiErrorResponses;

@Validated
@RestController
@RequestMapping("/space-templates")
public class SpaceTemplateWriteController {

	private final SpaceTemplateWriteService service;

	public SpaceTemplateWriteController(SpaceTemplateWriteService service) {
		this.service = service;
	}

	@PostMapping
	public ResponseEntity<SpaceTemplateMutationResponse> createTemplate(
		@RequestHeader("X-Yeon-User-Id") UUID userId,
		@Valid @RequestBody CreateSpaceTemplateRequest request
	) {
		return ResponseEntity.status(HttpStatus.CREATED)
			.body(new SpaceTemplateMutationResponse(service.createTemplate(userId, request)));
	}

	@PatchMapping("/{templateId}")
	public SpaceTemplateMutationResponse updateTemplate(
		@PathVariable String templateId,
		@RequestHeader("X-Yeon-User-Id") UUID userId,
		@Valid @RequestBody UpdateSpaceTemplateRequest request
	) {
		return new SpaceTemplateMutationResponse(
			service.updateTemplate(templateId, userId, request)
		);
	}

	@DeleteMapping("/{templateId}")
	public ResponseEntity<Void> deleteTemplate(
		@PathVariable String templateId,
		@RequestHeader("X-Yeon-User-Id") UUID userId
	) {
		service.deleteTemplate(templateId, userId);
		return ResponseEntity.noContent().build();
	}

	@PostMapping("/{templateId}/duplicate")
	public ResponseEntity<SpaceTemplateMutationResponse> duplicateTemplate(
		@PathVariable String templateId,
		@RequestHeader("X-Yeon-User-Id") UUID userId
	) {
		return ResponseEntity.status(HttpStatus.CREATED)
			.body(new SpaceTemplateMutationResponse(service.duplicateTemplate(templateId, userId)));
	}

	@ExceptionHandler(NoSuchElementException.class)
	public ResponseEntity<ApiErrorResponse> handleNotFound(NoSuchElementException error) {
		return ResponseEntity.status(HttpStatus.NOT_FOUND)
			.body(ApiErrorResponses.ofCurrentRequest("SPACE_TEMPLATE_NOT_FOUND", error.getMessage()));
	}

	@ExceptionHandler(IllegalStateException.class)
	public ResponseEntity<ApiErrorResponse> handleForbidden(IllegalStateException error) {
		return ResponseEntity.status(HttpStatus.FORBIDDEN)
			.body(ApiErrorResponses.ofCurrentRequest("SPACE_TEMPLATE_FORBIDDEN", error.getMessage()));
	}

	@ExceptionHandler({
		IllegalArgumentException.class,
		MethodArgumentNotValidException.class,
		HandlerMethodValidationException.class
	})
	public ResponseEntity<ApiErrorResponse> handleBadRequest(Exception error) {
		String message = "요청 데이터가 올바르지 않습니다.";
		if (error instanceof IllegalArgumentException illegalArgumentException) {
			message = illegalArgumentException.getMessage();
		}
		return ResponseEntity.status(HttpStatus.BAD_REQUEST)
			.body(ApiErrorResponses.ofCurrentRequest("INVALID_REQUEST", message));
	}

}
