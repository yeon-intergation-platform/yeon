import { NextResponse, type NextRequest } from "next/server";
import { TERRITORY_BATTLE_TEAM } from "@yeon/race-shared";
import { jsonError } from "@/app/api/v1/counseling-records/_shared";
import { getCurrentAdminUser } from "@/server/auth/admin";

export const runtime = "nodejs";

const TEAM_TARGETS = new Set([
  "balanced",
  TERRITORY_BATTLE_TEAM.RED,
  TERRITORY_BATTLE_TEAM.BLUE,
]);

type SeedRequestBody = {
  roomId?: unknown;
  count?: unknown;
  team?: unknown;
};

function resolveRaceServerInternalUrl() {
  const explicit =
    process.env.RACE_SERVER_INTERNAL_URL?.trim() ||
    process.env.YEON_RACE_SERVER_INTERNAL_URL?.trim();
  if (explicit) {
    return explicit.replace(/\/$/, "");
  }

  const publicUrl =
    process.env.NEXT_PUBLIC_RACE_SERVER_URL?.trim() || "ws://localhost:2567";
  return publicUrl
    .replace(/^wss:\/\//, "https://")
    .replace(/^ws:\/\//, "http://")
    .replace(/\/$/, "");
}

function parseSeedRequestBody(body: SeedRequestBody) {
  const roomId = typeof body.roomId === "string" ? body.roomId.trim() : "";
  if (!roomId) {
    throw new Error("타자방 ID를 입력해 주세요.");
  }

  const count = Number(body.count);
  if (!Number.isInteger(count) || count < 1 || count > 4) {
    throw new Error("추가 인원은 1명부터 4명까지 선택할 수 있습니다.");
  }

  const team = typeof body.team === "string" ? body.team : "balanced";
  if (!TEAM_TARGETS.has(team)) {
    throw new Error("팀 선택 값이 올바르지 않습니다.");
  }

  return {
    roomId,
    count,
    team:
      team === TERRITORY_BATTLE_TEAM.RED || team === TERRITORY_BATTLE_TEAM.BLUE
        ? team
        : undefined,
  };
}

async function parseRaceServerError(response: Response) {
  try {
    const body = (await response.json()) as {
      message?: string;
      error?: string;
    };
    return body.message ?? body.error ?? "연습 참가자 추가에 실패했습니다.";
  } catch {
    return "연습 참가자 추가에 실패했습니다.";
  }
}

export async function POST(request: NextRequest) {
  const admin = await getCurrentAdminUser();
  if (!admin) {
    return jsonError("관리자 권한이 필요합니다.", 403);
  }

  let parsed;
  try {
    parsed = parseSeedRequestBody((await request.json()) as SeedRequestBody);
  } catch (error) {
    return jsonError(
      error instanceof Error ? error.message : "요청 형식이 올바르지 않습니다.",
      400
    );
  }

  const headers: Record<string, string> = {
    "content-type": "application/json",
  };
  const internalToken =
    process.env.STAR_LOBBY_INTERNAL_TOKEN?.trim() ||
    process.env.SPRING_INTERNAL_TOKEN?.trim();
  if (internalToken) {
    headers["x-yeon-internal-token"] = internalToken;
  }

  try {
    const response = await fetch(
      `${resolveRaceServerInternalUrl()}/internal/typing-rooms/${encodeURIComponent(
        parsed.roomId
      )}/team-participants`,
      {
        method: "POST",
        headers,
        body: JSON.stringify({
          count: parsed.count,
          team: parsed.team,
        }),
      }
    );

    if (!response.ok) {
      return jsonError(await parseRaceServerError(response), response.status);
    }

    return NextResponse.json(await response.json());
  } catch (error) {
    console.error("[admin-typing-room] 연습 참가자 추가 실패", error);
    return jsonError("race-server에 연결하지 못했습니다.", 502);
  }
}
