# card-service fetch/query key boundary 정리

## 목표

- card-service hook 내부 직접 `fetch()`를 제거하고 서비스 fetch helper로 분리한다.
- card deck query key를 hook 파일이 아닌 서비스 key factory로 이동한다.

## 검증

- 예정: web typecheck, web lint, web build, git diff --check, sync-skills, verify-ssot, hook 직접 fetch grep.

## 완료

- card-service hook 내부 직접 `fetch()`를 제거했다.
- 기존 hook 내부 `card-service-fetch.ts`를 feature root `card-service-fetch.ts`로 이동하고, 덱 목록/상세/생성/게스트 이관 요청을 모았다.
- card deck query key를 `card-service-query-keys.ts` factory로 이동했다.
- 기존 카드/덱 mutation 훅의 invalidate 대상도 새 factory를 사용하게 바꿨다.

## 검증 결과

- `pnpm --filter @yeon/web typecheck` 성공
- `pnpm --filter @yeon/web lint` 성공
- `pnpm --filter @yeon/web build` 성공
- `git diff --check` 성공
- `bash bin/sync-skills.sh --check` 성공
- `(cd /home/osuma/coding_stuffs/yeon && bash bin/verify-ssot.sh --project-only)` 성공
- `grep -RInE '\bfetch\(|cardDecksQueryKey|cardDeckDetailQueryKey' apps/web/src/features/card-service/hooks` 출력 없음
