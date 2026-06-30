import {
  createYeonUrl,
  createYeonUrlSearchParams,
} from "@yeon/ui/runtime/YeonBrowserRuntime";
import { resolveYeonWebPath } from "@yeon/ui/runtime/ports";

const CARD_PUBLIC_ORIGIN = "https://card.yeon.world";
const TODO_PUBLIC_ORIGIN = "https://todo.yeon.world";
const CARD_PUBLIC_HOSTNAME = "card.yeon.world";
const TODO_PUBLIC_HOSTNAME = "todo.yeon.world";
const PRODUCTION_ROOT_HOSTNAMES = new Set(["yeon.world", "www.yeon.world"]);
const PRODUCTION_SERVICE_HOSTNAMES = new Set([
  "typing.yeon.world",
  CARD_PUBLIC_HOSTNAME,
  "community.yeon.world",
  "game.yeon.world",
  TODO_PUBLIC_HOSTNAME,
]);
const DEFAULT_STUDY_DESK_MINUTES = "25";
const DEFAULT_STUDY_DESK_MODE = "review";

export type StudyDeskTodoSource = {
  todoTaskId: string;
  todoTitle: string;
};

function normalizeHostname(rawHostname: string | null | undefined) {
  const hostname = rawHostname?.trim().toLowerCase();
  if (!hostname) return "";
  return hostname.split(":")[0] ?? "";
}

function getCurrentHostname() {
  return typeof window === "undefined" ? "" : window.location.hostname;
}

function isProductionNavigationHost(hostname: string) {
  return (
    PRODUCTION_ROOT_HOSTNAMES.has(hostname) ||
    PRODUCTION_SERVICE_HOSTNAMES.has(hostname)
  );
}

function appendSearch(href: string, search: string) {
  const normalizedSearch = search.startsWith("?") ? search.slice(1) : search;
  return normalizedSearch ? `${href}?${normalizedSearch}` : href;
}

function createPublicServiceHref({
  origin,
  pathname,
  search = "",
}: {
  origin: string;
  pathname: string;
  search?: string;
}) {
  const url = createYeonUrl(pathname, origin);
  url.search = search.startsWith("?") ? search : search ? `?${search}` : "";
  return url.toString();
}

export function createStudyDeskTodoSearch(source: StudyDeskTodoSource) {
  const params = createYeonUrlSearchParams();
  const todoTaskId = source.todoTaskId.trim();
  const todoTitle = source.todoTitle.trim();

  if (todoTaskId) {
    params.set("todoTaskId", todoTaskId);
  }
  if (todoTitle) {
    params.set("todoTitle", todoTitle);
  }

  params.set("minutes", DEFAULT_STUDY_DESK_MINUTES);
  params.set("mode", DEFAULT_STUDY_DESK_MODE);

  return params.toString();
}

export function resolveCardStudyDeskHref({
  hostname = getCurrentHostname(),
  search = "",
}: {
  hostname?: string | null;
  search?: string;
} = {}) {
  const normalizedHostname = normalizeHostname(hostname);

  if (normalizedHostname === CARD_PUBLIC_HOSTNAME) {
    return appendSearch("/study-desk", search);
  }

  if (isProductionNavigationHost(normalizedHostname)) {
    return createPublicServiceHref({
      origin: CARD_PUBLIC_ORIGIN,
      pathname: "/study-desk",
      search,
    });
  }

  return appendSearch(resolveYeonWebPath("cardStudyDesk"), search);
}

export function resolveTodoServiceHref({
  hostname = getCurrentHostname(),
  todoTaskId,
}: {
  hostname?: string | null;
  todoTaskId?: string | null;
} = {}) {
  const normalizedHostname = normalizeHostname(hostname);
  const params = createYeonUrlSearchParams();
  const normalizedTodoTaskId = todoTaskId?.trim();
  if (normalizedTodoTaskId) {
    params.set("todoTaskId", normalizedTodoTaskId);
  }
  const search = params.toString();

  if (normalizedHostname === TODO_PUBLIC_HOSTNAME) {
    return appendSearch("/", search);
  }

  if (isProductionNavigationHost(normalizedHostname)) {
    return createPublicServiceHref({
      origin: TODO_PUBLIC_ORIGIN,
      pathname: "/",
      search,
    });
  }

  return appendSearch("/todo-service", search);
}
