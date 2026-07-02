# SSE 오류 이벤트 requestId 계약 보강

## 목표

- 2차 병합 후 잔여 스캔에서 남은 local import SSE error event가 `code/message`만 싣지 않도록 `requestId`를 포함한다.
- 기존 SSE 소비자가 쓰는 `type: "error"`는 유지한다.

## 현재 증거

- REST/BFF 생산 코드의 `message` 단독 응답 스캔은 매칭 없음.
- `LocalImportAnalysisController`의 SSE catch 경로는 `type`, `code`, `message`만 포함한다.
- `RequestIdFilter`와 `ApiErrorResponses`가 이미 requestId 생성/보존을 제공한다.

## 작업 계획

- controller method에서 `HttpServletRequest`를 받아 streaming 경로로 전달한다.
- SSE error event를 `ApiErrorResponses.of(request, ...)` 결과에서 파생해 `requestId`와 선택 메타데이터를 포함한다.
- `LocalImportAnalysisControllerTests`에 SSE error event의 `requestId` 검증을 추가한다.

## 완료 내용

- local import analyze JSON endpoint와 SSE endpoint를 분리해 `StreamingResponseBody`가 Spring MVC stream handler를 타게 했다.
- SSE error event에 기존 `type: "error"`를 유지하면서 `code`, `message`, `requestId`, 선택 메타데이터를 포함하게 했다.
- SSE 응답 charset을 UTF-8로 명시했다.

## 검증

- `./gradlew test --tests 'world.yeon.backend.local_import_analysis.controller.LocalImportAnalysisControllerTests'`
- `./gradlew test`
- `git diff --check`
- Web production `message` 단독 오류 응답 스캔: 매칭 없음
- Backend 구형/local `ErrorResponse` 및 raw `code/message` map 스캔: 공통 `ApiErrorResponse` record/helper 외 매칭 없음
