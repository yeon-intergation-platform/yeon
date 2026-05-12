# onedrive import fetch boundary 정리

## 목표

- `use-onedrive.ts`의 직접 `fetch()`를 제거하고 OneDrive import fetch wrapper로 분리한다.
- 기존 연결 상태, 파일 로딩, 분석 preview, import callback 흐름은 유지한다.

## 검증

- 예정: web typecheck, web lint, web build, git diff --check, sync-skills, verify-ssot, 직접 fetch grep.

## 완료

- `use-onedrive.ts`의 상태/파일/분석/가져오기 직접 `fetch()` 호출을 제거했다.
- `onedrive-import-fetch.ts`에 OneDrive 네트워크 요청과 오류 파싱을 모았다.
- OneDrive import 타입을 `types.ts`로 분리해 hook-fetch 순환 의존을 만들지 않게 했다.

## 검증 결과

- `pnpm --filter @yeon/web typecheck` 성공
- `pnpm --filter @yeon/web lint` 성공
- `pnpm --filter @yeon/web build` 성공
- `git diff --check` 성공
- `bash bin/sync-skills.sh --check` 성공
- `(cd /home/osuma/coding_stuffs/yeon && bash bin/verify-ssot.sh --project-only)` 성공
- `grep -RIn '\bfetch(' apps/web/src/features/onedrive-import/hooks/use-onedrive.ts` 출력 없음
