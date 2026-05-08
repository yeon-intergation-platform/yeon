package world.yeon.backend.chat_service_reports.controller;

import java.util.UUID;
import org.springframework.context.annotation.Profile;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RestController;
import world.yeon.backend.chat_service_reports.dto.ChatServiceCreateReportResponse;
import world.yeon.backend.chat_service_reports.service.ChatServiceReportService;
import world.yeon.backend.chat_service_reports.service.ChatServiceReportServiceException;

@RestController
@Profile("jdbc")
public class ChatServiceReportController {
	private final ChatServiceReportService service;

	public ChatServiceReportController(ChatServiceReportService service) {
		this.service = service;
	}

	@PostMapping("/chat-service/reports")
	public ChatServiceCreateReportResponse create(
		@RequestHeader("X-Yeon-Chat-Profile-Id") UUID currentProfileId,
		@RequestBody CreateReportRequest request
	) {
		return service.create(currentProfileId, request.targetType(), request.targetId(), request.reason());
	}

	@ExceptionHandler(ChatServiceReportServiceException.class)
	public ResponseEntity<ErrorResponse> handleServiceError(ChatServiceReportServiceException error) {
		return ResponseEntity.status(error.status()).body(new ErrorResponse(error.code(), error.getMessage()));
	}

	public record CreateReportRequest(String targetType, String targetId, String reason) {}
	public record ErrorResponse(String code, String message) {}
}
