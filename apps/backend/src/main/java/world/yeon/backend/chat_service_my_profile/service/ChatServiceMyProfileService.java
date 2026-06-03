package world.yeon.backend.chat_service_my_profile.service;

import static world.yeon.backend.chat_service_my_profile.mapper.ChatServiceMyProfileMapper.*;

import java.util.UUID;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import world.yeon.backend.chat_service_my_profile.dto.*;
import world.yeon.backend.chat_service_my_profile.repository.ChatServiceMyProfileRepository;

@Service
public class ChatServiceMyProfileService {
	private static final int MAX_NICKNAME_LENGTH = 40;
	private static final int MAX_AGE_LABEL_LENGTH = 20;
	private static final int MAX_REGION_LABEL_LENGTH = 40;
	private static final int MAX_BIO_LENGTH = 160;
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
		String normalizedNickname = requireText(nickname, "닉네임", 1, MAX_NICKNAME_LENGTH);
		String normalizedAgeLabel = optionalText(ageLabel, "나이 정보", MAX_AGE_LABEL_LENGTH);
		String normalizedRegionLabel = optionalText(regionLabel, "지역 정보", MAX_REGION_LABEL_LENGTH);
		String normalizedBio = optionalText(bio, "소개", MAX_BIO_LENGTH);
		var profile = repository.updateProfile(currentProfileId, normalizedNickname, normalizedAgeLabel, normalizedRegionLabel, normalizedBio, notificationsEnabled);
		if (profile == null) {
			throw new ChatServiceMyProfileServiceException(404, "CHAT_SERVICE_PROFILE_NOT_FOUND", "프로필을 찾지 못했습니다.");
		}
		return toUpdateResponse(profile);
	}

	private String requireText(String value, String label, int min, int max) {
		if (value == null) {
			throw new ChatServiceMyProfileServiceException(400, "CHAT_SERVICE_PROFILE_INVALID", label + "을(를) 입력해 주세요.");
		}
		String normalized = value.trim();
		if (normalized.length() < min || normalized.length() > max) {
			throw new ChatServiceMyProfileServiceException(400, "CHAT_SERVICE_PROFILE_INVALID", label + "은(는) " + min + "자 이상 " + max + "자 이하로 입력해 주세요.");
		}
		return normalized;
	}

	private String optionalText(String value, String label, int max) {
		if (value == null) {
			return null;
		}
		String normalized = value.trim();
		if (normalized.isEmpty()) {
			return null;
		}
		if (normalized.length() > max) {
			throw new ChatServiceMyProfileServiceException(400, "CHAT_SERVICE_PROFILE_INVALID", label + "은(는) " + max + "자 이하로 입력해 주세요.");
		}
		return normalized;
	}

	@Transactional
	public ChatServiceDeleteMyProfileResponse delete(UUID currentProfileId) {
		if (!repository.deleteProfile(currentProfileId)) {
			throw new ChatServiceMyProfileServiceException(404, "CHAT_SERVICE_PROFILE_NOT_FOUND", "프로필을 찾지 못했습니다.");
		}
		return toDeleteResponse();
	}
}
