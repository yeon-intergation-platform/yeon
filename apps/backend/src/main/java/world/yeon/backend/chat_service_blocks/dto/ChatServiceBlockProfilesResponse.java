package world.yeon.backend.chat_service_blocks.dto;

import java.util.List;

public record ChatServiceBlockProfilesResponse(List<ChatServiceProfileSummaryResponse> blockedProfiles) {}
