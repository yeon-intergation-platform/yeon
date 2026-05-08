package world.yeon.backend.chat_service_my_profile.dto;

import java.util.UUID;

public record ChatServiceMyProfileDetailResponse(
	UUID id,
	String phoneNumberMasked,
	String nickname,
	String ageLabel,
	String regionLabel,
	String avatarUrl,
	String bio,
	int points,
	boolean notificationsEnabled
) {}
