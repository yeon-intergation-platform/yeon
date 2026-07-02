import {
  parseTodoServiceState,
  type TodoServiceState,
} from "./todo-service-model";

export const TODO_SERVICE_STORAGE_KEY = "yeon.todo-service.state.v1";

export function readTodoServiceState(today: string) {
  if (typeof window === "undefined") {
    return parseTodoServiceState(null, today);
  }

  return parseTodoServiceState(
    window.localStorage.getItem(TODO_SERVICE_STORAGE_KEY),
    today
  );
}

export function writeTodoServiceState(state: TodoServiceState) {
  window.localStorage.setItem(TODO_SERVICE_STORAGE_KEY, JSON.stringify(state));
}
