package world.yeon.backend.user_profile.service;

import java.util.UUID;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;
import world.yeon.backend.user_profile.dto.UserProfileResponse;
import world.yeon.backend.user_profile.repository.UserProfileRepository;
import world.yeon.backend.user_profile.repository.UserProfileRepository.ProfileRow;

@Service
public class UserProfileService {
	private static final int MAX_DISPLAY_NAME_LENGTH = 80;
	private static final int MAX_AVATAR_URL_LENGTH = 2048;

	private final UserProfileRepository repository;

	public UserProfileService(UserProfileRepository repository) {
		this.repository = repository;
	}

	@Transactional(readOnly = true)
	public UserProfileResponse get(UUID userId) {
		return toResponse(requireProfile(userId));
	}

	@Transactional
	public UserProfileResponse update(UUID userId, String displayName, String avatarUrl) {
		if (userId == null) {
			throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "로그인이 필요합니다.");
		}
		String normalizedName = displayName == null ? "" : displayName.trim();
		if (normalizedName.isEmpty() || normalizedName.length() > MAX_DISPLAY_NAME_LENGTH) {
			throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
				"닉네임은 1~" + MAX_DISPLAY_NAME_LENGTH + "자여야 합니다.");
		}
		String normalizedAvatar = avatarUrl == null ? null : avatarUrl.trim();
		if (normalizedAvatar != null) {
			if (normalizedAvatar.isEmpty()) {
				normalizedAvatar = null;
			} else if (normalizedAvatar.length() > MAX_AVATAR_URL_LENGTH || !normalizedAvatar.matches("https?://.+")) {
				throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "프로필 사진 주소가 올바르지 않습니다.");
			}
		}

		ProfileRow row = repository.updateProfile(userId, normalizedName, normalizedAvatar);
		if (row == null) {
			throw new ResponseStatusException(HttpStatus.NOT_FOUND, "사용자를 찾을 수 없습니다.");
		}
		return toResponse(row);
	}

	private ProfileRow requireProfile(UUID userId) {
		if (userId == null) {
			throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "로그인이 필요합니다.");
		}
		ProfileRow row = repository.findProfile(userId);
		if (row == null) {
			throw new ResponseStatusException(HttpStatus.NOT_FOUND, "사용자를 찾을 수 없습니다.");
		}
		return row;
	}

	private static UserProfileResponse toResponse(ProfileRow row) {
		return new UserProfileResponse(row.id(), row.email(), row.displayName(), row.avatarUrl());
	}
}
