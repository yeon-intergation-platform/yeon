const TODO_SERVICE_BASE_PATH = "/todo-service";
const TODO_SERVICE_FOCUS_PATH = `${TODO_SERVICE_BASE_PATH}/focus`;
const TODO_SERVICE_PUBLIC_HOST = "todo.yeon.world";

function isTodoServicePublicHost(hostname: string | null | undefined) {
  return hostname?.toLowerCase() === TODO_SERVICE_PUBLIC_HOST;
}

function getClientHostname() {
  return typeof window === "undefined" ? null : window.location.hostname;
}

export function getTodoServiceHomeHref() {
  return isTodoServicePublicHost(getClientHostname())
    ? "/"
    : TODO_SERVICE_BASE_PATH;
}

export function getTodoFocusHref({
  taskId,
  date,
  minutes,
}: {
  taskId: string;
  date: string;
  minutes: number;
}) {
  const searchParams = new URLSearchParams({
    taskId,
    date,
    minutes: String(minutes),
  });
  const pathname = isTodoServicePublicHost(getClientHostname())
    ? "/focus"
    : TODO_SERVICE_FOCUS_PATH;

  return `${pathname}?${searchParams.toString()}`;
}
