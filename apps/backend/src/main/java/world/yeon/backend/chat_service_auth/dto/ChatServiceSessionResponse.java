package world.yeon.backend.chat_service_auth.dto;

import java.time.OffsetDateTime;

public record ChatServiceSessionResponse(String token, OffsetDateTime expiresAt, ChatServiceSessionUserResponse user) {}
