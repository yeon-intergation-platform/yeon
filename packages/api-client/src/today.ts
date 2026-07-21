import {
  TODAY_API_PATHS,
  createTodayActivityTypeBodySchema,
  createTodayTaskBodySchema,
  todayActivityTypeResponseSchema,
  todayActivityTypesResponseSchema,
  todayBoardResponseSchema,
  todayCalendarResponseSchema,
  todayRecordResponseSchema,
  todayTaskResponseSchema,
  transitionTodayTaskBodySchema,
  updateTodayActivityTypeBodySchema,
  updateTodayTaskBodySchema,
  upsertTodayRecordSlotBodySchema,
  type CreateTodayActivityTypeBody,
  type CreateTodayTaskBody,
  type TransitionTodayTaskBody,
  type UpdateTodayActivityTypeBody,
  type UpdateTodayTaskBody,
  type UpsertTodayRecordSlotBody,
} from "@yeon/api-contract/today";

type TodayClientOptions = {
  baseUrl?: string;
  fetch?: typeof fetch;
  headers?: HeadersInit;
};

export const todayKeys = {
  all: (userScope: string) => ["today", userScope] as const,
  boards: (userScope: string) =>
    [...todayKeys.all(userScope), "board"] as const,
  board: (userScope: string, date: string) =>
    [...todayKeys.boards(userScope), date] as const,
  calendars: (userScope: string) =>
    [...todayKeys.all(userScope), "calendar"] as const,
  calendar: (userScope: string, month: string) =>
    [...todayKeys.calendars(userScope), month] as const,
  record: (userScope: string, date: string) =>
    [...todayKeys.all(userScope), "record", date] as const,
  activityTypes: (userScope: string) =>
    [...todayKeys.all(userScope), "activity-types"] as const,
};

export function createTodayApiClient(options: TodayClientOptions = {}) {
  const fetchImpl = options.fetch ?? fetch;
  const baseUrl = options.baseUrl ?? "";

  async function request<T>(
    path: string,
    schema: { parse(input: unknown): T },
    init?: RequestInit
  ) {
    const response = await fetchImpl(
      baseUrl ? new URL(path, baseUrl).toString() : path,
      {
        ...init,
        headers: {
          accept: "application/json",
          ...(init?.body ? { "content-type": "application/json" } : {}),
          ...options.headers,
          ...init?.headers,
        },
      }
    );
    if (!response.ok) {
      const payload = (await response.json().catch(() => null)) as {
        message?: string;
      } | null;
      throw new Error(payload?.message ?? "Today 요청을 처리하지 못했습니다.");
    }
    return schema.parse(await response.json());
  }

  async function requestNoContent(path: string, init?: RequestInit) {
    const response = await fetchImpl(
      baseUrl ? new URL(path, baseUrl).toString() : path,
      {
        ...init,
        headers: {
          accept: "application/json",
          ...options.headers,
          ...init?.headers,
        },
      }
    );
    if (!response.ok) {
      const payload = (await response.json().catch(() => null)) as {
        message?: string;
      } | null;
      throw new Error(payload?.message ?? "Today 요청을 처리하지 못했습니다.");
    }
  }

  return {
    getBoard(date: string) {
      return request(
        `${TODAY_API_PATHS.board}?date=${encodeURIComponent(date)}`,
        todayBoardResponseSchema
      );
    },
    getCalendar(month: string) {
      return request(
        `${TODAY_API_PATHS.calendar}?month=${encodeURIComponent(month)}`,
        todayCalendarResponseSchema
      );
    },
    createTask(body: CreateTodayTaskBody) {
      return request(TODAY_API_PATHS.tasks, todayTaskResponseSchema, {
        method: "POST",
        body: JSON.stringify(createTodayTaskBodySchema.parse(body)),
      });
    },
    updateTask(taskId: string, body: UpdateTodayTaskBody) {
      return request(TODAY_API_PATHS.task(taskId), todayTaskResponseSchema, {
        method: "PATCH",
        body: JSON.stringify(updateTodayTaskBodySchema.parse(body)),
      });
    },
    completeTask(taskId: string, body: TransitionTodayTaskBody) {
      return request(
        TODAY_API_PATHS.completeTask(taskId),
        todayTaskResponseSchema,
        {
          method: "POST",
          body: JSON.stringify(transitionTodayTaskBodySchema.parse(body)),
        }
      );
    },
    reopenTask(taskId: string, body: TransitionTodayTaskBody) {
      return request(
        TODAY_API_PATHS.reopenTask(taskId),
        todayTaskResponseSchema,
        {
          method: "POST",
          body: JSON.stringify(transitionTodayTaskBodySchema.parse(body)),
        }
      );
    },
    deleteTask(taskId: string, version: number) {
      return requestNoContent(
        `${TODAY_API_PATHS.task(taskId)}?version=${version}`,
        { method: "DELETE" }
      );
    },
    getRecord(date: string) {
      return request(TODAY_API_PATHS.record(date), todayRecordResponseSchema);
    },
    upsertRecordSlot(
      date: string,
      hour: number,
      body: UpsertTodayRecordSlotBody
    ) {
      return request(
        TODAY_API_PATHS.recordSlot(date, hour),
        todayRecordResponseSchema,
        {
          method: "PUT",
          body: JSON.stringify(upsertTodayRecordSlotBodySchema.parse(body)),
        }
      );
    },
    deleteRecordSlot(date: string, hour: number) {
      return request(
        TODAY_API_PATHS.recordSlot(date, hour),
        todayRecordResponseSchema,
        { method: "DELETE" }
      );
    },
    listActivityTypes() {
      return request(
        TODAY_API_PATHS.activityTypes,
        todayActivityTypesResponseSchema
      );
    },
    createActivityType(body: CreateTodayActivityTypeBody) {
      return request(
        TODAY_API_PATHS.activityTypes,
        todayActivityTypeResponseSchema,
        {
          method: "POST",
          body: JSON.stringify(createTodayActivityTypeBodySchema.parse(body)),
        }
      );
    },
    updateActivityType(
      activityTypeId: string,
      body: UpdateTodayActivityTypeBody
    ) {
      return request(
        TODAY_API_PATHS.activityType(activityTypeId),
        todayActivityTypeResponseSchema,
        {
          method: "PATCH",
          body: JSON.stringify(updateTodayActivityTypeBodySchema.parse(body)),
        }
      );
    },
  };
}
