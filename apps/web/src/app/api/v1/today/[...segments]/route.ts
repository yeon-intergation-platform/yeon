import { NextResponse, type NextRequest } from "next/server";
import { z } from "zod";
import {
  createTodayActivityTypeBodySchema,
  createTodayTaskBodySchema,
  todayActivityTypeResponseSchema,
  todayActivityTypesResponseSchema,
  todayBoardResponseSchema,
  todayCalendarResponseSchema,
  todayDateSchema,
  todayMonthSchema,
  todayRecordResponseSchema,
  todayTaskResponseSchema,
  transitionTodayTaskBodySchema,
  updateTodayActivityTypeBodySchema,
  updateTodayTaskBodySchema,
  upsertTodayRecordSlotBodySchema,
} from "@yeon/api-contract/today";

import {
  jsonError,
  requireAuthenticatedUser,
} from "@/app/api/v1/counseling-records/_shared";
import {
  requestTodaySpring,
  TodaySpringBackendHttpError,
} from "@/server/today-spring-client";

export const runtime = "nodejs";

type RouteContext = { params: Promise<{ segments: string[] }> };
type JsonSchema = {
  safeParse(input: unknown): { success: boolean; data?: unknown };
};

const uuidSchema = z.uuid();
const versionSchema = z
  .string()
  .regex(/^(0|[1-9]\d*)$/)
  .transform(Number)
  .refine(Number.isSafeInteger);
const hourSchema = z
  .string()
  .regex(/^(?:[0-9]|1\d|2[0-3])$/)
  .transform(Number);

type RouteContract = {
  springPath: string;
  requestSchema?: JsonSchema;
  responseSchema?: JsonSchema;
  emptyResponse?: boolean;
};

async function parseBody(request: NextRequest, schema?: JsonSchema) {
  if (!schema) return { body: undefined, error: null };
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return {
      body: undefined,
      error: jsonError("요청 본문이 올바른 JSON 형식이 아닙니다.", 400),
    };
  }
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return {
      body: undefined,
      error: jsonError("Today 요청 형식이 올바르지 않습니다.", 400),
    };
  }
  return { body: parsed.data, error: null };
}

function resolveContract(
  method: string,
  segments: string[],
  searchParams: URLSearchParams
): RouteContract | null {
  if (method === "GET" && segments.join("/") === "board") {
    const parsed = todayDateSchema.safeParse(searchParams.get("date"));
    return parsed.success
      ? {
          springPath: `/today/board?date=${encodeURIComponent(parsed.data)}`,
          responseSchema: todayBoardResponseSchema,
        }
      : null;
  }
  if (method === "GET" && segments.join("/") === "calendar") {
    const parsed = todayMonthSchema.safeParse(searchParams.get("month"));
    return parsed.success
      ? {
          springPath: `/today/calendar?month=${encodeURIComponent(parsed.data)}`,
          responseSchema: todayCalendarResponseSchema,
        }
      : null;
  }
  if (method === "GET" && segments.join("/") === "activity-types") {
    return {
      springPath: "/today/activity-types",
      responseSchema: todayActivityTypesResponseSchema,
    };
  }
  if (method === "GET" && segments[0] === "records" && segments.length === 2) {
    const date = todayDateSchema.safeParse(segments[1]);
    return date.success
      ? {
          springPath: `/today/records/${date.data}`,
          responseSchema: todayRecordResponseSchema,
        }
      : null;
  }
  if (method === "POST" && segments.join("/") === "tasks") {
    return {
      springPath: "/today/tasks",
      requestSchema: createTodayTaskBodySchema,
      responseSchema: todayTaskResponseSchema,
    };
  }
  if (method === "POST" && segments.join("/") === "activity-types") {
    return {
      springPath: "/today/activity-types",
      requestSchema: createTodayActivityTypeBodySchema,
      responseSchema: todayActivityTypeResponseSchema,
    };
  }
  if (
    method === "POST" &&
    segments[0] === "tasks" &&
    segments.length === 3 &&
    uuidSchema.safeParse(segments[1]).success &&
    (segments[2] === "complete" || segments[2] === "reopen")
  ) {
    return {
      springPath: `/today/tasks/${segments[1]}/${segments[2]}`,
      requestSchema: transitionTodayTaskBodySchema,
      responseSchema: todayTaskResponseSchema,
    };
  }
  if (
    method === "PATCH" &&
    segments[0] === "tasks" &&
    segments.length === 2 &&
    uuidSchema.safeParse(segments[1]).success
  ) {
    return {
      springPath: `/today/tasks/${segments[1]}`,
      requestSchema: updateTodayTaskBodySchema,
      responseSchema: todayTaskResponseSchema,
    };
  }
  if (
    method === "PATCH" &&
    segments[0] === "activity-types" &&
    segments.length === 2 &&
    uuidSchema.safeParse(segments[1]).success
  ) {
    return {
      springPath: `/today/activity-types/${segments[1]}`,
      requestSchema: updateTodayActivityTypeBodySchema,
      responseSchema: todayActivityTypeResponseSchema,
    };
  }
  if (
    method === "PUT" &&
    segments[0] === "records" &&
    segments[2] === "slots" &&
    segments.length === 4
  ) {
    const date = todayDateSchema.safeParse(segments[1]);
    const hour = hourSchema.safeParse(segments[3]);
    return date.success && hour.success
      ? {
          springPath: `/today/records/${date.data}/slots/${hour.data}`,
          requestSchema: upsertTodayRecordSlotBodySchema,
          responseSchema: todayRecordResponseSchema,
        }
      : null;
  }
  if (
    method === "DELETE" &&
    segments[0] === "tasks" &&
    segments.length === 2 &&
    uuidSchema.safeParse(segments[1]).success
  ) {
    const version = versionSchema.safeParse(searchParams.get("version"));
    return version.success
      ? {
          springPath: `/today/tasks/${segments[1]}?version=${version.data}`,
          emptyResponse: true,
        }
      : null;
  }
  if (
    method === "DELETE" &&
    segments[0] === "records" &&
    segments[2] === "slots" &&
    segments.length === 4
  ) {
    const date = todayDateSchema.safeParse(segments[1]);
    const hour = hourSchema.safeParse(segments[3]);
    return date.success && hour.success
      ? {
          springPath: `/today/records/${date.data}/slots/${hour.data}`,
          responseSchema: todayRecordResponseSchema,
        }
      : null;
  }
  return null;
}

async function handle(
  request: NextRequest,
  context: RouteContext
): Promise<Response> {
  const { currentUser, response } = await requireAuthenticatedUser(request);
  if (!currentUser) return response;

  const { segments } = await context.params;
  const contract = resolveContract(
    request.method,
    segments,
    request.nextUrl.searchParams
  );
  if (!contract) {
    return jsonError("Today 요청 경로 또는 값이 올바르지 않습니다.", 400);
  }

  const parsedBody = await parseBody(request, contract.requestSchema);
  if (parsedBody.error) return parsedBody.error;

  try {
    const result = await requestTodaySpring(
      currentUser.id,
      contract.springPath,
      {
        method: request.method,
        headers: parsedBody.body ? { "content-type": "application/json" } : {},
        body: parsedBody.body ? JSON.stringify(parsedBody.body) : undefined,
      }
    );
    if (contract.emptyResponse) {
      return new Response(null, { status: 204 });
    }
    const validated = contract.responseSchema?.safeParse(result.payload);
    if (!validated?.success) {
      console.error("Today Spring 응답 계약이 일치하지 않습니다.", {
        method: request.method,
        path: contract.springPath,
        status: result.status,
      });
      return jsonError("Today 서버 응답 형식이 올바르지 않습니다.", 502);
    }
    return NextResponse.json(validated.data, { status: result.status });
  } catch (error) {
    if (error instanceof TodaySpringBackendHttpError) {
      return NextResponse.json(
        { code: error.code ?? "TODAY_REQUEST_FAILED", message: error.message },
        { status: error.status }
      );
    }
    console.error(error);
    return jsonError("Today 요청을 처리하지 못했습니다.", 500);
  }
}

export function GET(request: NextRequest, context: RouteContext) {
  return handle(request, context);
}

export function POST(request: NextRequest, context: RouteContext) {
  return handle(request, context);
}

export function PATCH(request: NextRequest, context: RouteContext) {
  return handle(request, context);
}

export function PUT(request: NextRequest, context: RouteContext) {
  return handle(request, context);
}

export function DELETE(request: NextRequest, context: RouteContext) {
  return handle(request, context);
}
