package world.yeon.backend.chat_service_profiles.service;

import java.util.UUID;
import org.springframework.context.annotation.Profile;
import org.springframework.stereotype.Service;
import world.yeon.backend.chat_service_profiles.dto.ChatServiceGetProfileResponse;
import world.yeon.backend.chat_service_profiles.dto.ChatServicePublicProfileResponse;
import world.yeon.backend.chat_service_profiles.repository.ChatServiceProfileReadRepository;

@Service
@Profile("jdbc")
public class ChatServiceProfileReadService {
	private final ChatServiceProfileReadRepository repository;

	public ChatServiceProfileReadService(ChatServiceProfileReadRepository repository) {
		this.repository = repository;
	}

	public ChatServiceGetProfileResponse getProfile(UUID currentProfileId, UUID targetProfileId) {
		ChatServiceProfileReadRepository.ProfileRow profile = repository.findProfileById(targetProfileId);
		if (profile == null) {
			throw new ChatServiceProfileReadServiceException(404, "CHAT_SERVICE_PROFILE_NOT_FOUND", "프로필을 찾지 못했습니다.");
		}
		if (!currentProfileId.equals(targetProfileId) && repository.hasBlockedRelation(currentProfileId, targetProfileId)) {
			throw new ChatServiceProfileReadServiceException(403, "CHAT_SERVICE_BLOCKED_RELATION", "차단 관계에서는 이 작업을 수행할 수 없습니다.");
		}
		return new ChatServiceGetProfileResponse(new ChatServicePublicProfileResponse(
			profile.id().toString(),
			profile.nickname(),
			profile.ageLabel(),
			profile.regionLabel(),
			profile.avatarUrl(),
			profile.bio(),
			profile.points()
		));
	}
}
