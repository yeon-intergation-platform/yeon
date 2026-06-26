import { beforeEach, describe, expect, it, vi } from "vitest";
import {
  TYPING_ROOM_LIFECYCLE,
  TYPING_ROOM_DIFFICULTY,
  TYPING_ROOM_GAME_TYPE,
  TYPING_ROOM_LANGUAGE,
  TYPING_ROOM_MODE,
  TYPING_ROOM_STATUS,
  TYPING_ROOM_TEXT_TYPE,
  TYPING_ROOM_VISIBILITY,
  type TypingRoomSummary,
} from "@yeon/race-shared";

const fetchYeon = vi.fn();

vi.mock("@yeon/ui/runtime/YeonBrowserRuntime", () => ({
  fetchYeon: (...args: unknown[]) => fetchYeon(...args),
}));

function createRoomSummary(
  override: Partial<TypingRoomSummary> = {}
): TypingRoomSummary {
  return {
    roomId: "room-1",
    roomCode: "ABC123",
    title: "공개방",
    status: TYPING_ROOM_STATUS.WAITING,
    lifecycle: TYPING_ROOM_LIFECYCLE.ACTIVE,
    visibility: TYPING_ROOM_VISIBILITY.PUBLIC,
    currentParticipants: 1,
    maxParticipants: 4,
    textType: TYPING_ROOM_TEXT_TYPE.SHORT,
    language: TYPING_ROOM_LANGUAGE.KO,
    difficulty: TYPING_ROOM_DIFFICULTY.NORMAL,
    roundCount: 1,
    mode: TYPING_ROOM_MODE.FINISH,
    gameType: TYPING_ROOM_GAME_TYPE.STANDARD,
    createdAt: 100,
    ...override,
  };
}

describe("typing-service-fetch", () => {
  beforeEach(() => {
    fetchYeon.mockReset();
  });

  it("공개 대기방 predicate는 공개/활성/waiting/참가자 존재 조건을 함께 검증한다", async () => {
    const { isPublicWaitingTypingRoomSummary } =
      await import("./typing-service-fetch");

    expect(isPublicWaitingTypingRoomSummary(createRoomSummary())).toBe(true);
    expect(
      isPublicWaitingTypingRoomSummary(
        createRoomSummary({ status: TYPING_ROOM_STATUS.FINISHED })
      )
    ).toBe(false);
    expect(
      isPublicWaitingTypingRoomSummary(
        createRoomSummary({ lifecycle: TYPING_ROOM_LIFECYCLE.CLOSED })
      )
    ).toBe(false);
    expect(
      isPublicWaitingTypingRoomSummary(
        createRoomSummary({ visibility: TYPING_ROOM_VISIBILITY.PRIVATE })
      )
    ).toBe(false);
    expect(
      isPublicWaitingTypingRoomSummary(
        createRoomSummary({ currentParticipants: 0 })
      )
    ).toBe(false);
  });

  it("공개 대기방 목록은 참가자 수를 0 이상 정수로 normalize하고 최신순으로 정렬한다", async () => {
    const { loadPublicWaitingTypingRooms } =
      await import("./typing-service-fetch");
    fetchYeon.mockResolvedValue({
      ok: true,
      json: async () => [
        {
          roomId: "old",
          clients: 1.8,
          maxClients: 4.2,
          metadata: createRoomSummary({ roomId: "metadata-old", createdAt: 1 }),
        },
        {
          roomId: "empty",
          clients: Number.NaN,
          maxClients: -1,
          metadata: createRoomSummary({
            roomId: "metadata-empty",
            createdAt: 3,
          }),
        },
        {
          roomId: "new",
          clients: 2,
          maxClients: 5,
          metadata: createRoomSummary({ roomId: "metadata-new", createdAt: 2 }),
        },
      ],
    });

    const rooms = await loadPublicWaitingTypingRooms("https://race.example");

    expect(rooms.map((room) => room.roomId)).toEqual(["new", "old"]);
    expect(rooms[0]?.currentParticipants).toBe(2);
    expect(rooms[1]?.currentParticipants).toBe(1);
    expect(rooms[1]?.maxParticipants).toBe(4);
  });

  it("오류 응답 JSON SyntaxError는 fallback 메시지로 변환한다", async () => {
    const { typingServiceFetchJson } = await import("./typing-service-fetch");
    fetchYeon.mockResolvedValue({
      ok: false,
      status: 500,
      text: async () => "{",
    });

    await expect(
      typingServiceFetchJson("/api/fail", {}, "fallback message")
    ).rejects.toMatchObject({
      name: "TypingServiceApiError",
      status: 500,
      message: "fallback message",
    });
  });

  it("오류 응답 JSON 파싱에서 SyntaxError가 아닌 예외는 숨기지 않는다", async () => {
    const { typingServiceFetchJson } = await import("./typing-service-fetch");
    const parseError = new Error("unexpected parser failure");
    const parseSpy = vi.spyOn(JSON, "parse").mockImplementation(() => {
      throw parseError;
    });
    fetchYeon.mockResolvedValue({
      ok: false,
      status: 500,
      text: async () => "{}",
    });

    await expect(
      typingServiceFetchJson("/api/fail", {}, "fallback message")
    ).rejects.toBe(parseError);

    parseSpy.mockRestore();
  });
});
