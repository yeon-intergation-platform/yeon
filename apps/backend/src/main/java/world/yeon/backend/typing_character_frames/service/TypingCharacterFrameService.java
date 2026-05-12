package world.yeon.backend.typing_character_frames.service;

import java.util.List;
import java.util.Set;
import java.util.UUID;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import world.yeon.backend.typing_character_frames.dto.*;
import world.yeon.backend.typing_character_frames.repository.TypingCharacterFrameRepository;

@Service
public class TypingCharacterFrameService {
	private static final String ADMIN_ROLE = "admin";
	private final TypingCharacterFrameRepository repository;
	private final Set<String> adminSeedEmails;

	public TypingCharacterFrameService(
		TypingCharacterFrameRepository repository,
		@Value("${YEON_ADMIN_EMAILS:${ADMIN_EMAILS:}}") String adminEmails
	) {
		this.repository = repository;
		this.adminSeedEmails = parseAdminSeedEmails(adminEmails);
	}

	public TypingCharacterFrameOverrideListResponse listOverrides() {
		return new TypingCharacterFrameOverrideListResponse(
			repository.listOverrides().stream().map(this::toResponse).toList()
		);
	}

	public TypingCharacterFrameOverrideMutationResponse updateOverride(UUID userId, String characterId, UpdateTypingCharacterFrameOverrideRequest request) {
		requireAdmin(userId);
		if (characterId == null || characterId.isBlank()) {
			throw new TypingCharacterFrameServiceException(400, "INVALID_CHARACTER_ID", "캐릭터 ID가 올바르지 않습니다.");
		}
		if (request == null || request.frameSlots() == null || request.frameSlots().isEmpty()) {
			repository.deleteOverride(characterId);
			return new TypingCharacterFrameOverrideMutationResponse(null);
		}

		List<TypingCharacterFrameSlotResponse> frameSlots = request.frameSlots().stream().map(this::toFrameSlot).toList();
		return new TypingCharacterFrameOverrideMutationResponse(
			toResponse(repository.upsertOverride(characterId, frameSlots, userId))
		);
	}

	private void requireAdmin(UUID userId) {
		if (userId == null) {
			throw new TypingCharacterFrameServiceException(403, "ADMIN_REQUIRED", "관리자 권한이 필요합니다.");
		}
		var user = repository.findUserAdminRow(userId);
		if (user == null) {
			throw new TypingCharacterFrameServiceException(403, "ADMIN_REQUIRED", "관리자 권한이 필요합니다.");
		}
		if (ADMIN_ROLE.equals(user.role()) || adminSeedEmails.contains(normalizeEmail(user.email()))) {
			return;
		}
		throw new TypingCharacterFrameServiceException(403, "ADMIN_REQUIRED", "관리자 권한이 필요합니다.");
	}

	private TypingCharacterFrameSlotResponse toFrameSlot(TypingCharacterFrameSlotRequest request) {
		if (request == null || request.frameIdx() == null || request.frameIdx() < 0 || request.enabled() == null) {
			throw new TypingCharacterFrameServiceException(400, "INVALID_FRAME_SLOT", "프레임 슬롯 값이 올바르지 않습니다.");
		}
		return new TypingCharacterFrameSlotResponse(request.frameIdx(), request.enabled());
	}

	private TypingCharacterFrameOverrideResponse toResponse(TypingCharacterFrameRepository.OverrideRow row) {
		return row == null ? null : new TypingCharacterFrameOverrideResponse(row.characterId(), row.frameSlots());
	}

	private static Set<String> parseAdminSeedEmails(String value) {
		if (value == null || value.isBlank()) return Set.of();
		return java.util.Arrays.stream(value.split(","))
			.map(TypingCharacterFrameService::normalizeEmail)
			.filter(email -> !email.isBlank())
			.collect(java.util.stream.Collectors.toUnmodifiableSet());
	}

	private static String normalizeEmail(String email) {
		return email == null ? "" : email.trim().toLowerCase(java.util.Locale.ROOT);
	}
}
