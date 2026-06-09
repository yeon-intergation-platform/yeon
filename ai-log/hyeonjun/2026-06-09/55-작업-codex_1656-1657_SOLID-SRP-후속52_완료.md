# SOLID SRP 후속 52 — 웹 카드방 채팅 패널 책임 분리

## 목표

- 백로그 207번: `CardRoomChatPanel` 긴 함수에서 class 계산, 메시지 렌더링, 입력 form 책임을 분리한다.
- 기존 UI/문구/props 표면은 유지한다.

## 진행

- 작업 워크트리 `yeon-4`를 `origin/main` 기준 `codex/solid-exception-followup-52`로 초기화했다.
- 카드 서비스 SSOT(`docs/agent-rules/card-service.md`)와 Next.js 관련 규칙을 확인했다.

## 변경

- `card-room-chat-panel-parts.tsx`를 추가해 panel class 계산, 헤더, 메시지 리스트/버블, composer를 분리했다.
- `CardRoomChatPanel`은 섹션 조립만 담당하도록 축소했다.
- 백로그 207번을 완료 처리했다.

## 검증

- 진행률 스크립트: 300개 중 190개 완료, 다음 연속 후속 항목 208번.
- 라인 수: `card-room-chat-panel.tsx` 44라인, `card-room-chat-panel-parts.tsx` 146라인.
- `CI=true pnpm --filter @yeon/web lint`
- `CI=true pnpm --filter @yeon/web typecheck`
- `git diff --check`
