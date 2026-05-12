# counseling workspace route hook 일부 feature 이동

## 목표

- app route 내부에 남은 상담 워크스페이스 훅 일부를 feature hook boundary로 이동한다.
- 기존 app `_hooks` import 호환은 re-export로 유지한다.

## 검증

- 예정: web typecheck, web lint, web build, git diff --check, sync-skills, verify-ssot.

## 완료 내용

- `use-current-space`, `use-space-members`, `use-counseling-insight-banner-dismissals`를 `features/counseling-record-workspace/hooks`로 이동했다.
- app `_hooks/index.ts`는 기존 import 호환을 위한 re-export로 유지했다.
- `use-space-members`는 app `_lib/types` 의존을 제거하고 필요한 record shape만 받도록 좁혔다.

## 검증 결과

- `pnpm --filter @yeon/web typecheck` 통과
- `pnpm --filter @yeon/web lint` 통과
- `pnpm --filter @yeon/web build` 통과
- `git diff --check` 통과
- `bash bin/sync-skills.sh --check` 통과
- `(cd /home/osuma/coding_stuffs/yeon && bash bin/verify-ssot.sh --project-only)` 통과
- 기존 app `_hooks/use-current-space.ts`, `_hooks/use-space-members.ts`, `_hooks/use-counseling-insight-banner-dismissals.ts` 삭제 확인

## 추가 완료 내용

- `use-audio-player`, `use-workspace-selection`, `use-record-entry`를 `features/counseling-record-workspace/hooks`로 추가 이동했다.
- app `_hooks/index.ts`는 해당 훅들도 feature re-export로만 제공한다.
- `use-workspace-selection`, `use-record-entry`는 app `_lib/types` 의존 없이 필요한 최소 record shape 타입만 사용한다.

## 추가 검증 결과

- `pnpm --filter @yeon/web typecheck` 통과
- `pnpm --filter @yeon/web lint` 통과
- `pnpm --filter @yeon/web build` 통과
- `git diff --check` 통과
- `bash bin/sync-skills.sh --check` 통과
- `(cd /home/osuma/coding_stuffs/yeon && bash bin/verify-ssot.sh --project-only)` 통과
- 기존 app `_hooks`에서 이동 대상 6개 파일 삭제 확인
