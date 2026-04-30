import http from "node:http";
import { WebSocketTransport } from "@colyseus/ws-transport";
import { Server, matchMaker } from "colyseus";
import { TYPING_RACE_ROOM_NAME } from "@yeon/race-shared";
import { TypingRaceRoom } from "./rooms/typing-race-room";

const port = Number(process.env.PORT || 2567);
const server = http.createServer();

const gameServer = new Server({
  transport: new WebSocketTransport({
    server,
  }),
  express: (app) => {
    app.get("/health", (
      _request: unknown,
      response: { json: (body: unknown) => void },
    ) => {
      response.json({ ok: true, room: TYPING_RACE_ROOM_NAME });
    });

    app.get("/rooms/:roomName", async (
      request: { params: { roomName?: string } },
      response: { json: (body: unknown) => void },
    ) => {
      const rooms = await matchMaker.query({
        name: request.params.roomName ?? TYPING_RACE_ROOM_NAME,
        locked: false,
        private: false,
      });
      response.json(rooms);
    });
  },
});

// locale + roomMode별 룸 풀 분리 (빠른 레이스와 로비 타자방 섞임 방지)
gameServer.define(TYPING_RACE_ROOM_NAME, TypingRaceRoom).filterBy(["locale", "roomMode"]);

void gameServer.listen(port, "0.0.0.0", undefined, () => {
  console.log(`typing-race room server listening on ${port}`);
});
