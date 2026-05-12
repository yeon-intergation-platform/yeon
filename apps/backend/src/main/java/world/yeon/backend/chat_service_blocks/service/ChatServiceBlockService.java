package world.yeon.backend.chat_service_blocks.service;

import java.util.UUID;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import world.yeon.backend.chat_service_blocks.dto.ChatServiceBlockProfilesResponse;
import world.yeon.backend.chat_service_blocks.dto.ChatServiceProfileSummaryResponse;
import world.yeon.backend.chat_service_blocks.repository.ChatServiceBlockRepository;

@Service
public class ChatServiceBlockService {
	private final ChatServiceBlockRepository repository;

	public ChatServiceBlockService(ChatServiceBlockRepository repository) {
		this.repository = repository;
	}

	@Transactional
	public ChatServiceBlockProfilesResponse block(UUID currentProfileId, UUID targetProfileId) {
		if (currentProfileId.equals(targetProfileId)) {
			throw new ChatServiceBlockServiceException(400, "CHAT_SERVICE_SELF_BLOCK", "자기 자신은 차단할 수 없습니다.");
		}
		if (!repository.existsProfile(targetProfileId)) {
			throw new ChatServiceBlockServiceException(404, "CHAT_SERVICE_BLOCK_TARGET_NOT_FOUND", "차단 대상 프로필을 찾지 못했습니다.");
		}
		if (!repository.existsBlock(currentProfileId, targetProfileId)) {
			repository.insertBlock(UUID.randomUUID(), currentProfileId, targetProfileId);
		}
		repository.deleteFriendLinksBetween(currentProfileId, targetProfileId);
		return new ChatServiceBlockProfilesResponse(
			repository.listBlockedProfiles(currentProfileId).stream().map(this::toSummary).toList()
		);
	}

	@Transactional
	public ChatServiceBlockProfilesResponse unblock(UUID currentProfileId, UUID targetProfileId) {
		if (!repository.existsProfile(targetProfileId)) {
			throw new ChatServiceBlockServiceException(404, "CHAT_SERVICE_UNBLOCK_TARGET_NOT_FOUND", "차단 해제 대상 프로필을 찾지 못했습니다.");
		}
		repository.deleteBlock(currentProfileId, targetProfileId);
		return new ChatServiceBlockProfilesResponse(
			repository.listBlockedProfiles(currentProfileId).stream().map(this::toSummary).toList()
		);
	}

	private ChatServiceProfileSummaryResponse toSummary(ChatServiceBlockRepository.ProfileRow row) {
		return new ChatServiceProfileSummaryResponse(
			row.id().toString(),
			row.nickname(),
			row.ageLabel(),
			row.regionLabel(),
			row.avatarUrl(),
			row.bio(),
			row.points()
		);
	}
}
