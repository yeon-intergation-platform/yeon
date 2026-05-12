# 상담 목록 Next-side scheduling 제거

## 목표

- `GET /api/v1/counseling-records`에서 Spring list 응답 이후 Next가 전사 processing 스케줄링을 직접 수행하지 않게 한다.
- 목록 route는 인증, query validation, Spring list 호출, response contract 검증만 담당한다.

## 완료 근거

- `GET /api/v1/counseling-records`에서 `ensureCounselingRecordProcessingScheduledForListItems` 호출 제거.
- 검증 통과:
  - `pnpm --filter @yeon/web typecheck`
  - `pnpm --filter @yeon/web build`
  - `git diff --check`
  - `bash bin/sync-skills.sh --check`
  - `bash bin/verify-ssot.sh --project-only`
