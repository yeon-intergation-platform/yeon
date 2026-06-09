import http, { type IncomingMessage } from "node:http";
import { WebSocketTransport } from "@colyseus/ws-transport";
import { Server, matchMaker } from "@colyseus/core";
import {
  CARD_ROOM_NAME,
  STAR_LOBBY_ROOM_NAME,
  TYPING_RACE_ROOM_NAME,
  TERRITORY_BATTLE_ROOM_NAME,
} from "@yeon/race-shared";
import { TypingRaceRoom } from "./rooms/typing-race-room";
import { TerritoryBattleRoom } from "./rooms/territory-battle-room";
import { CardRoom } from "./rooms/card-room";
import {
  parseStarLobbyRealtimeEvent,
  publishStarLobbyRealtimeEvent,
  StarLobbyRoom,
} from "./rooms/star-lobby-room";

const port = Number(process.env.PORT || 2567);

type JsonResponse = {
  json: (body: unknown) => void;
  status: (code: number) => JsonResponse;
};

type TextResponse = {
  type: (contentType: string) => TextResponse;
  send: (body: string) => void;
};

type RoomsRequest = {
  params: { roomName?: string };
};

const server = http.createServer();

function readJsonBody(request: IncomingMessage) {
  return new Promise<unknown>((resolve, reject) => {
    let body = "";
    request.setEncoding("utf8");
    request.on("data", (chunk: string) => {
      body += chunk;
      if (body.length > 1_000_000) {
        reject(new Error("요청 본문이 너무 큽니다."));
        request.destroy();
      }
    });
    request.on("end", () => {
      if (!body.trim()) {
        resolve(null);
        return;
      }
      try {
        resolve(JSON.parse(body));
      } catch (error) {
        reject(
          new Error("JSON 요청 본문을 해석하지 못했습니다.", { cause: error })
        );
      }
    });
    request.on("error", reject);
  });
}

function isInternalRequest(request: IncomingMessage) {
  const expected =
    process.env.STAR_LOBBY_INTERNAL_TOKEN?.trim() ||
    process.env.SPRING_INTERNAL_TOKEN?.trim();
  if (!expected) return true;
  const actual = request.headers["x-yeon-internal-token"];
  return actual === expected;
}

const gameServer = new Server({
  transport: new WebSocketTransport({
    server,
  }),
  express: (app) => {
    app.get("/health", (_request: unknown, response: JsonResponse) => {
      response.json({
        ok: true,
        rooms: [
          TYPING_RACE_ROOM_NAME,
          TERRITORY_BATTLE_ROOM_NAME,
          CARD_ROOM_NAME,
          STAR_LOBBY_ROOM_NAME,
        ],
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

    app.post(
      "/internal/star-lobby/events",
      async (request: IncomingMessage, response: JsonResponse) => {
        if (!isInternalRequest(request)) {
          response.status(401).json({
            ok: false,
            message: "스타 로비 내부 이벤트 권한이 없습니다.",
          });
          return;
        }

        try {
          const event = parseStarLobbyRealtimeEvent(
            await readJsonBody(request)
          );
          if (!event) {
            response.status(400).json({
              ok: false,
              message: "스타 로비 이벤트 형식이 올바르지 않습니다.",
            });
            return;
          }
          response.json({
            ok: true,
            ...publishStarLobbyRealtimeEvent(event),
          });
        } catch (error) {
          response.status(400).json({
            ok: false,
            message:
              error instanceof Error
                ? error.message
                : "스타 로비 이벤트 전송에 실패했습니다.",
          });
        }
      }
    );

    app.get("/", (_request: unknown, response: TextResponse) => {
      response.type("text/plain; charset=utf-8");
      response.send("yeon realtime room server");
    });
  },
});

// locale + roomMode별 룸 풀 분리 (빠른 레이스와 로비 타자방 섞임 방지)
gameServer
  .define(TYPING_RACE_ROOM_NAME, TypingRaceRoom)
  .filterBy(["locale", "roomMode"]);
gameServer
  .define(TERRITORY_BATTLE_ROOM_NAME, TerritoryBattleRoom)
  .filterBy(["sourceRoomId"]);
gameServer.define(CARD_ROOM_NAME, CardRoom).filterBy(["cardRoomId"]);
gameServer.define(STAR_LOBBY_ROOM_NAME, StarLobbyRoom);

await gameServer.listen(port, "0.0.0.0");
console.log(`yeon realtime room server listening on ${port}`);

// Colyseus' ESM bootstrap can become quiescent in local `tsx` runs before a
// browser connects. Keep a tiny active handle so Playwright/local dev servers
// remain reachable after the "listening" log line.
setInterval(() => undefined, 60_000);
