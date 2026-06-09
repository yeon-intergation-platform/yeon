# SOLID SRP 후속 49 — 모바일 카드 아이템 repository 책임 분리

## 목표

- 백로그 204번: `createMobileCardItemRepository`의 세션 판정, 게스트 저장소 구현, 서버 API 구현 책임을 분리한다.
- `YeonCardItemRepository` 공개 포트 표면과 기존 bulk/replace 동작은 유지한다.

## 진행

- 작업 워크트리 `yeon-2`를 `origin/main` 기준 `codex/solid-exception-followup-49`로 초기화했다.
- 카드 서비스 SSOT(`docs/agent-rules/card-service.md`)를 확인했다.
- `YeonCardItemRepository` 포트에 `replaceCards`가 포함되어 있음을 확인했다.

## 변경

- `card-item-session.ts`를 추가해 모바일 카드 세션 타입과 token 해석 책임을 분리했다.
- `card-item-guest-repository.ts`를 추가해 게스트 저장소 기반 카드 아이템 repository 구현을 분리했다.
- `card-item-server-repository.ts`를 추가해 서버 API 기반 카드 아이템 repository 구현을 분리했다.
- `card-item-repository.ts`는 token 존재 여부로 guest/server repository 구현을 선택하는 조립 함수만 남겼다.
- 백로그 204번을 완료 처리했다.

## 검증

- 진행률 스크립트: 300개 중 187개 완료, 다음 연속 후속 항목 205번.
- 라인 수: `card-item-repository.ts` 23라인, `card-item-session.ts` 14라인, `card-item-guest-repository.ts` 46라인, `card-item-server-repository.ts` 89라인.
- `CI=true pnpm --filter @yeon/mobile lint`
- `CI=true pnpm --filter @yeon/mobile typecheck`
- `CI=true pnpm verify:parity`
- `git diff --check`
