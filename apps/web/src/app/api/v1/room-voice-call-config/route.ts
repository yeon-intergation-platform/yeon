import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

type BooleanEnv = "true" | "1" | "yes" | "on";

const TRUE_VALUES = new Set<BooleanEnv>(["true", "1", "yes", "on"]);

function isEnabled(value: string | undefined) {
  return TRUE_VALUES.has(value?.trim().toLowerCase() as BooleanEnv);
}

export function GET() {
  const enabled =
    isEnabled(process.env.ROOM_VOICE_CALL_ENABLED) ||
    isEnabled(process.env.NEXT_PUBLIC_ENABLE_ROOM_VOICE_CALL);

  return NextResponse.json(
    { enabled },
    {
      headers: {
        "Cache-Control": "no-store, max-age=0",
      },
    }
  );
}
