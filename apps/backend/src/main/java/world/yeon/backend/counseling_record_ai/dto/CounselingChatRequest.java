package world.yeon.backend.counseling_record_ai.dto;

import java.util.List;

public record CounselingChatRequest(List<CounselingChatMessageRequest> messages, Boolean useWebSearch) {
	public boolean shouldUseWebSearch() {
		return Boolean.TRUE.equals(useWebSearch);
	}
}
