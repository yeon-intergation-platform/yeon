package world.yeon.backend.chat_service_my_profile.service;

import static world.yeon.backend.chat_service_my_profile.mapper.ChatServiceMyProfileMapper.*;

import java.util.UUID;
import org.springframework.context.annotation.Profile;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import world.yeon.backend.chat_service_my_profile.dto.*;
import world.yeon.backend.chat_service_my_profile.repository.ChatServiceMyProfileRepository;

@Service
@Profile("jdbc")
public class ChatServiceMyProfileService {
	private final ChatServiceMyProfileRepository repository;

	public ChatServiceMyProfileService(ChatServiceMyProfileRepository repository) {
		this.repository = repository;
	}

	@Transactional(readOnly = true)
	public ChatServiceGetMyProfileResponse get(UUID currentProfileId) {
		var profile = repository.findProfile(currentProfileId);
		if (profile == null) {
			throw new ChatServiceMyProfileServiceException(404, "CHAT_SERVICE_PROFILE_NOT_FOUND", "프로필을 찾지 못했습니다.");
		}
		return toGetResponse(profile, repository.listBlockedProfiles(currentProfileId), repository.listReports(currentProfileId));
	}

	@Transactional
	public ChatServiceUpdateMyProfileResponse update(UUID currentProfileId, String nickname, String ageLabel, String regionLabel, String bio, boolean notificationsEnabled) {
		var profile = repository.updateProfile(currentProfileId, nickname, ageLabel, regionLabel, bio, notificationsEnabled);
		if (profile == null) {
			throw new ChatServiceMyProfileServiceException(404, "CHAT_SERVICE_PROFILE_NOT_FOUND", "프로필을 찾지 못했습니다.");
		}
		return toUpdateResponse(profile);
	}

	@Transactional
	public ChatServiceDeleteMyProfileResponse delete(UUID currentProfileId) {
		if (!repository.deleteProfile(currentProfileId)) {
			throw new ChatServiceMyProfileServiceException(404, "CHAT_SERVICE_PROFILE_NOT_FOUND", "프로필을 찾지 못했습니다.");
		}
		return toDeleteResponse();
	}
}
