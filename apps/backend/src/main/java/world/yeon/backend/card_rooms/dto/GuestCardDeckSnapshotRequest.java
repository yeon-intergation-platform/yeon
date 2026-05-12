package world.yeon.backend.card_rooms.dto;
import java.util.List;
public record GuestCardDeckSnapshotRequest(String title, List<GuestCardSnapshotItemRequest> items) {}
