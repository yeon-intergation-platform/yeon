# counseling-service app \_lib shim 제거

## 목표

- app counseling-service 아래에 남아 있는 참조 없는 `_lib` 재수출 shim을 제거한다.
- feature lib를 상담 기록 워크스페이스의 유일한 SSOT로 남긴다.

## 계획

1. `_lib` shim 참조가 없는지 확인한다.
2. 참조 없는 shim 파일을 삭제한다.
3. web typecheck/lint/build 및 SSOT 검증을 실행한다.

## 완료

- `app/counseling-service/_lib` 재수출 shim을 제거했다.
- app counseling components/tests의 `_lib` import를 `features/counseling-record-workspace` SSOT 경로로 직접 전환했다.
- app `_lib/__tests__`에 남아 있던 lib 테스트를 feature lib 테스트 위치로 이동했다.

## 검증 결과

- `pnpm --filter @yeon/web typecheck` 통과
- `pnpm --filter @yeon/web lint` 통과
- `pnpm --filter @yeon/web build` 통과
- `git diff --check` 통과
- `bash bin/sync-skills.sh --check` 통과
- `bash bin/verify-ssot.sh --project-only` 통과
