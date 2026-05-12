# 타자방 대기 패널 view 분리

## 목표

- 프론트 구조 표준화의 타자서비스 잔여 God component 축소.
- `typing-room-screen.tsx`의 대기방 header/participants/chat JSX를 feature view 파일로 분리한다.
- realtime room 생성/입장/퇴장/설정 동작은 유지한다.

## 계획

1. header/participants/chat presentational component를 `apps/web/src/features/typing-service/`에 추가한다.
2. `typing-room-screen.tsx`는 상태 orchestration과 props 연결만 남긴다.
3. web typecheck/lint/build 및 docs/rules 검증을 수행한다.

## 진행

- 작업 시작.

## 완료

- `typing-room-waiting-header.tsx` 추가: 대기방 나가기/초대/시작/준비 header view 분리.
- `typing-room-participants-panel.tsx` 추가: 참여자 카드 view 분리.
- `typing-room-chat-panel.tsx` 추가: 대기방 채팅 view 분리.
- `typing-room-screen.tsx`는 room orchestration, 설정 변경, seed/라우팅 흐름 중심으로 축소.

## 검증

- `pnpm --filter @yeon/web typecheck` 성공.
- `pnpm --filter @yeon/web lint` 성공.
- `pnpm --filter @yeon/web build` 성공.
- `git diff --check` 성공.
- `bash bin/sync-skills.sh --check` 성공.
- `bash bin/verify-ssot.sh --project-only` 성공.
