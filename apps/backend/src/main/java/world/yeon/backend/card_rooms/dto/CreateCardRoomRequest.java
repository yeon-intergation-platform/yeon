package world.yeon.backend.card_rooms.dto;
public record CreateCardRoomRequest(String title, String visibility, String deckId, GuestCardDeckSnapshotRequest guestDeck, CardRoomProfileRequest profile) {}
