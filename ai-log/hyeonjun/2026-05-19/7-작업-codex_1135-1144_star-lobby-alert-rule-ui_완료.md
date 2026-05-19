# 스타 로비 서버 저장 알림 조건 UI

- 일시: 2026-05-19 11:35~11:44
- 작업자: Codex
- 브랜치: feat/star-lobby-alert-rule-ui

## 작업 내용

- `packages/api-contract`에 스타 로비 alert rule mutation 응답 타입과 subpath export를 추가했다.
- Next BFF `GET/POST /api/v1/star-lobby/alert-rules`를 추가해 Spring 알림 조건 API로 전달하게 했다.
- `/star-lobby` 실시간 알림 폼이 입력 조건을 race-server 구독에 즉시 반영하면서 Spring에도 저장하게 했다.
- 게스트 사용자는 `X-Yeon-Guest-Session-Id` 헤더로 같은 브라우저의 저장 조건을 조회한다.

## 경계

- Spring이 알림 조건 원천이다.
- Next는 BFF 브리지만 담당한다.
- race-server는 접속 중 실시간 전달만 담당한다.
- OCR/스타 자동조작/맵별 대기 채팅은 포함하지 않았다.

## 검증

- `pnpm --filter @yeon/api-contract typecheck`
- `pnpm --filter @yeon/web typecheck`
- `pnpm --filter @yeon/web lint`
- `pnpm --filter @yeon/web build`
- `git diff --check`
