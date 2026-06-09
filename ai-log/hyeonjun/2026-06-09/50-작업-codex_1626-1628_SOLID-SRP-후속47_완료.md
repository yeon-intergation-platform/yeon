# SOLID SRP 후속 47 — 모바일 카드방 화면 상태 책임 분리

## 목표

- 백로그 202번: `CardRoomScreen` 긴 함수에서 join/rejoin, stale participant 정리, 액션 핸들러, 파생 상태 계산 책임을 hook으로 분리한다.
- 201번에서 분리한 렌더링 섹션 경계를 유지하고 screen은 상태별 렌더링 조립만 담당하게 한다.

## 진행

- 작업 워크트리 `yeon-2`를 `origin/main` 기준 `codex/solid-exception-followup-47`로 초기화했다.
- 카드 서비스 SSOT(`docs/agent-rules/card-service.md`)와 모바일 README를 확인했다.

## 변경

- `use-card-room-screen-state.ts`를 추가해 participant ID/token 로드·join, stale participant cleanup, leave/start/chat/role/ready 핸들러를 이동했다.
- 현재 참가자, 역할, 카드, 대기/완료/공개/시작 가능 여부 파생 상태를 hook의 `roomView`로 묶었다.
- `CardRoomScreen`은 join/connection/disconnected/loading 분기와 섹션 조립만 담당하게 축소했다.
- 백로그 202번을 완료 처리했다.

## 검증

- 진행률 스크립트: 300개 중 185개 완료, 다음 연속 후속 항목 203번.
- 라인 수: `card-room-screen.tsx` 129라인, `use-card-room-screen-state.ts` 182라인, `card-room-screen-sections.tsx` 317라인, `card-room-screen-styles.ts` 219라인.
- `CI=true pnpm --filter @yeon/mobile lint`
- `CI=true pnpm --filter @yeon/mobile typecheck`
- `CI=true pnpm verify:parity`
- `git diff --check`
