# 타자방 설정 panel view 분리

## 목표

- 프론트 구조 표준화의 타자방 잔여 대형 JSX를 줄인다.
- `typing-room-screen.tsx`에 남은 대기방 설정 panel을 feature view 파일로 분리한다.
- 설정 변경/덱 seed 재계산 동작은 유지한다.

## 계획

1. `typing-room-settings-panel.tsx`를 추가한다.
2. `typing-room-screen.tsx`에서 설정 panel JSX를 props 연결로 대체한다.
3. web typecheck/lint/build 및 docs/rules 검증을 수행한다.

## 진행

- 작업 시작.

## 완료

- `typing-room-settings-panel.tsx` 추가: 대기방 설정 panel view 분리.
- `typing-room-deck-format.ts` 추가: 덱 제목 표시 규칙을 screen과 settings panel이 공유.
- `typing-room-screen.tsx`는 설정 변경 payload 전송과 seed 재계산 orchestration만 유지.

## 검증

- `pnpm --filter @yeon/web typecheck` 성공.
- `pnpm --filter @yeon/web lint` 성공.
- `pnpm --filter @yeon/web build` 성공.
- `git diff --check` 성공.
- `bash bin/sync-skills.sh --check` 성공.
- `bash bin/verify-ssot.sh --project-only` 성공.
