package world.yeon.backend.typing_character_frames.dto;

import java.util.List;

public record UpdateTypingCharacterFrameOverrideRequest(List<TypingCharacterFrameSlotRequest> frameSlots) {}
