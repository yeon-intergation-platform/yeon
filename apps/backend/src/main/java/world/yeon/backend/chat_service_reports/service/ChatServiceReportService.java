package world.yeon.backend.chat_service_reports.service;

import java.util.Set;
import java.util.UUID;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import world.yeon.backend.chat_service_reports.dto.ChatServiceCreateReportResponse;
import world.yeon.backend.chat_service_reports.dto.ChatServiceReportResponse;
import world.yeon.backend.chat_service_reports.repository.ChatServiceReportRepository;

@Service
public class ChatServiceReportService {
	private static final Set<String> TARGET_TYPES = Set.of("feed_post", "ask_post", "profile", "chat_message");
	private final ChatServiceReportRepository repository;

	public ChatServiceReportService(ChatServiceReportRepository repository) {
		this.repository = repository;
	}

	@Transactional
	public ChatServiceCreateReportResponse create(UUID currentProfileId, String targetType, String targetId, String reason) {
		if (!TARGET_TYPES.contains(targetType)) {
			throw new ChatServiceReportServiceException(400, "CHAT_SERVICE_REPORT_TARGET_INVALID", "신고 요청값이 올바르지 않습니다.");
		}
		switch (targetType) {
			case "feed_post" -> {
				if (!repository.existsFeedPost(targetId)) throw new ChatServiceReportServiceException(404, "CHAT_SERVICE_REPORT_FEED_NOT_FOUND", "신고 대상 피드 글을 찾지 못했습니다.");
			}
			case "ask_post" -> {
				if (!repository.existsAskPost(targetId)) throw new ChatServiceReportServiceException(404, "CHAT_SERVICE_REPORT_ASK_NOT_FOUND", "신고 대상 에스크 글을 찾지 못했습니다.");
			}
			case "profile" -> {
				if (!repository.existsProfile(UUID.fromString(targetId))) throw new ChatServiceReportServiceException(404, "CHAT_SERVICE_REPORT_PROFILE_NOT_FOUND", "신고 대상 프로필을 찾지 못했습니다.");
			}
			case "chat_message" -> {
				var room = repository.findMessageRoom(targetId);
				if (room == null) throw new ChatServiceReportServiceException(404, "CHAT_SERVICE_REPORT_MESSAGE_NOT_FOUND", "신고 대상 메시지를 찾지 못했습니다.");
				if (!room.userAId().equals(currentProfileId) && !room.userBId().equals(currentProfileId)) throw new ChatServiceReportServiceException(403, "CHAT_SERVICE_REPORT_ROOM_FORBIDDEN", "참여 중인 대화방의 메시지만 신고할 수 있습니다.");
			}
		}
		var report = repository.insertReport(UUID.randomUUID(), currentProfileId, targetType, targetId, reason);
		return new ChatServiceCreateReportResponse(new ChatServiceReportResponse(report.id().toString(), report.targetType(), report.targetId(), report.reason(), report.status(), report.createdAt().toString()));
	}
}
