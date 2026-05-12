# counseling workspace api/query key feature boundary 정리

## 목표

- 상담 워크스페이스 fetch helper와 query key factory를 app route 내부에서 feature layer로 이동한다.
- app route는 기존 UI/hook 조립을 유지하되 네트워크/캐시 key SSOT는 `features/counseling-record-workspace/api`로 고정한다.

## 검증

- 예정: web typecheck, web lint, web build, git diff --check, sync-skills, verify-ssot, app 내부 fetch/query key 파일 부재 확인.

## 완료

- 상담 워크스페이스 fetch helper를 `features/counseling-record-workspace/api/counseling-workspace-fetch.ts`로 이동했다.
- 상담 워크스페이스 query key factory를 `features/counseling-record-workspace/api/counseling-workspace-query-keys.ts`로 이동했다.
- app route 내부 hook/component는 feature API boundary를 import하도록 바꿨다.

## 검증 결과

- `pnpm --filter @yeon/web typecheck` 성공
- `pnpm --filter @yeon/web lint` 성공
- `pnpm --filter @yeon/web build` 성공
- `git diff --check` 성공
- `bash bin/sync-skills.sh --check` 성공
- `(cd /home/osuma/coding_stuffs/yeon && bash bin/verify-ssot.sh --project-only)` 성공
- `test ! -e apps/web/src/app/counseling-service/_hooks/counseling-workspace-fetch.ts` 성공
- `test ! -e apps/web/src/app/counseling-service/_hooks/counseling-workspace-query-keys.ts` 성공
