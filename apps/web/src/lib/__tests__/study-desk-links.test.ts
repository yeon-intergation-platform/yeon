import { describe, expect, it } from "vitest";
import {
  createStudyDeskTodoSearch,
  resolveCardStudyDeskHref,
  resolveTodoServiceHref,
} from "../study-desk-links";

describe("study-desk-links", () => {
  it("todo 작업 context를 Study Desk query로 보존한다", () => {
    expect(
      createStudyDeskTodoSearch({
        todoTaskId: "task-1",
        todoTitle: " 긴 todo 제목 ",
      })
    ).toBe(
      "todoTaskId=task-1&todoTitle=%EA%B8%B4+todo+%EC%A0%9C%EB%AA%A9&minutes=25&mode=review"
    );
  });

  it("로컬과 dev host에서는 내부 card-service path로 Study Desk를 연다", () => {
    const search = "todoTaskId=task-1";

    expect(
      resolveCardStudyDeskHref({ hostname: "localhost:3000", search })
    ).toBe("/card-service/study-desk?todoTaskId=task-1");
    expect(
      resolveCardStudyDeskHref({ hostname: "dev.yeon.world", search })
    ).toBe("/card-service/study-desk?todoTaskId=task-1");
  });

  it("운영 서비스 host에서는 card canonical URL로 Study Desk를 연다", () => {
    const search = "todoTaskId=task-1";

    expect(
      resolveCardStudyDeskHref({ hostname: "todo.yeon.world", search })
    ).toBe("https://card.yeon.world/study-desk?todoTaskId=task-1");
    expect(
      resolveCardStudyDeskHref({ hostname: "card.yeon.world", search })
    ).toBe("/study-desk?todoTaskId=task-1");
    expect(resolveCardStudyDeskHref({ hostname: "yeon.world" })).toBe(
      "https://card.yeon.world/study-desk"
    );
  });

  it("Study Desk에서 Today로 돌아갈 때 todo canonical URL을 사용한다", () => {
    expect(
      resolveTodoServiceHref({
        hostname: "card.yeon.world",
        todoTaskId: "task-1",
      })
    ).toBe("https://todo.yeon.world/?todoTaskId=task-1");
    expect(
      resolveTodoServiceHref({
        hostname: "todo.yeon.world",
        todoTaskId: "task-1",
      })
    ).toBe("/?todoTaskId=task-1");
    expect(
      resolveTodoServiceHref({
        hostname: "localhost:3000",
        todoTaskId: "task-1",
      })
    ).toBe("/todo-service?todoTaskId=task-1");
  });
});
