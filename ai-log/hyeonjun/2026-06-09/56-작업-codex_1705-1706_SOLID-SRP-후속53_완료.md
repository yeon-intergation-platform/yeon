# SOLID SRP 후속 53 — 카드방 생성 폼 상태 훅 분리

## 목표

- 백로그 208번: `CardRoomCreateForm`의 데이터/폼/이벤트 hook 책임을 분리한다.

## 진행

- card-service SSOT 확인 완료.
- nextjs-patterns wrapper 확인: `.claude/commands/nextjs-patterns.md`는 현재 worktree에 없어 적용 가능한 범위에서 Next.js App Router 클라이언트 컴포넌트 기준만 유지한다.
- `use-card-room-create-form-state.ts`를 추가해 프로필/덱/입력/제출/라우팅/세션 저장 책임을 분리했다.

## 검증 예정

- `CI=true pnpm --filter @yeon/web lint`
- `CI=true pnpm --filter @yeon/web typecheck`
- `git diff --check`

## 변경

- `CardRoomCreateForm`에서 프로필/덱/인증/게스트 payload/세션 저장/라우팅 책임을 제거했다.
- `useCardRoomCreateFormState` 훅을 추가해 상태와 부수효과를 단일 폼 상태 계층으로 모았다.
- 게스트 카드방 payload 생성과 참가자 세션 저장을 작은 함수로 분리했다.
- SOLID/예외 백로그 208번을 완료 처리했다.

## 검증

- `CI=true pnpm --filter @yeon/web lint`
- `CI=true pnpm --filter @yeon/web typecheck`
- `git diff --check`
- 진행도 확인: 191/300 완료, 다음 순차 항목 209
