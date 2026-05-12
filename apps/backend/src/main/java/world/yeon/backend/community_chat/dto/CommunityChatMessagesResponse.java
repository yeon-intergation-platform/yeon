package world.yeon.backend.community_chat.dto;

import java.util.List;

public record CommunityChatMessagesResponse(List<CommunityChatMessageResponse> messages) {}
