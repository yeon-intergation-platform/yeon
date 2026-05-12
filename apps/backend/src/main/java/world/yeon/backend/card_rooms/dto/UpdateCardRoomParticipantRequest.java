package world.yeon.backend.card_rooms.dto;
public record UpdateCardRoomParticipantRequest(CardRoomProfileRequest profile, String role, Boolean isReady) {}
