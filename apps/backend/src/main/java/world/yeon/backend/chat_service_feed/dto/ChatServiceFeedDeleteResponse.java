package world.yeon.backend.chat_service_feed.dto;

import java.util.UUID;

public record ChatServiceFeedDeleteResponse(boolean deleted, UUID postId) {}
