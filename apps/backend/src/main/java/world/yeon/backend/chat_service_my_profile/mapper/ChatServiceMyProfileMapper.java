package world.yeon.backend.chat_service_my_profile.mapper;

import java.util.List;
import world.yeon.backend.chat_service_my_profile.dto.*;
import world.yeon.backend.chat_service_my_profile.repository.ChatServiceMyProfileRepository;

public final class ChatServiceMyProfileMapper {
	private ChatServiceMyProfileMapper() {}

	public static ChatServiceGetMyProfileResponse toGetResponse(
		ChatServiceMyProfileRepository.ProfileRow profile,
		List<ChatServiceMyProfileRepository.SummaryRow> blockedProfiles,
		List<ChatServiceMyProfileRepository.ReportRow> reports
	) {
		return new ChatServiceGetMyProfileResponse(
			toDetail(profile),
			blockedProfiles.stream().map(ChatServiceMyProfileMapper::toSummary).toList(),
			reports.stream().map(ChatServiceMyProfileMapper::toReport).toList()
		);
	}

	public static ChatServiceUpdateMyProfileResponse toUpdateResponse(ChatServiceMyProfileRepository.ProfileRow profile) {
		return new ChatServiceUpdateMyProfileResponse(toDetail(profile));
	}

	public static ChatServiceDeleteMyProfileResponse toDeleteResponse() {
		return new ChatServiceDeleteMyProfileResponse(true);
	}

	private static ChatServiceMyProfileDetailResponse toDetail(ChatServiceMyProfileRepository.ProfileRow row) {
		return new ChatServiceMyProfileDetailResponse(
			row.id(),
			mask(row.phoneNumber()),
			row.nickname(),
			row.ageLabel(),
			row.regionLabel(),
			row.avatarUrl(),
			row.bio(),
			row.points(),
			row.notificationsEnabled()
		);
	}

	private static ChatServiceMyProfileSummaryResponse toSummary(ChatServiceMyProfileRepository.SummaryRow row) {
		return new ChatServiceMyProfileSummaryResponse(row.id(), row.nickname(), row.ageLabel(), row.regionLabel(), row.avatarUrl(), row.bio(), row.points());
	}

	private static ChatServiceMyReportResponse toReport(ChatServiceMyProfileRepository.ReportRow row) {
		return new ChatServiceMyReportResponse(row.id(), row.targetType(), row.targetId(), row.reason(), row.status(), row.createdAt());
	}

	private static String mask(String phoneNumber) {
		if (phoneNumber == null || phoneNumber.length() < 8) return phoneNumber;
		return phoneNumber.substring(0, 3) + "-" + phoneNumber.substring(3, 5) + "**-" + phoneNumber.substring(phoneNumber.length() - 4);
	}
}
