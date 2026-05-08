package world.yeon.backend.chat_service_feed.dto;

import java.util.List;

public record ChatServiceFeedListResponse(List<ChatServiceFeedPostResponse> posts) {}
