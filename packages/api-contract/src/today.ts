import { z } from "zod";

const ISO_DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;
const ISO_MONTH_PATTERN = /^\d{4}-\d{2}$/;

function isCalendarDate(value: string) {
  const [year, month, day] = value.split("-").map(Number);
  if (!year || !month || !day || month < 1 || month > 12) return false;
  const daysInMonth = [
    31,
    year % 400 === 0 || (year % 4 === 0 && year % 100 !== 0) ? 29 : 28,
    31,
    30,
    31,
    30,
    31,
    31,
    30,
    31,
    30,
    31,
  ];
  return day <= daysInMonth[month - 1]!;
}

function isCalendarMonth(value: string) {
  const [year, month] = value.split("-").map(Number);
  return Boolean(year && month && month >= 1 && month <= 12);
}

export const TODAY_PRIORITIES = {
  high: "high",
  normal: "normal",
  low: "low",
} as const;

export const TODAY_TASK_STATUSES = {
  inbox: "inbox",
  planned: "planned",
  done: "done",
} as const;

export const TODAY_ACTIVITY_COLORS = {
  blue: "blue",
  green: "green",
  orange: "orange",
  purple: "purple",
  yellow: "yellow",
  red: "red",
  gray: "gray",
} as const;

export const TODAY_ACTIVITY_ICONS = {
  book: "book",
  gamepad: "gamepad",
  utensils: "utensils",
  car: "car",
  coffee: "coffee",
  moon: "moon",
  dumbbell: "dumbbell",
  circle: "circle",
} as const;

export const todayDateSchema = z
  .string()
  .regex(ISO_DATE_PATTERN)
  .refine(isCalendarDate);
export const todayMonthSchema = z
  .string()
  .regex(ISO_MONTH_PATTERN)
  .refine(isCalendarMonth);
export const todayPrioritySchema = z.enum(TODAY_PRIORITIES);
export const todayTaskStatusSchema = z.enum(TODAY_TASK_STATUSES);
export const todayActivityColorSchema = z.enum(TODAY_ACTIVITY_COLORS);
export const todayActivityIconSchema = z.enum(TODAY_ACTIVITY_ICONS);

export const todayTaskSchema = z.object({
  id: z.uuid(),
  title: z.string().min(1).max(200),
  priority: todayPrioritySchema,
  estimatedMinutes: z.number().int().min(1).max(1440),
  categoryLabel: z.string().max(40).nullable(),
  status: todayTaskStatusSchema,
  plannedDate: todayDateSchema.nullable(),
  completedAt: z.iso.datetime({ offset: true }).nullable(),
  version: z.number().int().nonnegative(),
  createdAt: z.iso.datetime({ offset: true }),
  updatedAt: z.iso.datetime({ offset: true }),
});

export const todaySummarySchema = z.object({
  totalCount: z.number().int().nonnegative(),
  completedCount: z.number().int().nonnegative(),
  completionRate: z.number().int().min(0).max(100),
  estimatedMinutes: z.number().int().nonnegative(),
});

export const todayRecommendationSchema = z.object({
  task: todayTaskSchema,
  reason: z.string().min(1).max(160),
  score: z.number().int(),
});

export const todayBoardResponseSchema = z.object({
  date: todayDateSchema,
  tasks: z.array(todayTaskSchema),
  inboxCount: z.number().int().nonnegative(),
  summary: todaySummarySchema,
  recommendation: todayRecommendationSchema.nullable(),
  serverTime: z.iso.datetime({ offset: true }),
});

export const todayCalendarDaySchema = z.object({
  date: todayDateSchema,
  totalCount: z.number().int().nonnegative(),
  completedCount: z.number().int().nonnegative(),
  openCount: z.number().int().nonnegative(),
});

export const todayCalendarResponseSchema = z.object({
  month: todayMonthSchema,
  days: z.array(todayCalendarDaySchema),
});

export const createTodayTaskBodySchema = z.object({
  title: z.string().trim().min(1).max(200),
  priority: todayPrioritySchema.default(TODAY_PRIORITIES.normal),
  estimatedMinutes: z.number().int().min(1).max(1440).default(30),
  categoryLabel: z.string().trim().min(1).max(40).nullable().optional(),
  plannedDate: todayDateSchema.nullable(),
});

export const updateTodayTaskBodySchema = z
  .object({
    version: z.number().int().nonnegative(),
    title: z.string().trim().min(1).max(200),
    priority: todayPrioritySchema,
    estimatedMinutes: z.number().int().min(1).max(1440),
    categoryLabel: z.string().trim().min(1).max(40).nullable(),
    plannedDate: todayDateSchema.nullable(),
  })
  .strict();

export const transitionTodayTaskBodySchema = z.object({
  version: z.number().int().nonnegative(),
});

export const todayTaskResponseSchema = z.object({ task: todayTaskSchema });

export const todayActivityTypeSchema = z.object({
  id: z.uuid(),
  name: z.string().min(1).max(40),
  colorToken: todayActivityColorSchema,
  iconKey: todayActivityIconSchema,
  sortOrder: z.number().int().nonnegative(),
  active: z.boolean(),
  version: z.number().int().nonnegative(),
});

export const todayActivityTypesResponseSchema = z.object({
  activityTypes: z.array(todayActivityTypeSchema),
});

export const createTodayActivityTypeBodySchema = z.object({
  name: z.string().trim().min(1).max(40),
  colorToken: todayActivityColorSchema,
  iconKey: todayActivityIconSchema,
});

export const updateTodayActivityTypeBodySchema = z
  .object({
    version: z.number().int().nonnegative(),
    name: z.string().trim().min(1).max(40),
    colorToken: todayActivityColorSchema,
    iconKey: todayActivityIconSchema,
    sortOrder: z.number().int().nonnegative(),
    active: z.boolean(),
  })
  .strict();

export const todayActivityTypeResponseSchema = z.object({
  activityType: todayActivityTypeSchema,
});

export const todayRecordSlotSchema = z.object({
  hour: z.number().int().min(0).max(23),
  activityType: todayActivityTypeSchema.nullable(),
  note: z.string().max(200).nullable(),
});

export const todayRecordSummarySchema = z.object({
  recordedHours: z.number().int().min(0).max(24),
  recordRate: z.number().int().min(0).max(100),
  activityMinutes: z.record(z.string(), z.number().int().nonnegative()),
});

export const todayRecordResponseSchema = z.object({
  date: todayDateSchema,
  slots: z.array(todayRecordSlotSchema).length(24),
  summary: todayRecordSummarySchema,
});

export const upsertTodayRecordSlotBodySchema = z.object({
  activityTypeId: z.uuid(),
  note: z.string().trim().max(200).nullable().optional(),
});

export const todayApiErrorSchema = z.object({
  code: z.string().min(1).optional(),
  message: z.string().min(1),
});

export const TODAY_API_PATHS = {
  board: "/api/v1/today/board",
  calendar: "/api/v1/today/calendar",
  tasks: "/api/v1/today/tasks",
  task: (taskId: string) => `/api/v1/today/tasks/${taskId}`,
  completeTask: (taskId: string) => `/api/v1/today/tasks/${taskId}/complete`,
  reopenTask: (taskId: string) => `/api/v1/today/tasks/${taskId}/reopen`,
  record: (date: string) => `/api/v1/today/records/${date}`,
  recordSlot: (date: string, hour: number) =>
    `/api/v1/today/records/${date}/slots/${hour}`,
  activityTypes: "/api/v1/today/activity-types",
  activityType: (activityTypeId: string) =>
    `/api/v1/today/activity-types/${activityTypeId}`,
} as const;

export type TodayPriority = z.infer<typeof todayPrioritySchema>;
export type TodayTaskStatus = z.infer<typeof todayTaskStatusSchema>;
export type TodayTask = z.infer<typeof todayTaskSchema>;
export type TodayBoardResponse = z.infer<typeof todayBoardResponseSchema>;
export type TodayCalendarResponse = z.infer<typeof todayCalendarResponseSchema>;
export type CreateTodayTaskBody = z.infer<typeof createTodayTaskBodySchema>;
export type UpdateTodayTaskBody = z.infer<typeof updateTodayTaskBodySchema>;
export type TransitionTodayTaskBody = z.infer<
  typeof transitionTodayTaskBodySchema
>;
export type TodayActivityType = z.infer<typeof todayActivityTypeSchema>;
export type CreateTodayActivityTypeBody = z.infer<
  typeof createTodayActivityTypeBodySchema
>;
export type UpdateTodayActivityTypeBody = z.infer<
  typeof updateTodayActivityTypeBodySchema
>;
export type TodayRecordResponse = z.infer<typeof todayRecordResponseSchema>;
export type UpsertTodayRecordSlotBody = z.infer<
  typeof upsertTodayRecordSlotBodySchema
>;
export type TodayApiErrorPayload = z.infer<typeof todayApiErrorSchema>;
