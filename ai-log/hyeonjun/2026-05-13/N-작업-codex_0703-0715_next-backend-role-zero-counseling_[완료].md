# Next backend role 0% - counseling segment mutation 이관 작업 로그

- 시작: 2026-05-13 07:03 KST
- 브랜치: `codex/next-backend-zero-counseling-20260513`
- 목표: `apps/web/src/app/api/v1/counseling-records/**` 잔여 backend-role 중 segment mutation 2개를 Spring 소유로 전환한다.
- 초기 확인:
  - `api/v1/counseling-records/[recordId]/segments/[segmentId]/route.ts`가 web legacy service를 직접 호출한다.
  - `api/v1/counseling-records/[recordId]/segments/bulk/route.ts`가 web legacy service를 직접 호출한다.
- 검증 예정:
  - backend mutation 관련 Gradle test
  - `pnpm --filter @yeon/web typecheck`
  - `pnpm --filter @yeon/web build`
  - `git diff --check`
  - `bash bin/sync-skills.sh --check`
  - `bash bin/verify-ssot.sh --project-only`

## 진행 결과

- Spring `counseling_record_mutation`에 segment 단건 수정 API를 추가했다.
- Spring `counseling_record_mutation`에 speaker bulk 수정 API를 추가했다.
- Next segment mutation route 2개는 legacy web service 대신 Spring client만 호출하게 변경했다.

## 검증

- `cd apps/backend && ./gradlew test --tests 'world.yeon.backend.counseling_record_mutation.controller.CounselingRecordMutationControllerTests'` 통과
- `pnpm --filter @yeon/web typecheck` 통과
- `pnpm --filter @yeon/web build` 통과
- `git diff --check` 통과
- `bash bin/sync-skills.sh --check` 통과
- `bash bin/verify-ssot.sh --project-only` 종료코드 0; 단, linked worktree의 `.git` file 구조 때문에 프로젝트 SSOT 점검은 스크립트가 건너뜀

## 남은 작업

- `analyze`, `chat`, `transcribe`, `analyze-trend`, `counseling-records/route.ts`는 아직 Next legacy service 호출이 남아 있다.
