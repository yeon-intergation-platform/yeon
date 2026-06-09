import { loadPublicWaitingTypingRooms } from "./typing-service-fetch";
import { resolveRaceServerUrl } from "./use-race-room";

export async function loadTypingRoomLobbyRooms() {
  const endpoint = resolveRaceServerUrl().replace(/^ws/, "http");
  return loadPublicWaitingTypingRooms(endpoint);
}
