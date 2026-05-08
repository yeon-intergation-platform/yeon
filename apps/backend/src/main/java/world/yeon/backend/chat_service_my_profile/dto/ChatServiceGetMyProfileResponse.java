package world.yeon.backend.chat_service_my_profile.dto;

import java.util.List;

public record ChatServiceGetMyProfileResponse(
	ChatServiceMyProfileDetailResponse profile,
	List<ChatServiceMyProfileSummaryResponse> blockedProfiles,
	List<ChatServiceMyReportResponse> reports
) {}
