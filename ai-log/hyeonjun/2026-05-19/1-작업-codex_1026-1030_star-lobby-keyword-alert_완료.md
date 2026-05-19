# 스타 로비 키워드 감지 알림 작업 로그

- 시작: 2026-05-19 10:26 KST
- 브랜치: `feat/star-lobby-keyword-alert`
- 목표: 맵별 대기 채팅이 아닌 방제 키워드 감지/즉시 알림 MVP로 신규 서비스 방향을 고정하고 첫 웹/계약 스켈레톤을 만든다.

## 결정

- 초기 웹은 `apps/web/src/app/star-lobby/` route 내부에 colocate한다.
- `apps/web/src/features/star-lobby/`는 아직 만들지 않는다.
- MVP 핵심 모델은 대표 맵이 아니라 사용자가 등록하는 `AlertRule`이다.
- race-server는 공용 WebSocket 서버로서 로비 이벤트 push를 맡을 수 있지만, DB/source of truth는 Spring이 맡는다.

## 진행

- 공식 백로그 문서 작성: `docs/product/backlog/star-lobby-keyword-alert-20260519.md`
- API 계약 스켈레톤 추가: `packages/api-contract/src/star-lobby.ts`
- 웹 진입면 추가: `apps/web/src/app/star-lobby/page.tsx`, `_components/star-lobby-mvp-page.tsx`

## 검증

- `pnpm --filter @yeon/api-contract typecheck` 통과
- `pnpm --filter @yeon/web lint` 통과
- `pnpm --filter @yeon/web typecheck` 통과
- `pnpm --filter @yeon/web build` 통과 (`/star-lobby` static route 생성 확인)
- `git diff --check` 통과
