import http from "node:http";
import { WebSocketTransport } from "@colyseus/ws-transport";
import { Server, matchMaker } from "@colyseus/core";
import { CARD_ROOM_NAME, TYPING_RACE_ROOM_NAME } from "@yeon/race-shared";
import { TypingRaceRoom } from "./rooms/typing-race-room";
import { CardRoom } from "./rooms/card-room";

const port = Number(process.env.PORT || 2567);

type JsonResponse = {
  json: (body: unknown) => void;
};

type TextResponse = {
  type: (contentType: string) => TextResponse;
  send: (body: string) => void;
};

type RoomsRequest = {
  params: { roomName?: string };
};

const server = http.createServer();

const gameServer = new Server({
  transport: new WebSocketTransport({
    server,
  }),
  express: (app) => {
    app.get("/health", (_request: unknown, response: JsonResponse) => {
      response.json({
        ok: true,
        rooms: [TYPING_RACE_ROOM_NAME, CARD_ROOM_NAME],
      });
    });

    app.get(
      "/rooms/:roomName",
      async (request: RoomsRequest, response: JsonResponse) => {
        const rooms = await matchMaker.query({
          name: request.params.roomName ?? TYPING_RACE_ROOM_NAME,
          locked: false,
          private: false,
        });
        response.json(rooms);
      }
    );

    app.get("/", (_request: unknown, response: TextResponse) => {
      response.type("text/plain; charset=utf-8");
      response.send("typing-race room server");
    });
  },
});

// locale + roomMode별 룸 풀 분리 (빠른 레이스와 로비 타자방 섞임 방지)
gameServer
  .define(TYPING_RACE_ROOM_NAME, TypingRaceRoom)
  .filterBy(["locale", "roomMode"]);
gameServer.define(CARD_ROOM_NAME, CardRoom).filterBy(["cardRoomId"]);

await gameServer.listen(port, "0.0.0.0");
console.log(`typing-race room server listening on ${port}`);

// Colyseus' ESM bootstrap can become quiescent in local `tsx` runs before a
// browser connects. Keep a tiny active handle so Playwright/local dev servers
// remain reachable after the "listening" log line.
setInterval(() => undefined, 60_000);
