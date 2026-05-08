package world.yeon.backend.space_templates.write.controller;

import java.util.NoSuchElementException;
import java.util.UUID;

import org.springframework.context.annotation.Profile;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.method.annotation.HandlerMethodValidationException;

import jakarta.validation.Valid;
import world.yeon.backend.space_templates.write.dto.ApplySpaceTemplateRequest;
import world.yeon.backend.space_templates.write.service.SpaceTemplateWriteService;

@Validated
@RestController
@Profile("jdbc")
@RequestMapping("/spaces/{spaceId}/apply-template")
public class SpaceTemplateApplyController {

	private final SpaceTemplateWriteService service;

	public SpaceTemplateApplyController(SpaceTemplateWriteService service) {
		this.service = service;
	}

	@PostMapping
	public ResponseEntity<ApplyResponse> applyTemplate(
		@PathVariable String spaceId,
		@RequestHeader("X-Yeon-User-Id") UUID userId,
		@Valid @RequestBody ApplySpaceTemplateRequest request
	) {
		service.applyTemplateToSpace(request.templateId(), spaceId, userId);
		return ResponseEntity.ok(new ApplyResponse(true));
	}

	@ExceptionHandler(NoSuchElementException.class)
	public ResponseEntity<ErrorResponse> handleNotFound(NoSuchElementException error) {
		String code = error.getMessage() != null && error.getMessage().contains("스페이스")
			? "SPACE_NOT_FOUND"
			: "SPACE_TEMPLATE_NOT_FOUND";
		return ResponseEntity.status(HttpStatus.NOT_FOUND)
			.body(new ErrorResponse(code, error.getMessage()));
	}

	@ExceptionHandler({ IllegalArgumentException.class, MethodArgumentNotValidException.class, HandlerMethodValidationException.class })
	public ResponseEntity<ErrorResponse> handleBadRequest(Exception error) {
		String message = error instanceof IllegalArgumentException iae
			? iae.getMessage()
			: "요청 데이터가 올바르지 않습니다.";
		return ResponseEntity.status(HttpStatus.BAD_REQUEST)
			.body(new ErrorResponse("INVALID_REQUEST", message));
	}

	public record ApplyResponse(boolean ok) {
	}

	public record ErrorResponse(String code, String message) {
	}
}
