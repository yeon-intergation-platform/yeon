"use client";
import { TERRITORY_BATTLE_TEAM } from "@yeon/race-shared";
import {
  fetchYeon,
  type YeonResponse,
} from "@yeon/ui/runtime/YeonBrowserRuntime";

export const ADMIN_TEAM_TARGET = {
  BALANCED: "balanced",
  RED: TERRITORY_BATTLE_TEAM.RED,
  BLUE: TERRITORY_BATTLE_TEAM.BLUE,
} as const;

export type AdminTeamTarget =
  (typeof ADMIN_TEAM_TARGET)[keyof typeof ADMIN_TEAM_TARGET];

export type TypingRoomTeamParticipantsSeedInput = {
  roomId: string;
  count: number;
  team: AdminTeamTarget;
};

export type TypingRoomTeamParticipantsSeedResult = {
  ok: boolean;
  message: string;
  insertedCount: number;
  snapshot?: {
    currentParticipants: number;
    maxParticipants: number;
    roomCode: string;
    title: string;
  };
};

async function parseSeedError(response: YeonResponse) {
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

export async function seedTypingRoomTeamParticipants(
  input: TypingRoomTeamParticipantsSeedInput
): Promise<TypingRoomTeamParticipantsSeedResult> {
  const response = await fetchYeon(
    "/api/v1/admin/typing-rooms/team-participants",
    {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(input),
    }
  );

  if (!response.ok) {
    throw new Error(await parseSeedError(response));
  }

  return (await response.json()) as TypingRoomTeamParticipantsSeedResult;
}
