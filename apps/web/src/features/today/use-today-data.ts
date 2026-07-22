"use client";

import {
  createTodayApiClient,
  TodayApiError,
  todayKeys,
} from "@yeon/api-client";
import type {
  CreateTodayActivityTypeBody,
  CreateTodayTaskBody,
  TodayTask,
  UpdateTodayActivityTypeBody,
  UpdateTodayTaskBody,
} from "@yeon/api-contract/today";
import {
  useYeonMutation,
  useYeonQuery,
  useYeonQueryClient,
} from "@yeon/ui/runtime/YeonQuery";

const USER_SCOPE = "me";
const client = createTodayApiClient();

export function useTodayBoard(date: string) {
  return useYeonQuery({
    queryKey: todayKeys.board(USER_SCOPE, date),
    queryFn: () => client.getBoard(date),
  });
}

export function useTodayCalendar(month: string) {
  return useYeonQuery({
    queryKey: todayKeys.calendar(USER_SCOPE, month),
    queryFn: () => client.getCalendar(month),
  });
}

export function useTodayRecord(date: string) {
  return useYeonQuery({
    queryKey: todayKeys.record(USER_SCOPE, date),
    queryFn: () => client.getRecord(date),
  });
}

export function useTodayActivityTypes() {
  return useYeonQuery({
    queryKey: todayKeys.activityTypes(USER_SCOPE),
    queryFn: () => client.listActivityTypes(),
  });
}

export function useTodayMutations() {
  const queryClient = useYeonQueryClient();
  const refreshBoard = async () => {
    await Promise.all([
      queryClient.invalidateQueries({
        queryKey: todayKeys.boards(USER_SCOPE),
      }),
      queryClient.invalidateQueries({
        queryKey: todayKeys.calendars(USER_SCOPE),
      }),
    ]);
  };

  const createTask = useYeonMutation({
    mutationFn: (body: CreateTodayTaskBody) => client.createTask(body),
    onSuccess: refreshBoard,
  });
  const updateTask = useYeonMutation({
    mutationFn: ({
      taskId,
      body,
    }: {
      taskId: string;
      body: UpdateTodayTaskBody;
    }) => client.updateTask(taskId, body),
    onSuccess: refreshBoard,
  });
  const toggleTask = useYeonMutation({
    mutationFn: (task: TodayTask) =>
      task.status === "done"
        ? client.reopenTask(task.id, { version: task.version })
        : client.completeTask(task.id, { version: task.version }),
    onSuccess: refreshBoard,
  });
  const deleteTask = useYeonMutation({
    mutationFn: (task: TodayTask) => client.deleteTask(task.id, task.version),
    onSuccess: refreshBoard,
  });

  return {
    createTask,
    updateTask,
    toggleTask,
    deleteTask,
    resetErrors() {
      createTask.reset();
      updateTask.reset();
      toggleTask.reset();
      deleteTask.reset();
    },
  };
}

export function useTodayRecordMutations(date: string) {
  const queryClient = useYeonQueryClient();
  const refreshRecord = () =>
    queryClient.invalidateQueries({
      queryKey: todayKeys.record(USER_SCOPE, date),
    });

  const upsertSlot = useYeonMutation({
    mutationFn: ({
      hour,
      activityTypeId,
      note,
      entryIndex,
    }: {
      hour: number;
      activityTypeId: string;
      note?: string | null;
      entryIndex?: number;
    }) =>
      client.upsertRecordSlot(date, hour, {
        activityTypeId,
        note,
        entryIndex,
      }),
    onSuccess: refreshRecord,
  });
  const deleteSlot = useYeonMutation({
    mutationFn: ({ hour, entryIndex }: { hour: number; entryIndex?: number }) =>
      client.deleteRecordSlot(date, hour, entryIndex),
    onSuccess: refreshRecord,
  });
  const createActivityType = useYeonMutation({
    mutationFn: (body: CreateTodayActivityTypeBody) =>
      client.createActivityType(body),
    onSuccess: async () => {
      await Promise.all([
        refreshRecord(),
        queryClient.invalidateQueries({
          queryKey: todayKeys.activityTypes(USER_SCOPE),
        }),
      ]);
    },
  });
  const updateActivityType = useYeonMutation({
    mutationFn: ({
      activityTypeId,
      body,
    }: {
      activityTypeId: string;
      body: UpdateTodayActivityTypeBody;
    }) => client.updateActivityType(activityTypeId, body),
    onSuccess: async () => {
      await Promise.all([
        refreshRecord(),
        queryClient.invalidateQueries({
          queryKey: todayKeys.activityTypes(USER_SCOPE),
        }),
      ]);
    },
  });

  return {
    upsertSlot,
    deleteSlot,
    createActivityType,
    updateActivityType,
    resetErrors() {
      upsertSlot.reset();
      deleteSlot.reset();
      createActivityType.reset();
      updateActivityType.reset();
    },
  };
}

export function getTodayErrorMessage(error: unknown) {
  return error instanceof Error
    ? error.message
    : "요청을 처리하지 못했습니다. 다시 시도해주세요.";
}

export function isTodayAuthenticationError(error: unknown) {
  return error instanceof TodayApiError && error.status === 401;
}
