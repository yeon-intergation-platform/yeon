package world.yeon.backend.space_templates.read.controller;

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

import world.yeon.backend.space_templates.read.dto.SpaceTemplateItemResponse;
import world.yeon.backend.space_templates.read.dto.SpaceTemplateListResponse;
import world.yeon.backend.space_templates.read.service.SpaceTemplateReadService;

@Validated
@RestController
@RequestMapping("/space-templates")
public class SpaceTemplateReadController {

	private final SpaceTemplateReadService service;

	public SpaceTemplateReadController(SpaceTemplateReadService service) {
		this.service = service;
	}

	@GetMapping
	public SpaceTemplateListResponse listTemplates(
		@RequestHeader("X-Yeon-User-Id") UUID userId
	) {
		return new SpaceTemplateListResponse(service.listTemplates(userId));
	}

	@GetMapping("/{templateId}")
	public SpaceTemplateItemResponse getTemplate(
		@PathVariable String templateId,
		@RequestHeader("X-Yeon-User-Id") UUID userId
	) {
		return new SpaceTemplateItemResponse(
			service.getTemplateDetail(templateId, userId)
		);
	}

	@ExceptionHandler(NoSuchElementException.class)
	public ResponseEntity<ErrorResponse> handleNotFound(NoSuchElementException error) {
		return ResponseEntity.status(HttpStatus.NOT_FOUND)
			.body(new ErrorResponse("SPACE_TEMPLATE_NOT_FOUND", error.getMessage()));
	}

	@ExceptionHandler({ IllegalArgumentException.class })
	public ResponseEntity<ErrorResponse> handleBadRequest(RuntimeException error) {
		return ResponseEntity.status(HttpStatus.BAD_REQUEST)
			.body(new ErrorResponse("INVALID_REQUEST", error.getMessage()));
	}

	public record ErrorResponse(String code, String message) {
	}
}
