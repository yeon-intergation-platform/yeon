package world.yeon.backend.chat_service_reports.controller;

import java.util.UUID;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RestController;
import world.yeon.backend.chat_service_reports.dto.ChatServiceCreateReportResponse;
import world.yeon.backend.chat_service_reports.service.ChatServiceReportService;

@RestController
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

	public record CreateReportRequest(String targetType, String targetId, String reason) {}
}
