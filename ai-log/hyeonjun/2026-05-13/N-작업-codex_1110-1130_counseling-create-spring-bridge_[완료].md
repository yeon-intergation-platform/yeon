# counseling create Spring bridge 전환

## 목표

- `apps/web/src/app/api/v1/counseling-records/route.ts`의 `createCounselingRecordAndQueueTranscription`, `createTextMemoRecord` 직접 호출을 제거한다.
- Spring `POST /counseling-records`가 텍스트 메모/음성 업로드/DB insert/전사 queue를 소유한다.
- 이 작업 후 `api/v1` route의 non-ServiceError `@/server/services/*` 직접 import 0개를 확인한다.

## 완료 내용

- Spring `POST /counseling-records` multipart API, service, repository를 추가했다.
- Spring audio storage에 upload 메서드를 추가해 상담 음성 업로드 저장을 backend로 옮겼다.
- Next counseling-records POST route는 validation 후 Spring create client만 호출한다.
- `api/v1` route의 non-ServiceError `@/server/services/*` 직접 import 0개를 확인했다.

## 검증

- `cd apps/backend && ./gradlew test --tests 'world.yeon.backend.counseling_record_create.controller.CounselingRecordCreateControllerTests' --tests 'world.yeon.backend.counseling_record_transcription.controller.CounselingRecordTranscriptionControllerTests'`
- `pnpm --filter @yeon/web typecheck`
- `pnpm --filter @yeon/web exec vitest run src/app/api/v1/counseling-records/__tests__/route.test.ts`
- `pnpm --filter @yeon/web build`
- `git diff --check`
- `bash bin/sync-skills.sh --check`
- `bash bin/verify-ssot.sh --project-only`
- `git grep -n "@/server/services/" -- apps/web/src/app/api/v1/**/route.ts apps/web/src/app/api/v1/**/_shared.ts | grep -v service-error` 결과 0개
