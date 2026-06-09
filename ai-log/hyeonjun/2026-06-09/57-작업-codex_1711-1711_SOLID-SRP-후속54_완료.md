# SOLID SRP 후속 54 — 카드방 생성 폼 렌더 섹션 분리

## 목표

- 백로그 209번: `CardRoomCreateForm` 긴 함수의 렌더링 책임을 작은 섹션 컴포넌트로 분리한다.

## 진행

- card-service SSOT 확인 완료.
- nextjs-patterns wrapper 확인: `.claude/commands/nextjs-patterns.md`는 현재 worktree에 없어 적용 가능한 범위에서 클라이언트 컴포넌트 기준을 유지했다.
- 카드방 생성 폼의 프로필 패널, 설정 필드, 공개 여부, 오류, 액션 영역을 `card-room-create-form-parts.tsx`로 분리했다.

## 검증 예정

- `CI=true pnpm --filter @yeon/web lint`
- `CI=true pnpm --filter @yeon/web typecheck`
- `git diff --check`

## 변경

- `CardRoomCreateForm`의 프로필 패널, 실제 방 설정 필드, 공개 여부 선택, 오류 메시지, 하단 액션을 전용 렌더 컴포넌트로 분리했다.
- 덱 선택 placeholder 계산을 훅으로 올려 JSX에서 query loading 상태를 직접 참조하지 않게 했다.
- SOLID/예외 백로그 209번을 완료 처리했다.

## 검증

- `CI=true pnpm --filter @yeon/web lint`
- `CI=true pnpm --filter @yeon/web typecheck`
- `git diff --check`
- 진행도 확인: 192/300 완료, 다음 순차 항목 210
