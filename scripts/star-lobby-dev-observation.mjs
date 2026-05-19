#!/usr/bin/env node

import { readFile } from "node:fs/promises";

const DEFAULT_BASE_URL = "http://127.0.0.1:8081";
const DEFAULT_ROOMS = [
  { title: "랜타디 초보 환영", currentPlayers: 3, maxPlayers: 6 },
  { title: "빨무 팀플 ㄱㄱ", currentPlayers: 5, maxPlayers: 8 },
  { title: "컴까기 헌터", currentPlayers: 4, maxPlayers: 7 },
];

function printHelp() {
  console.log(`스타 로비 개발용 관측 전송기

사용법:
  node scripts/star-lobby-dev-observation.mjs
  node scripts/star-lobby-dev-observation.mjs --room "랜타디 초보 3/6" --room "빨무 팀플 5/8"
  node scripts/star-lobby-dev-observation.mjs --room "랜타디 초보" --players 3/6
  node scripts/star-lobby-dev-observation.mjs --file ./sample-star-lobby.json
  node scripts/star-lobby-dev-observation.mjs --empty
  node scripts/star-lobby-dev-observation.mjs --dry-run --room "랜타디 초보 3/6"

환경변수:
  SPRING_BACKEND_BASE_URL   기본값: ${DEFAULT_BASE_URL}
  SPRING_INTERNAL_TOKEN     있으면 X-Yeon-Internal-Token으로 함께 전송

주의:
  이 스크립트는 OCR/스타 자동조작이 아닙니다. Spring 관측 API와 실시간 알림 파이프 검증용입니다.
  웹 실시간 알림까지 보려면 Spring 실행 환경에 STAR_LOBBY_REALTIME_EVENTS_URL을 race-server 내부 endpoint로 설정하세요.
`);
}

function parseArgs(argv) {
  const parsed = {
    dryRun: false,
    empty: false,
    file: null,
    observedAt: null,
    rooms: [],
  };

  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index];
    if (arg === "--help" || arg === "-h") {
      parsed.help = true;
      continue;
    }
    if (arg === "--dry-run") {
      parsed.dryRun = true;
      continue;
    }
    if (arg === "--empty") {
      parsed.empty = true;
      continue;
    }
    if (arg === "--file") {
      parsed.file = requireValue(argv, index, arg);
      index += 1;
      continue;
    }
    if (arg === "--observed-at") {
      parsed.observedAt = requireValue(argv, index, arg);
      index += 1;
      continue;
    }
    if (arg === "--room") {
      parsed.rooms.push(parseRoomText(requireValue(argv, index, arg)));
      index += 1;
      continue;
    }
    if (arg === "--players") {
      if (parsed.rooms.length === 0)
        throw new Error("--players 앞에 --room을 먼저 입력해 주세요.");
      const players = parsePlayers(requireValue(argv, index, arg));
      Object.assign(parsed.rooms.at(-1), players);
      index += 1;
      continue;
    }
    throw new Error(`알 수 없는 인자입니다: ${arg}`);
  }

  return parsed;
}

function requireValue(argv, index, name) {
  const value = argv[index + 1];
  if (!value || value.startsWith("--"))
    throw new Error(`${name} 값이 필요합니다.`);
  return value;
}

function parseRoomText(value) {
  const text = value.trim();
  if (!text) throw new Error("방제는 비어 있을 수 없습니다.");
  const players = text.match(/(?:^|\s)(\d{1,2})\s*\/\s*(\d{1,2})(?:\s|$)/);
  const title = players
    ? text.replace(players[0], " ").replace(/\s+/g, " ").trim()
    : text;
  return {
    title,
    ...parsePlayers(players ? `${players[1]}/${players[2]}` : null),
  };
}

function parsePlayers(value) {
  if (!value) return { currentPlayers: null, maxPlayers: null };
  const match = value.trim().match(/^(\d{1,2})\s*\/\s*(\d{1,2})$/);
  if (!match) throw new Error(`인원 형식은 3/6처럼 입력해 주세요: ${value}`);
  return {
    currentPlayers: Number(match[1]),
    maxPlayers: Number(match[2]),
  };
}

async function loadPayload(options) {
  if (options.empty) {
    return {
      observedAt: options.observedAt ?? new Date().toISOString(),
      rooms: [],
    };
  }

  if (options.file) {
    const raw = JSON.parse(await readFile(options.file, "utf8"));
    const rooms = Array.isArray(raw) ? raw : raw.rooms;
    return {
      observedAt:
        raw.observedAt ?? options.observedAt ?? new Date().toISOString(),
      rooms: normalizeRooms(rooms),
    };
  }

  const rooms = options.rooms.length > 0 ? options.rooms : DEFAULT_ROOMS;
  return {
    observedAt: options.observedAt ?? new Date().toISOString(),
    rooms: normalizeRooms(rooms),
  };
}

function normalizeRooms(rooms) {
  if (!Array.isArray(rooms)) throw new Error("rooms는 배열이어야 합니다.");
  return rooms.map((room, index) => {
    const title = String(room?.title ?? "").trim();
    if (!title) throw new Error(`${index + 1}번째 방의 title이 비어 있습니다.`);
    return {
      title,
      currentPlayers: nullableNumber(room.currentPlayers),
      maxPlayers: nullableNumber(room.maxPlayers),
      rawText: room.rawText == null ? null : String(room.rawText),
    };
  });
}

function nullableNumber(value) {
  if (value === undefined || value === null || value === "") return null;
  const number = Number(value);
  if (!Number.isInteger(number))
    throw new Error(`인원 값은 정수여야 합니다: ${value}`);
  return number;
}

async function main() {
  const options = parseArgs(process.argv.slice(2));
  if (options.help) {
    printHelp();
    return;
  }

  const baseUrl = (
    process.env.SPRING_BACKEND_BASE_URL || DEFAULT_BASE_URL
  ).replace(/\/$/, "");
  const payload = await loadPayload(options);
  if (options.dryRun) {
    console.log(JSON.stringify(payload, null, 2));
    return;
  }
  const headers = { "content-type": "application/json" };
  const token = process.env.SPRING_INTERNAL_TOKEN?.trim();
  if (token) headers["X-Yeon-Internal-Token"] = token;

  const response = await fetch(`${baseUrl}/api/v1/star-lobby/observations`, {
    method: "POST",
    headers,
    body: JSON.stringify(payload),
  });
  const text = await response.text();
  const body = text ? JSON.parse(text) : null;

  if (!response.ok) {
    console.error("스타 로비 관측 전송 실패", response.status, body ?? text);
    process.exitCode = 1;
    return;
  }

  const rooms = body?.rooms ?? [];
  const matches = body?.matches ?? [];
  console.log(
    `관측 전송 완료: rooms=${rooms.length}, matches=${matches.length}, observedAt=${body?.observedAt ?? payload.observedAt}`
  );
  for (const room of rooms) {
    const players =
      room.currentPlayers == null && room.maxPlayers == null
        ? "?/ ?"
        : `${room.currentPlayers ?? "?"}/${room.maxPlayers ?? "?"}`;
    console.log(`- ${room.title} (${players})`);
  }
  for (const match of matches) {
    console.log(
      `  match: rule=${match.ruleId} room=${match.roomId} keyword=${match.matchedKeyword ?? "-"}`
    );
  }
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exitCode = 1;
});
