# SOLID SRP 후속 55 — 카드방 헤더 렌더 책임 분리

## 목표

- 백로그 210번: `CardRoomHeader` 긴 함수의 상태 파생/렌더링 책임을 작은 함수와 컴포넌트로 분리한다.

## 진행

- card-service SSOT 확인 완료.
- nextjs-patterns wrapper 확인: `.claude/commands/nextjs-patterns.md`는 현재 worktree에 없어 적용 가능한 범위에서 클라이언트 컴포넌트 기준을 유지했다.
- 카드방 헤더 요약 파생, 제목/상태 뱃지, 역할/준비/시작/종료/나가기 액션을 `card-room-header-parts.tsx`로 분리했다.

## 검증 예정

- `CI=true pnpm --filter @yeon/web lint`
- `CI=true pnpm --filter @yeon/web typecheck`
- `git diff --check`

## 변경

- `CardRoomHeader`의 current card/role/status/title/subtitle 파생을 `deriveCardRoomHeaderSummary`로 분리했다.
- 헤더 제목/상태 뱃지와 역할/준비/시작/종료/나가기 액션을 전용 컴포넌트로 분리했다.
- 기존 동작 보존을 위해 방 종료 버튼은 state가 있고 closed가 아닐 때만 노출되도록 `canEndRoom` 파생값으로 고정했다.
- SOLID/예외 백로그 210번을 완료 처리했다.

## 검증

- `CI=true pnpm --filter @yeon/web lint`
- `CI=true pnpm --filter @yeon/web typecheck`
- `git diff --check`
- 진행도 확인: 193/300 완료, 다음 순차 항목 211
