# typing-service fetch/query key boundary 정리

## 목표

- typing-service hook 내부 직접 `fetch()`를 제거한다.
- typing-service 네트워크 요청은 feature fetch helper로 이동한다.
- frame/lobby query key를 feature key factory로 분리한다.

## 검증

- 예정: web typecheck, web lint, web build, git diff --check, sync-skills, verify-ssot, 직접 fetch grep.

## 완료 내용

- `typing-service-fetch.ts`를 추가해 타자 덱, 캐릭터 프레임, 로비, race seed 요청을 feature fetch boundary로 모았다.
- `typing-service-query-keys.ts`를 추가해 캐릭터 프레임/로비 query key를 factory로 고정했다.
- 최신 main의 타자방 lifecycle/참가자 필터를 로비 fetch helper에 유지했다.
- hook 내부 직접 `fetch()` 호출을 제거했다.

## 검증 결과

- `pnpm --filter @yeon/web typecheck` 통과
- `pnpm --filter @yeon/web lint` 통과
- `pnpm --filter @yeon/web build` 통과
- `git diff --check` 통과
- `bash bin/sync-skills.sh --check` 통과
- `(cd /home/osuma/coding_stuffs/yeon && bash bin/verify-ssot.sh --project-only)` 통과
- `grep -RIn '\bfetch(' apps/web/src/features/typing-service | grep -v 'typing-service-fetch.ts'` 출력 없음
