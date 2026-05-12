# counseling records API boundary 작업 로그

## 목표

- `use-records`의 API endpoint/fetch 세부 지식을 feature api helper로 이동한다.
- route hook은 server-state 조합과 로컬 상태 병합에 집중하게 한다.

## 범위

- `features/counseling-record-workspace/api/counseling-records-api.ts` 추가
- `app/counseling-service/_hooks/use-records.ts`에서 API helper 사용
- query key와 기존 동작은 변경하지 않음

## 검증 예정

- `pnpm --filter @yeon/web typecheck`
- `pnpm --filter @yeon/web lint`
- `pnpm --filter @yeon/web build`
- `git diff --check`
- `bash bin/sync-skills.sh --check`
- `bash bin/verify-ssot.sh --project-only`

## 완료 내용

- 상담 기록 목록/상세/채팅 초기화 API helper를 `features/counseling-record-workspace/api/counseling-records-api.ts`로 분리했다.
- `use-records`는 query key와 local override/temp record 병합 책임만 유지하도록 API 호출 세부를 helper로 위임했다.

## 검증 결과

- `pnpm --filter @yeon/web exec vitest run src/app/counseling-service/_hooks/__tests__/use-records.test.ts` 통과
- `pnpm --filter @yeon/web typecheck` 통과
- `pnpm --filter @yeon/web lint` 통과
- `pnpm --filter @yeon/web build` 통과
- `git diff --check` 통과
- `bash bin/sync-skills.sh --check` 통과
- `bash bin/verify-ssot.sh --project-only` 통과
