# counseling AI chat hook feature 이동

## 목표

- `use-ai-chat`을 counseling-record-workspace feature hook으로 이동한다.
- AI 채팅/자동 분석 API 호출을 feature API helper로 분리한다.

## 범위

- app `_hooks` 직접 구현 제거
- 기존 import 경로 호환 re-export 유지
- API/DB/백엔드 동작 변경 없음

## 완료 내용

- `use-ai-chat`을 `features/counseling-record-workspace/hooks`로 이동했다.
- AI 채팅 SSE POST를 `streamCounselingRecordChat` helper로 분리했다.
- 자동 분석 POST를 `analyzeCounselingRecord` helper로 분리했다.
- app `_hooks/index.ts`는 기존 import 호환 re-export만 유지한다.
- app `_lib/types` 타입 의존은 타입/model 이동 차수에서 후속 정리한다.

## 검증 결과

- `pnpm --filter @yeon/web typecheck` 통과
- `pnpm --filter @yeon/web lint` 통과
- `pnpm --filter @yeon/web build` 통과
- `git diff --check` 통과
- `bash bin/sync-skills.sh --check` 통과
- `bash bin/verify-ssot.sh --project-only` 통과
