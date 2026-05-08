package world.yeon.backend.chat_service_auth.dto;

import java.time.OffsetDateTime;
import java.util.UUID;

public record ChatServiceRequestOtpResponse(UUID challengeId, OffsetDateTime expiresAt, boolean acceptAnyCode, String debugCode) {}
