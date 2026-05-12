export const typingServiceQueryKeys = {
  characterFrames: () => ["typing-character-frames"] as const,
  activeCharacterFrameOverrides: () =>
    ["typing-service", "character-frames", "active-overrides"] as const,
  publicWaitingRooms: () =>
    ["typing-service", "room-lobby", "public-waiting"] as const,
};
