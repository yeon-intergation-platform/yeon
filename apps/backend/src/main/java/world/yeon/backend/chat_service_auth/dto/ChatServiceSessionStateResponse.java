package world.yeon.backend.chat_service_auth.dto;

public record ChatServiceSessionStateResponse(boolean authenticated, ChatServiceSessionResponse session) {}
