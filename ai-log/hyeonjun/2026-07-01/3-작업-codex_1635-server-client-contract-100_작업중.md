# 서버-클라이언트 오류 계약 100개 보완 작업 로그

## 목표

- 서버가 클라이언트에 실패를 말할 때 `code`와 `message`를 안정적으로 제공하게 만든다.
- 100개 취약점 원장을 작성하고, 작은 배치로 보완한다.
- CI/CD 실패 확률을 낮추기 위해 공통 계약층과 좁은 서비스 배치부터 검증한다.

## 현재 근거

- 공통 Spring 예외 계약은 `ApiException` -> `ApiErrorResponse(code, message)` 구조다.
- `game_service_comments`, `game_service_library`, `game_service_likes`는 `ResponseStatusException`을 직접 던져 전역 `ApiException` 핸들러를 우회한다.
- `packages/api-contract/src/error.ts`는 호환 때문에 `code`를 optional로 둔다.
- 웹 BFF 일부 경로는 Spring error code를 추출할 수 있지만 route에서 전달하지 않는 패턴이 남아 있다.

## 1차 계획

- 게임 서비스 직접 `ResponseStatusException` throw 지점을 도메인 `ApiException`으로 전환한다.
- `GAME_SLUG_INVALID`, `GAME_COMMENT_*`, `GAME_LIBRARY_*`, `GAME_LIKE_*` code를 부여한다.
- 컨트롤러 MockMvc 테스트에서 HTTP 오류 응답의 `code`와 `message`를 검증한다.
- 검증: backend focused tests, `git diff --check`.

## 진행

- 작업 전 `git status --short --branch`: `## main...origin/main`.
- 백로그 원장: `docs/product/backlog/2026-07-01-server-client-contract-vulnerability-ledger.md`.
- `game_service_*` 직접 `ResponseStatusException` throw 13곳을 `GameServiceException(ApiException)` 기반으로 전환했다.
- `GameServiceErrorContractControllerTests`를 추가해 댓글/라이브러리/좋아요 오류 응답의 `code`와 `message`를 검증한다.

## 검증 결과

- `./gradlew test --tests 'world.yeon.backend.game_service_common.controller.GameServiceErrorContractControllerTests' --tests 'world.yeon.backend.game_service_comments.controller.GameServiceCommentsControllerTests'` 통과.
- `./gradlew test --tests 'world.yeon.backend.game_service_*.*'` 통과.
- `./gradlew test --tests 'world.yeon.backend.architecture.LayeredArchitectureTest'` 통과.
- `git diff --check` 통과.
